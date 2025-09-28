import { http, createConfig } from 'wagmi'
import { injected, metaMask } from 'wagmi/connectors'
import { defineChain } from 'viem'

// Citrea Testnet configuration
export const citreaTestnet = defineChain({
  id: 5115,
  name: 'Citrea Testnet',
  nativeCurrency: { name: 'cBTC', symbol: 'cBTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.citrea.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Citrea Explorer',
      url: 'https://explorer.testnet.citrea.xyz',
    },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [citreaTestnet],
  connectors: [
    metaMask(),
    injected(),
  ],
  transports: {
    [citreaTestnet.id]: http(),
  },
})

// Contract addresses (you would replace these with actual deployed contract addresses)
export const CONTRACTS = {
  MEMBER_ACCOUNT_MANAGER: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  ESCROW_CONTRACT: '0x2345678901234567890123456789012345678901' as `0x${string}`,
  AUCTION_ENGINE: '0x3456789012345678901234567890123456789012' as `0x${string}`,
} as const