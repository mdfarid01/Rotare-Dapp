import { ethers } from "hardhat";

// Network-specific addresses
const NETWORK_ADDRESSES = {
  // Mainnet addresses (these are examples - you need to get the actual addresses)
  mainnet: {
    poolManager: "0x0000000000000000000000000000000000000000", // Replace with actual Uniswap v4 PoolManager address
    positionManager: "0x0000000000000000000000000000000000000000", // Replace with actual Uniswap v4 PositionManager address
    usdc: "0xA0b86a33E6441b8c4C8C0d4Ce0a8e0b8c4C8C0d4C", // Replace with actual USDC address
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH address
    ethUsdFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH/USD Chainlink feed
    usdcUsdFeed: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6", // USDC/USD Chainlink feed
  },
  // Sepolia testnet addresses (these are examples - you need to get the actual addresses)
  sepolia: {
    poolManager: "0x0000000000000000000000000000000000000000", // Replace with actual Uniswap v4 PoolManager address
    positionManager: "0x0000000000000000000000000000000000000000", // Replace with actual Uniswap v4 PositionManager address
    usdc: "0x0000000000000000000000000000000000000000", // Replace with actual USDC address
    weth: "0x0000000000000000000000000000000000000000", // Replace with actual WETH address
    ethUsdFeed: "0x0000000000000000000000000000000000000000", // Replace with actual ETH/USD Chainlink feed
    usdcUsdFeed: "0x0000000000000000000000000000000000000000", // Replace with actual USDC/USD Chainlink feed
  },
  // Local development - using mock addresses
  localhost: {
    poolManager: "0x0000000000000000000000000000000000000000",
    positionManager: "0x0000000000000000000000000000000000000000",
    usdc: "0x0000000000000000000000000000000000000000",
    weth: "0x0000000000000000000000000000000000000000",
    ethUsdFeed: "0x0000000000000000000000000000000000000000",
    usdcUsdFeed: "0x0000000000000000000000000000000000000000",
  },
  hardhat: {
    poolManager: "0x0000000000000000000000000000000000000000",
    positionManager: "0x0000000000000000000000000000000000000000",
    usdc: "0x0000000000000000000000000000000000000000",
    weth: "0x0000000000000000000000000000000000000000",
    ethUsdFeed: "0x0000000000000000000000000000000000000000",
    usdcUsdFeed: "0x0000000000000000000000000000000000000000",
  },
};

async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "hardhat" : network.name;
  
  console.log(`Deploying to network: ${networkName} (Chain ID: ${network.chainId})`);
  
  // Get the addresses for the current network
  const addresses = NETWORK_ADDRESSES[networkName as keyof typeof NETWORK_ADDRESSES];
  
  if (!addresses) {
    throw new Error(`No addresses configured for network: ${networkName}`);
  }
  
  console.log("Using addresses:", addresses);
  
  // Get the contract factory
  const UniswapV4Integrator = await ethers.getContractFactory("UniswapV4Integrator");
  
  // Deploy the contract
  console.log("Deploying UniswapV4Integrator...");
  const uniswapHook = await UniswapV4Integrator.deploy(
    addresses.poolManager,
    addresses.positionManager,
    addresses.usdc,
    addresses.weth,
    addresses.ethUsdFeed,
    addresses.usdcUsdFeed
  );
  
  await uniswapHook.waitForDeployment();
  
  const contractAddress = await uniswapHook.getAddress();
  console.log(`UniswapV4Integrator deployed to: ${contractAddress}`);
  
  // Verify the deployment
  console.log("Verifying deployment...");
  console.log("Pool Manager:", await uniswapHook.poolManager());
  console.log("Position Manager:", await uniswapHook.positionManager());
  console.log("USDC:", await uniswapHook.getUSDC());
  console.log("WETH:", await uniswapHook.getWETH());
  
  console.log("\nDeployment completed successfully!");
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Network: ${networkName}`);
  console.log(`Chain ID: ${network.chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
