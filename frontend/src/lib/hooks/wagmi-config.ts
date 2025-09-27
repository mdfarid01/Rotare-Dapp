import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { celoAlfajores } from 'viem/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia, celoAlfajores],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [celoAlfajores.id]: http('https://alfajores-forno.celo-testnet.org'),
  },
  connectors: [
    injected({ target: 'metaMask' })
  ],
})