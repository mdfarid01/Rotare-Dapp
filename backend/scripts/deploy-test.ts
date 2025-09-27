import { ethers } from "hardhat";

async function main() {
  console.log("Deploying test contracts...");
  
  // Deploy mock contracts first
  console.log("Deploying mock USDC...");
  const MockUSDC = await ethers.getContractFactory("contracts/MockUSDC.sol:MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log(`Mock USDC deployed to: ${usdcAddress}`);
  
  console.log("Deploying mock WETH...");
  const MockWETH = await ethers.getContractFactory("contracts/MockWETH.sol:MockWETH");
  const mockWETH = await MockWETH.deploy();
  await mockWETH.waitForDeployment();
  const wethAddress = await mockWETH.getAddress();
  console.log(`Mock WETH deployed to: ${wethAddress}`);
  
  console.log("Deploying mock PoolManager...");
  const MockPoolManager = await ethers.getContractFactory("contracts/MockPoolManager.sol:MockPoolManager");
  const mockPoolManager = await MockPoolManager.deploy();
  await mockPoolManager.waitForDeployment();
  const poolManagerAddress = await mockPoolManager.getAddress();
  console.log(`Mock PoolManager deployed to: ${poolManagerAddress}`);
  
  console.log("Deploying mock PositionManager...");
  const MockPositionManager = await ethers.getContractFactory("contracts/MockPositionManager.sol:MockPositionManager");
  const mockPositionManager = await MockPositionManager.deploy();
  await mockPositionManager.waitForDeployment();
  const positionManagerAddress = await mockPositionManager.getAddress();
  console.log(`Mock PositionManager deployed to: ${positionManagerAddress}`);
  
  console.log("Deploying mock Chainlink feeds...");
  const MockPriceFeed = await ethers.getContractFactory("contracts/MockPriceFeed.sol:MockPriceFeed");
  const mockEthUsdFeed = await MockPriceFeed.deploy();
  await mockEthUsdFeed.waitForDeployment();
  const ethUsdFeedAddress = await mockEthUsdFeed.getAddress();
  console.log(`Mock ETH/USD feed deployed to: ${ethUsdFeedAddress}`);
  
  const mockUsdcUsdFeed = await MockPriceFeed.deploy();
  await mockUsdcUsdFeed.waitForDeployment();
  const usdcUsdFeedAddress = await mockUsdcUsdFeed.getAddress();
  console.log(`Mock USDC/USD feed deployed to: ${usdcUsdFeedAddress}`);
  
  // Now deploy the main contract
  console.log("Deploying UniswapV4Integrator...");
  const UniswapV4Integrator = await ethers.getContractFactory("UniswapV4Integrator");
  const uniswapHook = await UniswapV4Integrator.deploy(
    poolManagerAddress,
    positionManagerAddress,
    usdcAddress,
    wethAddress,
    ethUsdFeedAddress,
    usdcUsdFeedAddress
  );
  
  await uniswapHook.waitForDeployment();
  const contractAddress = await uniswapHook.getAddress();
  console.log(`UniswapV4Integrator deployed to: ${contractAddress}`);
  
  console.log("\n=== Deployment Summary ===");
  console.log(`UniswapV4Integrator: ${contractAddress}`);
  console.log(`Mock USDC: ${usdcAddress}`);
  console.log(`Mock WETH: ${wethAddress}`);
  console.log(`Mock PoolManager: ${poolManagerAddress}`);
  console.log(`Mock PositionManager: ${positionManagerAddress}`);
  console.log(`Mock ETH/USD Feed: ${ethUsdFeedAddress}`);
  console.log(`Mock USDC/USD Feed: ${usdcUsdFeedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
