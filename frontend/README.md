# Rotare Finance - DeFi ROSCA Platform

**Decentralized Rotating Savings and Credit Associations on Citrea Testnet**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built on Citrea](https://img.shields.io/badge/Built%20on-Citrea%20Testnet-orange)](https://citrea.xyz)
[![ETH Global](https://img.shields.io/badge/ETH%20Global-Hackathon-blue)](https://ethglobal.com)

## 🚀 Project Overview

Rotare Finance revolutionizes traditional Rotating Savings and Credit Associations (ROSCAs) by bringing them onto the blockchain. Our platform enables collaborative savings pools where members contribute funds regularly, earn yield through DeFi protocols, and access capital through transparent Dutch auctions.

### 🎯 Problem Statement

Traditional ROSCAs lack transparency, have limited yield generation, and suffer from trust issues. Participants often face:
- No yield on locked funds
- Opaque payout mechanisms  
- Risk of member defaults
- Limited accessibility
- Manual coordination overhead

### 💡 Solution

Rotare Finance creates a trustless, yield-generating ROSCA system with:
- **Smart Contract Transparency**: All operations are on-chain and verifiable
- **Automated Yield Generation**: Funds earn competitive APY through DeFi protocols
- **Dutch Auction Access**: Fair, transparent bidding for early fund access
- **Built-in Security**: Multi-signature governance and emergency protections

## 🏗️ Architecture Overview

<mermaid>
graph TB
    subgraph "Frontend Layer"
        UI[React + TypeScript UI]
        WC[Wagmi Web3 Connector]
        SM[State Management]
    end
    
    subgraph "Blockchain Layer - Citrea Testnet"
        MAC[Member Account Manager]
        EC[Escrow Contract]  
        AE[Auction Engine]
        YG[Yield Generator]
    end
    
    subgraph "DeFi Integration"
        LP[Liquidity Protocols]
        YF[Yield Farming]
        LP2[Lending Pools]
    end
    
    UI --> WC
    WC --> MAC
    WC --> EC
    WC --> AE
    
    MAC --> YG
    EC --> YG
    YG --> LP
    YG --> YF
    YG --> LP2
    
    style UI fill:#e1f5fe
    style MAC fill:#f3e5f5
    style EC fill:#f3e5f5
    style AE fill:#f3e5f5
    style YG fill:#fff3e0
</mermaid>

## 🌟 Core Features

### 📊 Dashboard & Portfolio Management
- Real-time portfolio tracking
- Yield earnings visualization
- Active pool monitoring
- Transaction history

### 🤝 Collaborative Savings Pools
- Create custom ROSCA pools
- Flexible contribution schedules
- Automated member management
- Smart contract escrow

### 💰 Yield Generation
- Automatic DeFi protocol integration
- Competitive APY on locked funds
- Transparent yield distribution
- Real-time earnings tracking

### 🔨 Dutch Auctions
- Fair price discovery mechanism
- Transparent bidding process
- Early fund access opportunities
- Automated payout system

## 🔄 User Flow Diagram

<mermaid>
journey
    title ROSCA Participant Journey
    section Pool Discovery
      Browse Pools: 5: User
      Check Terms: 4: User
      Connect Wallet: 5: User
    section Joining Pool
      Deposit Funds: 4: User, Smart Contract
      Confirm Membership: 5: Smart Contract
      Start Earning Yield: 5: DeFi Protocol
    section Pool Participation  
      Make Contributions: 4: User, Smart Contract
      Earn Yield: 5: DeFi Protocol
      Monitor Performance: 4: User
    section Fund Access
      Join Auction: 3: User
      Place Bids: 4: User, Auction Contract
      Win Early Access: 5: Auction Contract
      Receive Funds: 5: Smart Contract
</mermaid>

## 🔧 Technical Architecture

### Smart Contract System

<mermaid>
classDiagram
    class MemberAccountManager {
        +createAccount()
        +manageMembers()
        +verifyIdentity()
        +trackContributions()
    }
    
    class EscrowContract {
        +lockFunds()
        +distributePayout()
        +emergencyWithdraw()
        +calculateYield()
    }
    
    class AuctionEngine {
        +createAuction()
        +placeBid()
        +processWinner()
        +distributeFunds()
    }
    
    class YieldGenerator {
        +deployToProtocols()
        +harvestYield()
        +rebalancePortfolio()
        +calculateAPY()
    }
    
    MemberAccountManager --> EscrowContract
    EscrowContract --> YieldGenerator
    AuctionEngine --> EscrowContract
    YieldGenerator --> EscrowContract
</mermaid>

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | Modern UI/UX |
| **Styling** | Tailwind CSS + Framer Motion | Responsive design & animations |
| **Web3** | Wagmi + Viem | Blockchain interaction |
| **State** | React Query + Hooks | Efficient data management |
| **Build** | Vite | Fast development & bundling |
| **Blockchain** | Citrea Testnet (Bitcoin L2) | Decentralized execution |
| **Smart Contracts** | Solidity | Business logic implementation |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Citrea Testnet cBTC (testnet tokens)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rotare-finance

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

1. Connect MetaMask to Citrea Testnet:
   - Network Name: `Citrea Testnet`
   - RPC URL: `https://rpc.testnet.citrea.xyz`
   - Chain ID: `5115`
   - Currency: `cBTC`
   - Explorer: `https://explorer.testnet.citrea.xyz`

2. Get testnet tokens from Citrea faucet

3. Launch the application at `http://localhost:5173`

## 📱 Application Flow

### Pool Creation Flow

<mermaid>
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant W as Wallet
    participant SC as Smart Contract
    participant YP as Yield Protocol
    
    U->>UI: Create New Pool
    UI->>U: Pool Configuration Form
    U->>UI: Submit Pool Details
    UI->>W: Request Transaction
    W->>U: Confirm Transaction
    W->>SC: Deploy Pool Contract
    SC->>YP: Initialize Yield Strategy
    SC->>UI: Pool Created Event
    UI->>U: Success Notification
</mermaid>

### Auction Participation Flow

<mermaid>
sequenceDiagram
    participant U as User
    participant AE as Auction Engine
    participant EC as Escrow Contract
    participant W as Wallet
    
    U->>AE: View Active Auctions
    AE->>U: Available Auctions List
    U->>AE: Place Bid
    AE->>W: Request Bid Transaction
    W->>AE: Confirm Bid
    AE->>AE: Process Auction Logic
    AE->>EC: Transfer Winning Funds
    EC->>U: Distribute Payout
</mermaid>

## 🔐 Security Features

- **Multi-signature Governance**: Critical operations require multiple confirmations
- **Emergency Withdrawal**: Members can exit pools in emergency situations
- **Audit Trail**: All transactions are recorded on-chain
- **Rate Limiting**: Protection against rapid-fire transactions
- **Slippage Protection**: Maximum slippage controls for DeFi operations

## 📊 Key Metrics

| Metric | Value | Description |
|--------|-------|-------------|
| **Gas Efficiency** | <0.001 cBTC | Average transaction cost |
| **Yield Generation** | 8-15% APY | Target yield range |
| **Auction Speed** | 24-72 hours | Typical auction duration |
| **Pool Flexibility** | 3-24 months | Supported pool durations |

## 🛣️ Roadmap

### Phase 1: Core Platform ✅
- [x] Basic ROSCA functionality
- [x] Web3 wallet integration
- [x] Citrea Testnet deployment

### Phase 2: Advanced Features 🚧
- [ ] Multi-asset support (BTC, ETH)
- [ ] Advanced yield strategies
- [ ] Governance token launch
- [ ] Mobile application

### Phase 3: Ecosystem Growth 🔮
- [ ] Cross-chain bridge integration
- [ ] Institutional features
- [ ] White-label solutions
- [ ] Global expansion

## 🏆 Why Rotare Finance?

### Innovation Points
1. **First DeFi ROSCA Platform**: Pioneering blockchain-based rotating savings
2. **Bitcoin L2 Integration**: Leveraging Citrea's Bitcoin security model
3. **Yield Optimization**: Automated DeFi yield generation
4. **Fair Access Mechanism**: Dutch auctions ensure transparent pricing

### Market Opportunity
- **$2.5T Global ROSCA Market**: Massive underserved traditional market
- **DeFi Yield Demand**: Growing appetite for yield-generating products
- **Financial Inclusion**: Bringing traditional savings groups on-chain
- **Bitcoin Ecosystem**: Expanding Bitcoin's utility beyond store of value

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [rotare.finance](https://rotare.finance)
- **Citrea Explorer**: [explorer.testnet.citrea.xyz](https://explorer.testnet.citrea.xyz)
- **Documentation**: [docs.rotare.finance](https://docs.rotare.finance)
- **Twitter**: [@RotareFinance](https://twitter.com/RotareFinance)

## 📞 Team

Built with ❤️ for ETH Global Hackathon

---

**Rotare Finance** - Democratizing Access to Collaborative Finance Through Blockchain Innovation