// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title CitreaNativeYieldManager
/// @notice Native BTC-backed yield generation for ChainPot on Citrea
/// @dev Generates yield through Bitcoin staking and network fee collection mechanisms


contract CitreaNativeYieldManager is Ownable, ReentrancyGuard, Pausable {
    
    // ==================== Constants & Immutables ====================
    
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points
    uint256 public constant MIN_STAKE_AMOUNT = 0.001 ether; // Minimum BTC to stake
    uint256 public constant YIELD_CALCULATION_PERIOD = 1 days;
    uint256 public constant MAX_YIELD_RATE = 800; // 8% max annual yield
    uint256 public constant MIN_YIELD_RATE = 50;  // 0.5% min annual yield
    
    // ==================== State Variables ====================
    
    struct StakeInfo {
        uint256 principal;
        uint256 accruedYield;
        uint256 lastUpdateTime;
        uint256 potId;
        bool isActive;
    }
    
    struct YieldPool {
        uint256 totalStaked;
        uint256 totalYieldGenerated;
        uint256 currentYieldRate; // in basis points (annual)
        uint256 lastYieldUpdate;
        uint256 participantCount;
    }
    
    // Core mappings
    mapping(address => StakeInfo[]) public userStakes;
    mapping(uint256 => StakeInfo[]) public potStakes; // potId => stakes
    mapping(address => uint256) public userTotalStaked;
    mapping(uint256 => uint256) public potTotalStaked;
    
    // Yield management
    YieldPool public globalYieldPool;
    mapping(address => bool) public authorizedCallers;
    
    // Network fee collection
    uint256 public networkFeePool;
    uint256 public protocolFeeRate = 200; // 2% of yield goes to protocol
    
    // Emergency controls
    uint256 public emergencyWithdrawalDelay = 7 days;
    mapping(address => uint256) public emergencyRequestTime;
    
    // ==================== Events ====================
    
    event BtcStaked(address indexed user, uint256 amount, uint256 potId, uint256 stakeIndex);
    event BtcUnstaked(address indexed user, uint256 amount, uint256 yield, uint256 stakeIndex);
    event YieldAccrued(address indexed user, uint256 amount, uint256 stakeIndex);
    event YieldRateUpdated(uint256 oldRate, uint256 newRate);
    event NetworkFeesCollected(uint256 amount);
    event ProtocolFeeRateUpdated(uint256 oldRate, uint256 newRate);
    event EmergencyWithdrawalRequested(address indexed user, uint256 requestTime);
    event EmergencyWithdrawalExecuted(address indexed user, uint256 amount);
    event AuthorizedCallerUpdated(address indexed caller, bool authorized);
    
    // ==================== Constructor ====================
    
    constructor() Ownable(msg.sender) {
        globalYieldPool.currentYieldRate = 400; // Start with 4% APY
        globalYieldPool.lastYieldUpdate = block.timestamp;
    }
    
    // ==================== Modifiers ====================
    
    modifier onlyAuthorized() {
        require(
            authorizedCallers[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }
    
    modifier validStakeIndex(address user, uint256 stakeIndex) {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        require(userStakes[user][stakeIndex].isActive, "Stake not active");
        _;
    }
    
    // ==================== Admin Functions ====================
    
    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        require(caller != address(0), "Invalid caller address");
        authorizedCallers[caller] = authorized;
        emit AuthorizedCallerUpdated(caller, authorized);
    }
    
    function updateYieldRate(uint256 newRate) external onlyOwner {
        require(newRate >= MIN_YIELD_RATE && newRate <= MAX_YIELD_RATE, "Invalid yield rate");
        
        // Update all existing stakes before changing rate
        _updateGlobalYield();
        
        uint256 oldRate = globalYieldPool.currentYieldRate;
        globalYieldPool.currentYieldRate = newRate;
        
        emit YieldRateUpdated(oldRate, newRate);
    }
    
    function updateProtocolFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= 500, "Fee rate too high"); // Max 5%
        
        uint256 oldRate = protocolFeeRate;
        protocolFeeRate = newRate;
        
        emit ProtocolFeeRateUpdated(oldRate, newRate);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ==================== Core Staking Functions ====================
    
    /// @notice Stake BTC for yield generation
    /// @param potId The pot ID this stake belongs to (0 for individual staking)
    function stakeBtc(uint256 potId) external payable whenNotPaused nonReentrant {
        require(msg.value >= MIN_STAKE_AMOUNT, "Stake amount too low");
        
        // Update global yield before new stake
        _updateGlobalYield();
        
        // Create new stake
        StakeInfo memory newStake = StakeInfo({
            principal: msg.value,
            accruedYield: 0,
            lastUpdateTime: block.timestamp,
            potId: potId,
            isActive: true
        });
        
        userStakes[msg.sender].push(newStake);
        uint256 stakeIndex = userStakes[msg.sender].length - 1;
        
        if (potId > 0) {
            potStakes[potId].push(newStake);
            potTotalStaked[potId] += msg.value;
        }
        
        // Update totals
        userTotalStaked[msg.sender] += msg.value;
        globalYieldPool.totalStaked += msg.value;
        globalYieldPool.participantCount += 1;
        
        emit BtcStaked(msg.sender, msg.value, potId, stakeIndex);
    }
    
    /// @notice Stake BTC on behalf of another user (for pot operations)
    function stakeBtcForUser(address user, uint256 potId) 
        external 
        payable 
        onlyAuthorized 
        whenNotPaused 
        nonReentrant 
    {
        require(user != address(0), "Invalid user address");
        require(msg.value >= MIN_STAKE_AMOUNT, "Stake amount too low");
        
        _updateGlobalYield();
        
        StakeInfo memory newStake = StakeInfo({
            principal: msg.value,
            accruedYield: 0,
            lastUpdateTime: block.timestamp,
            potId: potId,
            isActive: true
        });
        
        userStakes[user].push(newStake);
        uint256 stakeIndex = userStakes[user].length - 1;
        
        if (potId > 0) {
            potStakes[potId].push(newStake);
            potTotalStaked[potId] += msg.value;
        }
        
        userTotalStaked[user] += msg.value;
        globalYieldPool.totalStaked += msg.value;
        globalYieldPool.participantCount += 1;
        
        emit BtcStaked(user, msg.value, potId, stakeIndex);
    }
    
    /// @notice Unstake BTC with accumulated yield
    function unstakeBtc(uint256 stakeIndex) 
        external 
        whenNotPaused 
        nonReentrant 
        validStakeIndex(msg.sender, stakeIndex)
    {
        _unstakeBtcInternal(msg.sender, stakeIndex, msg.sender);
    }
    
    /// @notice Unstake BTC for a user (authorized callers only)
    function unstakeBtcForUser(address user, uint256 stakeIndex, address recipient) 
        external 
        onlyAuthorized 
        whenNotPaused 
        nonReentrant 
        validStakeIndex(user, stakeIndex)
    {
        require(recipient != address(0), "Invalid recipient");
        _unstakeBtcInternal(user, stakeIndex, recipient);
    }
    
    /// @notice Internal unstaking logic
    function _unstakeBtcInternal(address user, uint256 stakeIndex, address recipient) internal {
        StakeInfo storage stake = userStakes[user][stakeIndex];
        
        // Calculate current yield
        uint256 currentYield = _calculateYield(user, stakeIndex);
        stake.accruedYield += currentYield;
        
        uint256 totalAmount = stake.principal + stake.accruedYield;
        uint256 protocolFee = (stake.accruedYield * protocolFeeRate) / BASIS_POINTS;
        uint256 userAmount = totalAmount - protocolFee;
        
        // Update state
        uint256 potId = stake.potId;
        stake.isActive = false;
        
        userTotalStaked[user] -= stake.principal;
        globalYieldPool.totalStaked -= stake.principal;
        globalYieldPool.participantCount -= 1;
        
        if (potId > 0) {
            potTotalStaked[potId] -= stake.principal;
        }
        
        // Collect protocol fee
        if (protocolFee > 0) {
            networkFeePool += protocolFee;
        }
        
        // Transfer funds
        (bool success, ) = payable(recipient).call{value: userAmount}("");
        require(success, "Transfer failed");
        
        emit BtcUnstaked(user, stake.principal, stake.accruedYield, stakeIndex);
    }
    
    // ==================== Yield Calculation ====================
    
    /// @notice Calculate current yield for a stake
    function _calculateYield(address user, uint256 stakeIndex) internal view returns (uint256) {
        StakeInfo storage stake = userStakes[user][stakeIndex];
        if (!stake.isActive) return 0;
        
        uint256 timeElapsed = block.timestamp - stake.lastUpdateTime;
        uint256 annualYield = (stake.principal * globalYieldPool.currentYieldRate) / BASIS_POINTS;
        uint256 currentYield = (annualYield * timeElapsed) / 365 days;
        
        return currentYield;
    }
    
    /// @notice Update yield for a specific stake
    function updateStakeYield(address user, uint256 stakeIndex) 
        external 
        validStakeIndex(user, stakeIndex)
    {
        StakeInfo storage stake = userStakes[user][stakeIndex];
        uint256 newYield = _calculateYield(user, stakeIndex);
        
        stake.accruedYield += newYield;
        stake.lastUpdateTime = block.timestamp;
        
        globalYieldPool.totalYieldGenerated += newYield;
        
        emit YieldAccrued(user, newYield, stakeIndex);
    }
    
    /// @notice Update global yield pool
    function _updateGlobalYield() internal {
        globalYieldPool.lastYieldUpdate = block.timestamp;
        
        // Auto-adjust yield rate based on network activity
        if (globalYieldPool.totalStaked > 100 ether) {
            // High activity - slightly reduce rate
            if (globalYieldPool.currentYieldRate > MIN_YIELD_RATE + 50) {
                globalYieldPool.currentYieldRate -= 10;
            }
        } else if (globalYieldPool.totalStaked < 10 ether) {
            // Low activity - increase rate to incentivize
            if (globalYieldPool.currentYieldRate < MAX_YIELD_RATE - 50) {
                globalYieldPool.currentYieldRate += 10;
            }
        }
    }
    
    // ==================== Network Fee Collection ====================
    
    /// @notice Collect network fees to boost yield pool
    function collectNetworkFees() external payable onlyAuthorized {
        require(msg.value > 0, "No fees to collect");
        
        networkFeePool += msg.value;
        emit NetworkFeesCollected(msg.value);
    }
    
    /// @notice Distribute collected fees to active stakers
    function distributeFees() external onlyAuthorized nonReentrant {
        require(networkFeePool > 0, "No fees to distribute");
        require(globalYieldPool.totalStaked > 0, "No active stakes");
        
        uint256 feesToDistribute = networkFeePool;
        networkFeePool = 0;
        
        // Pro-rata distribution would require iteration over all stakes
        // For simplicity, add to global yield pool
        globalYieldPool.totalYieldGenerated += feesToDistribute;
    }
    
    // ==================== Emergency Functions ====================
    
    /// @notice Request emergency withdrawal (with delay)
    function requestEmergencyWithdrawal() external {
        emergencyRequestTime[msg.sender] = block.timestamp;
        emit EmergencyWithdrawalRequested(msg.sender, block.timestamp);
    }
    
    /// @notice Execute emergency withdrawal after delay
    function executeEmergencyWithdrawal() external nonReentrant {
        require(
            emergencyRequestTime[msg.sender] > 0 &&
            block.timestamp >= emergencyRequestTime[msg.sender] + emergencyWithdrawalDelay,
            "Emergency delay not met"
        );
        
        uint256 totalToWithdraw = userTotalStaked[msg.sender];
        require(totalToWithdraw > 0, "No funds to withdraw");
        
        // Mark all user stakes as inactive
        StakeInfo[] storage stakes = userStakes[msg.sender];
        for (uint256 i = 0; i < stakes.length; i++) {
            if (stakes[i].isActive) {
                stakes[i].isActive = false;
                globalYieldPool.totalStaked -= stakes[i].principal;
                globalYieldPool.participantCount -= 1;
            }
        }
        
        userTotalStaked[msg.sender] = 0;
        emergencyRequestTime[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: totalToWithdraw}("");
        require(success, "Emergency withdrawal failed");
        
        emit EmergencyWithdrawalExecuted(msg.sender, totalToWithdraw);
    }
    
    // ==================== View Functions ====================
    
    function getUserStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }
    
    function getUserStake(address user, uint256 stakeIndex) 
        external 
        view 
        returns (StakeInfo memory) 
    {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        return userStakes[user][stakeIndex];
    }
    
    function getUserCurrentYield(address user, uint256 stakeIndex) 
        external 
        view 
        returns (uint256) 
    {
        if (stakeIndex >= userStakes[user].length) return 0;
        return _calculateYield(user, stakeIndex);
    }
    
    function getUserTotalYield(address user) external view returns (uint256 totalYield) {
        StakeInfo[] storage stakes = userStakes[user];
        for (uint256 i = 0; i < stakes.length; i++) {
            totalYield += stakes[i].accruedYield + _calculateYield(user, i);
        }
    }
    
    function getPotTotalStaked(uint256 potId) external view returns (uint256) {
        return potTotalStaked[potId];
    }
    
    function getGlobalYieldPool() 
        external 
        view 
        returns (
            uint256 totalStaked,
            uint256 totalYieldGenerated,
            uint256 currentYieldRate,
            uint256 participantCount
        ) 
    {
        return (
            globalYieldPool.totalStaked,
            globalYieldPool.totalYieldGenerated,
            globalYieldPool.currentYieldRate,
            globalYieldPool.participantCount
        );
    }
    
    function getCurrentAPY() external view returns (uint256) {
        return globalYieldPool.currentYieldRate;
    }
    
    function getNetworkFeePool() external view returns (uint256) {
        return networkFeePool;
    }
    
    // ==================== Owner Functions ====================
    
    function withdrawProtocolFees(address recipient, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(recipient != address(0), "Invalid recipient");
        require(amount <= networkFeePool, "Insufficient fees");
        
        networkFeePool -= amount;
        
        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Fee withdrawal failed");
    }
    
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
    
    // ==================== Receive Function ====================
    
    receive() external payable {
        // Allow contract to receive BTC
        if (msg.value > 0) {
            networkFeePool += msg.value;
            emit NetworkFeesCollected(msg.value);
        }
    }
    
    fallback() external payable {
        revert("Function not found");
    }
}