# UniswapHook Contract Deployment Guide

## Prerequisites

1. **Node.js and npm** installed
2. **Hardhat** configured (already done)
3. **Private key** for the account you want to deploy from
4. **RPC URL** for the target network (Infura, Alchemy, etc.)

## Environment Setup

Create a `.env` file in the project root with the following variables:

```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs for different networks
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_project_id

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Required Addresses

Before deploying, you need to update the addresses in `scripts/deploy.ts` for your target network:

### Mainnet Addresses (examples - get actual addresses)
- **PoolManager**: Uniswap v4 PoolManager contract address
- **PositionManager**: Uniswap v4 PositionManager contract address  
- **USDC**: USDC token contract address
- **WETH**: WETH token contract address
- **ETH/USD Feed**: Chainlink ETH/USD price feed address
- **USDC/USD Feed**: Chainlink USDC/USD price feed address

### Testnet Addresses
- Update the `sepolia` section in `scripts/deploy.ts` with testnet addresses

## Deployment Commands

### 1. Compile the contract
```bash
npx hardhat compile
```

### 2. Deploy to local network (for testing)
```bash
# Start local node
npx hardhat node

# In another terminal, deploy
npx hardhat run scripts/deploy.ts --network localhost
```

### 3. Deploy to testnet (Sepolia)
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### 4. Deploy to mainnet
```bash
npx hardhat run scripts/deploy.ts --network mainnet
```

### 5. Deploy using Ignition (alternative method)
```bash
# Deploy with parameters
npx hardhat ignition deploy ignition/modules/UniswapHook.ts --network sepolia --parameters '{"UniswapHookModule":{"poolManager":"0x...","positionManager":"0x...","usdc":"0x...","weth":"0x...","ethUsdFeed":"0x...","usdcUsdFeed":"0x..."}}'
```

## Post-Deployment

1. **Verify the contract** on Etherscan (optional):
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <POOL_MANAGER> <POSITION_MANAGER> <USDC> <WETH> <ETH_USD_FEED> <USDC_USD_FEED>
```

2. **Set up the contract**:
   - Call `setAuctionEngine()` with your auction engine address
   - Call `setEscrowContract()` with your escrow contract address
   - Call `initializePool()` with the initial sqrt price

## Important Notes

⚠️ **WARNING**: The addresses in `scripts/deploy.ts` are placeholder addresses. You MUST update them with the actual contract addresses for your target network before deploying.

⚠️ **SECURITY**: Never commit your private key or `.env` file to version control.

## Getting Actual Addresses

### Uniswap v4 Addresses
- Check Uniswap v4 documentation for the latest contract addresses
- These may not be available on all networks yet

### Chainlink Price Feeds
- Visit [Chainlink Price Feeds](https://docs.chain.link/data-feeds/price-feeds/addresses) for current addresses

### Token Addresses
- USDC: Check the official USDC documentation
- WETH: Standard WETH addresses are well-known

## Troubleshooting

1. **Compilation errors**: Make sure all dependencies are installed
2. **Deployment fails**: Check that you have enough ETH for gas fees
3. **Invalid addresses**: Verify all addresses are correct for your target network
4. **Network issues**: Ensure your RPC URL is working and you have the correct network configuration
