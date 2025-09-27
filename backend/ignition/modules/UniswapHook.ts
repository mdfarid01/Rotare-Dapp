import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UniswapHookModule = buildModule("UniswapHookModule", (m) => {
  // Constructor parameters for UniswapHook
  // These addresses need to be provided for the specific network
  const poolManager = m.getParameter("poolManager", "0x0000000000000000000000000000000000000000");
  const positionManager = m.getParameter("positionManager", "0x0000000000000000000000000000000000000000");
  const usdc = m.getParameter("usdc", "0x0000000000000000000000000000000000000000");
  const weth = m.getParameter("weth", "0x0000000000000000000000000000000000000000");
  const ethUsdFeed = m.getParameter("ethUsdFeed", "0x0000000000000000000000000000000000000000");
  const usdcUsdFeed = m.getParameter("usdcUsdFeed", "0x0000000000000000000000000000000000000000");

  // Deploy the UniswapHook contract
  const uniswapHook = m.contract("UniswapV4Integrator", [
    poolManager,
    positionManager,
    usdc,
    weth,
    ethUsdFeed,
    usdcUsdFeed
  ]);

  return { uniswapHook };
});

export default UniswapHookModule;
