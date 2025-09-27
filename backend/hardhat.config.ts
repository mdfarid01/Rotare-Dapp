import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Add more networks as needed
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  remappings: [
    "permit2/=node_modules/@uniswap/permit2/src/",
    "@openzeppelin/=node_modules/@openzeppelin/",
    "@chainlink/=node_modules/@chainlink/",
    "@uniswap/=node_modules/@uniswap/"
  ],
  settings: {
    remappings: [
      "permit2/=node_modules/@uniswap/permit2/src/",
      "@openzeppelin/=node_modules/@openzeppelin/",
      "@chainlink/=node_modules/@chainlink/",
      "@uniswap/=node_modules/@uniswap/"
    ]
  }
};

export default config;
