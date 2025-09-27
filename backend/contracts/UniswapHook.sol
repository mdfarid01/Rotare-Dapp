// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Standard npm package imports
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// Uniswap v4 imports
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";

/// @title UniswapV4Integrator - Fixed Version
/// @notice Integrates ChainPot with Uniswap v4 for yield generation through LP positions
/// @dev Provides liquidity to Uniswap v4 pools to generate yield for pot participants
contract UniswapV4Integrator is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using CurrencyLibrary for Currency;
    using PoolIdLibrary for PoolKey;

    // Contract interfaces
    IPoolManager public immutable poolManager;
    IPositionManager public immutable positionManager;
    IERC20 public immutable usdc;
    IERC20 public immutable weth;
    
    // Core contract addresses
    address public auctionEngine;
    address public escrow;
    
    // Pool configuration
    uint24 public constant POOL_FEE = 3000; // 0.3%
    int24 public constant TICK_SPACING = 60;
    
    // Price feeds
    AggregatorV3Interface public immutable ethUsdFeed;
    AggregatorV3Interface public immutable usdcUsdFeed;
    
    // LP Position tracking
    struct LPPosition {
        uint256 tokenId;
        uint128 liquidity;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0;
        uint256 amount1;
        uint256 fees0Collected;
        uint256 fees1Collected;
        uint256 potId;
        bool active;
        PoolId poolId;
    }
    
    // Storage
    mapping(uint256 => LPPosition) public lpPositions; // potId => LP position
    mapping(uint256 => uint256) public potBalances; // potId => total balance
    mapping(uint256 => uint256) public potYields; // potId => accumulated yield
    uint256 public totalValueLocked;
    uint256 public lastUpdateTime;
    
    // Pool key for USDC/WETH pair
    PoolKey public poolKey;
    PoolId public poolId;
    
    // Events
    event LiquidityProvided(uint256 indexed potId, uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);
    event LiquidityRemoved(uint256 indexed potId, uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);
    event FeesCollected(uint256 indexed potId, uint256 fees0, uint256 fees1);
    event YieldDistributed(uint256 indexed potId, uint256 amount);
    event PoolInitialized(PoolId indexed poolId, uint160 sqrtPriceX96);
    
    // Custom errors
    error InsufficientBalance();
    error InvalidPotId();
    error NotAuthorized();
    error PositionNotFound();
    error InvalidAmount();
    error PoolNotInitialized();
    error InvalidAddress();

    constructor(
        address _poolManager,
        address _positionManager,
        address _usdc,
        address _weth,
        address _ethUsdFeed,
        address _usdcUsdFeed
    ) Ownable(msg.sender) {
        if (_poolManager == address(0) || _positionManager == address(0) || 
            _usdc == address(0) || _weth == address(0) ||
            _ethUsdFeed == address(0) || _usdcUsdFeed == address(0)) {
            revert InvalidAddress();
        }

        poolManager = IPoolManager(_poolManager);
        positionManager = IPositionManager(_positionManager);
        usdc = IERC20(_usdc);
        weth = IERC20(_weth);
        ethUsdFeed = AggregatorV3Interface(_ethUsdFeed);
        usdcUsdFeed = AggregatorV3Interface(_usdcUsdFeed);
        lastUpdateTime = block.timestamp;

        // Initialize pool key
        poolKey = PoolKey({
            currency0: Currency.wrap(_usdc < _weth ? _usdc : _weth),
            currency1: Currency.wrap(_usdc < _weth ? _weth : _usdc),
            fee: POOL_FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(address(0))
        });
        
        poolId = poolKey.toId();

        // Approve tokens to position manager
        usdc.forceApprove(_positionManager, type(uint256).max);
        weth.forceApprove(_positionManager, type(uint256).max);
    }
    
    // -------------------- Modifiers --------------------
    
    modifier onlyAuthorized() {
        if (msg.sender != auctionEngine && msg.sender != escrow && msg.sender != owner()) {
            revert NotAuthorized();
        }
        _;
    }

    modifier validPotId(uint256 potId) {
        if (potId == 0) revert InvalidPotId();
        _;
    }

    modifier validAmount(uint256 amount) {
        if (amount == 0) revert InvalidAmount();
        _;
    }
    
    // -------------------- View Functions --------------------
    
    /// @notice Get the USDC token address
    /// @return Address of the USDC token contract
    function getUSDC() external view returns (address) {
        return address(usdc);
    }

    /// @notice Get the WETH token address
    /// @return Address of the WETH token contract
    function getWETH() external view returns (address) {
        return address(weth);
    }

    /// @notice Get pool information
    /// @return The pool key and pool ID
    function getPoolInfo() external view returns (PoolKey memory, PoolId) {
        return (poolKey, poolId);
    }

    /// @notice Check if a pot has an active LP position
    /// @param potId The pot identifier
    /// @return Whether the pot has an active position
    function hasActivePosition(uint256 potId) external view returns (bool) {
        return lpPositions[potId].active;
    }
    
    // -------------------- Admin Functions --------------------
    
    function setAuctionEngine(address _auctionEngine) external onlyOwner {
        if (_auctionEngine == address(0)) revert InvalidAddress();
        auctionEngine = _auctionEngine;
    }
    
    function setEscrowContract(address _escrow) external onlyOwner {
        if (_escrow == address(0)) revert InvalidAddress();
        escrow = _escrow;
    }

    /// @notice Initialize the pool if not already initialized
    /// @param sqrtPriceX96 The initial sqrt price of the pool
    function initializePool(uint160 sqrtPriceX96) external onlyOwner {
        poolManager.initialize(poolKey, sqrtPriceX96);
        emit PoolInitialized(poolId, sqrtPriceX96);
    }
    
    // -------------------- Core Functions --------------------
    
    /// @notice Provide liquidity for a pot using Uniswap v4
    /// @param potId The pot identifier
    /// @param amount Amount to provide as liquidity (in wei)
    function provideLiquidity(uint256 potId, uint256 amount) 
        external 
        payable
        onlyAuthorized 
        nonReentrant 
        validPotId(potId) 
        validAmount(amount) 
    {
        // Ensure we have enough ETH
        if (msg.value < amount) revert InsufficientBalance();
        
        // Convert half to USDC, keep half as WETH
        uint256 ethAmount = amount / 2;
        uint256 usdcAmount = _convertETHToUSDC(ethAmount);
        
        // Wrap ETH to WETH
        (bool success, ) = address(weth).call{value: ethAmount}("");
        require(success, "WETH wrap failed");
        
        // Get USDC (in real implementation, you'd swap ETH for USDC)
        // For simplicity, assuming contract has USDC or using a mock transfer
        
        // Define tick range for full range liquidity
        int24 tickLower = TickMath.MIN_TICK;
        int24 tickUpper = TickMath.MAX_TICK;
        
        // Ensure tick alignment with tick spacing
        tickLower = (tickLower / TICK_SPACING) * TICK_SPACING;
        tickUpper = (tickUpper / TICK_SPACING) * TICK_SPACING;
        
        // Prepare mint action using the new Uniswap v4 API
        bytes memory mintAction = abi.encode(
            Actions.MINT_POSITION,
            abi.encode(
                poolKey,
                tickLower,
                tickUpper,
                uint128(amount), // Simplified liquidity calculation
                address(usdc) < address(weth) ? uint128(usdcAmount) : uint128(ethAmount), // amount0Max
                address(usdc) < address(weth) ? uint128(ethAmount) : uint128(usdcAmount), // amount1Max
                address(this), // recipient
                "" // hookData
            )
        );
        
        // Encode the modifyLiquidities call
        bytes memory modifyLiquiditiesCall = abi.encode(
            mintAction,
            block.timestamp + 300 // deadline
        );
        
        // Execute the mint
        positionManager.modifyLiquidities{value: 0}(modifyLiquiditiesCall, block.timestamp + 300);
        
        // Get the token ID (this would be the next token ID before the call)
        uint256 tokenId = positionManager.nextTokenId() - 1;
        
        // Store LP position
        lpPositions[potId] = LPPosition({
            tokenId: tokenId,
            liquidity: uint128(amount),
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0: address(usdc) < address(weth) ? usdcAmount : ethAmount,
            amount1: address(usdc) < address(weth) ? ethAmount : usdcAmount,
            fees0Collected: 0,
            fees1Collected: 0,
            potId: potId,
            active: true,
            poolId: poolId
        });
        
        // Update balances
        potBalances[potId] += amount;
        totalValueLocked += amount;
        
        emit LiquidityProvided(potId, tokenId, uint128(amount), 
            address(usdc) < address(weth) ? usdcAmount : ethAmount,
            address(usdc) < address(weth) ? ethAmount : usdcAmount);
    }
    
    /// @notice Remove liquidity for a pot
    /// @param potId The pot identifier
    /// @param liquidityToRemove Amount of liquidity to remove
    function removeLiquidity(uint256 potId, uint128 liquidityToRemove) 
        external 
        onlyAuthorized 
        nonReentrant 
        validPotId(potId) 
    {
        LPPosition storage position = lpPositions[potId];
        if (!position.active) revert PositionNotFound();
        if (liquidityToRemove > position.liquidity) revert InsufficientBalance();
        
        // Prepare burn action using the new Uniswap v4 API
        bytes memory burnAction = abi.encode(
            Actions.BURN_POSITION,
            abi.encode(
                position.tokenId,
                liquidityToRemove,
                0, // amount0Min - Accept any amount of tokens out
                0, // amount1Min
                "" // hookData
            )
        );
        
        // Encode the modifyLiquidities call
        bytes memory modifyLiquiditiesCall = abi.encode(
            burnAction,
            block.timestamp + 300 // deadline
        );
        
        // Execute the burn
        positionManager.modifyLiquidities{value: 0}(modifyLiquiditiesCall, block.timestamp + 300);
        
        // Update position
        position.liquidity -= liquidityToRemove;
        
        // Calculate removed value (simplified - in real implementation you'd get actual amounts)
        uint256 removedValue = (position.amount0 + position.amount1) * liquidityToRemove / position.liquidity;
        potBalances[potId] = potBalances[potId] > removedValue ? potBalances[potId] - removedValue : 0;
        totalValueLocked = totalValueLocked > removedValue ? totalValueLocked - removedValue : 0;
        
        if (position.liquidity == 0) {
            position.active = false;
        }
        
        emit LiquidityRemoved(potId, position.tokenId, liquidityToRemove, 0, 0); // Simplified amounts
    }
    
    /// @notice Collect fees from LP position
    /// @param potId The pot identifier
    function collectFees(uint256 potId) 
        external 
        onlyAuthorized 
        nonReentrant 
        validPotId(potId) 
        returns (uint256 fees0, uint256 fees1)
    {
        LPPosition storage position = lpPositions[potId];
        if (!position.active) revert PositionNotFound();
        
        // Prepare collect action using DECREASE_LIQUIDITY with 0 liquidity to collect fees
        bytes memory collectAction = abi.encode(
            Actions.DECREASE_LIQUIDITY,
            abi.encode(
                position.tokenId,
                0, // liquidity - 0 means just collect fees
                0, // amount0Min - accept any amount
                0, // amount1Min - accept any amount
                "" // hookData
            )
        );
        
        // Encode the modifyLiquidities call
        bytes memory modifyLiquiditiesCall = abi.encode(
            collectAction,
            block.timestamp + 300 // deadline
        );
        
        // Execute the collect
        positionManager.modifyLiquidities{value: 0}(modifyLiquiditiesCall, block.timestamp + 300);
        
        // Note: In the current implementation, we can't easily get the exact amounts collected
        // This would require more complex integration with the pool manager
        // For now, we'll use a simplified approach
        fees0 = 0; // Would need to track actual collected amounts
        fees1 = 0; // Would need to track actual collected amounts
        
        position.fees0Collected += fees0;
        position.fees1Collected += fees1;
        
        // Convert fees to ETH value and add to pot yields
        uint256 totalFeesInEth = fees0 + fees1; // Simplified conversion
        potYields[potId] += totalFeesInEth;
        
        emit FeesCollected(potId, fees0, fees1);
    }
    
    /// @notice Get current yield for a pot
    /// @param potId The pot identifier
    /// @return Current yield amount
    function getCurrentYield(uint256 potId) external view validPotId(potId) returns (uint256) {
        return potYields[potId];
    }
    
    /// @notice Get pot balance including yield
    /// @param potId The pot identifier
    /// @return Total balance including yield
    function getTotalBalance(uint256 potId) external view validPotId(potId) returns (uint256) {
        return potBalances[potId] + potYields[potId];
    }

    /// @notice Get detailed LP position information
    /// @param potId The pot identifier
    /// @return LP position details
    function getLPPosition(uint256 potId) external view validPotId(potId) returns (LPPosition memory) {
        return lpPositions[potId];
    }
    
    /// @notice Withdraw yield for distribution
    /// @param potId The pot identifier
    /// @param amount Amount to withdraw
    function withdrawYield(uint256 potId, uint256 amount) 
        external 
        onlyAuthorized 
        nonReentrant 
        validPotId(potId)
        validAmount(amount)
        returns (uint256) 
    {
        if (potYields[potId] < amount) revert InsufficientBalance();
        
        potYields[potId] -= amount;
        
        // Transfer yield to caller (usually escrow)
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit YieldDistributed(potId, amount);
        return amount;
    }

    /// @notice Compound fees back into the LP position
    /// @param potId The pot identifier
    function compoundFees(uint256 potId) external onlyAuthorized nonReentrant validPotId(potId) {
        // Collect fees first
        this.collectFees(potId);
        
        // Use collected fees to add more liquidity (simplified implementation)
        uint256 feesToCompound = potYields[potId];
        if (feesToCompound > 0) {
            potYields[potId] = 0;
            // In a real implementation, you would add this back to the LP position
            potBalances[potId] += feesToCompound;
            totalValueLocked += feesToCompound;
        }
    }
    
    /// @notice Emergency function to close all positions
    function emergencyClosePosition(uint256 potId) external onlyOwner nonReentrant validPotId(potId) {
        LPPosition storage position = lpPositions[potId];
        if (position.active && position.liquidity > 0) {
            // Close the position completely using BURN_POSITION
            bytes memory burnAction = abi.encode(
                Actions.BURN_POSITION,
                abi.encode(
                    position.tokenId,
                    position.liquidity,
                    0, // amount0Min - accept any amount
                    0, // amount1Min - accept any amount
                    "" // hookData
                )
            );
            
            // Encode the modifyLiquidities call
            bytes memory modifyLiquiditiesCall = abi.encode(
                burnAction,
                block.timestamp + 300 // deadline
            );
            
            // Execute the burn
            positionManager.modifyLiquidities{value: 0}(modifyLiquiditiesCall, block.timestamp + 300);
            
            position.active = false;
            position.liquidity = 0;
        }
    }
    
    // -------------------- Internal Functions --------------------
    
    /// @notice Convert ETH to USDC using price feed
    /// @param ethAmount Amount of ETH to convert
    /// @return USDC amount
    function _convertETHToUSDC(uint256 ethAmount) internal view returns (uint256) {
        (, int256 price, , uint256 updatedAt, ) = ethUsdFeed.latestRoundData();
        require(price > 0 && updatedAt > block.timestamp - 3600, "Invalid or stale price");
        
        // Convert ETH to USDC (price is in 8 decimals for Chainlink)
        return (ethAmount * uint256(price)) / 1e8; // Adjust for USDC decimals (6) vs ETH (18)
    }
    
    /// @notice Get latest ETH price from Chainlink
    /// @return Latest ETH/USD price
    function _getLatestPrice() internal view returns (uint256) {
        (, int256 price, , uint256 updatedAt, ) = ethUsdFeed.latestRoundData();
        require(price > 0 && updatedAt > block.timestamp - 3600, "Invalid or stale price");
        return uint256(price);
    }

    /// @notice Calculate optimal amounts for liquidity provision
    /// @param amount0 Amount of token0
    /// @param amount1 Amount of token1
    /// @return Optimal amounts for current pool price
    function _calculateOptimalAmounts(uint256 amount0, uint256 amount1) 
        internal 
        pure 
        returns (uint256, uint256) 
    {
        // Simplified implementation - in production, you'd calculate based on current pool price
        return (amount0, amount1);
    }
    
    // -------------------- Receive Function --------------------
    
    /// @notice Accept ETH deposits
    receive() external payable {
        // Accept ETH for liquidity provision
    }

    /// @notice Fallback function
    fallback() external payable {
        revert("Function not found");
    }
}