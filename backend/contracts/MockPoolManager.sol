// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import "@uniswap/v4-core/src/types/PoolKey.sol";

contract MockPoolManager is IPoolManager {
    function initialize(PoolKey memory key, uint160 sqrtPriceX96) external returns (int24 tick) {
        return 0;
    }
    
    function getSlot0(bytes32 id) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee) {
        return (sqrtPriceX96, 0, 0, 0);
    }
    
    function getLiquidity(bytes32 id) external view returns (uint128 liquidity) {
        return 0;
    }
    
    function getPosition(bytes32 id, address owner, int24 tickLower, int24 tickUpper) external view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1) {
        return (0, 0, 0, 0, 0);
    }
    
    function modifyLiquidity(ModifyLiquidityParams memory params) external returns (BalanceDelta delta) {
        return BalanceDelta.wrap(0);
    }
    
    function swap(SwapParams memory params) external returns (BalanceDelta delta) {
        return BalanceDelta.wrap(0);
    }
    
    function donate(DonateParams memory params) external returns (BalanceDelta delta) {
        return BalanceDelta.wrap(0);
    }
    
    function take(TakeParams memory params) external returns (BalanceDelta delta) {
        return BalanceDelta.wrap(0);
    }
    
    function settle(SettleParams memory params) external returns (uint128 amount0, uint128 amount1) {
        return (0, 0);
    }
    
    function mint(address to, uint256 amount) external returns (uint256 id) {
        return 0;
    }
    
    function burn(uint256 id) external returns (uint256 amount0, uint256 amount1) {
        return (0, 0);
    }
    
    function collect(uint256 id, address to, uint128 amount0Max, uint128 amount1Max) external returns (uint128 amount0, uint128 amount1) {
        return (0, 0);
    }
}
