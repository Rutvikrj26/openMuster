# GitHub Profile Analyzer with OAuth - Web3 App

A decentralized web application that analyzes GitHub profiles, securely verifies ownership via OAuth, and stores results on the blockchain.

## Features

- **Wallet Integration**: Connect with MetaMask or other web3 wallets
- **GitHub OAuth**: Securely verify wallet-to-GitHub connections
- **Private Repository Analysis**: Include private repos in score calculation (for verified users)
- **Zero-Knowledge Privacy**: Include private data without revealing sensitive information
- **Blockchain Storage**: Permanently store profile scores on Base blockchain
- **Automatic Profile Recognition**: Remember users when they return to the app

## Project Components

### Frontend (React)
- Modern UI with TailwindCSS
- Web3 wallet connection
- GitHub OAuth authorization flow
- Profile analysis and visualization

### Backend (Express)
- OAuth verification server
- GitHub API integration
- ZK proof generation (conceptual)

### Smart Contract (Solidity)
- Store profile scores and verification status
- Access control for private data
- Wallet-to-GitHub ownership verification

## Setup Instructions

### Prerequisites

- Node.js and npm
- MetaMask or another Ethereum wallet
- Test ETH on Base Sepolia testnet
- GitHub account and OAuth application

### 1. Create a GitHub OAuth App

1. Go to your GitHub Settings > Developer Settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the following details:
   - **Application Name**: GitHub Profile Score (or your preferred name)
   - **Homepage URL**: http://localhost:3000 (for development)
   - **Authorization callback URL**: http://localhost:3001/api/auth/github/callback
4. Click "Register application"
5. Take note of the Client ID and generate a Client Secret

### 2. Deploy the Smart Contract

```bash
# From the project root directory
cd contracts

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your wallet private key

# Compile the contract
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network base_sepolia
```

### 3. Set Up the OAuth Server

```bash
# From the project root directory
cd oauth-server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with GitHub OAuth credentials and contract address

# Start the server
npm start
```

### 4. Run the Frontend Application

```bash
# From the project root directory

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with deployed contract address and OAuth server URL

# Start the development server
npm start
```

Visit http://localhost:3000 to use the application.

## User Flow

1. **Connect Wallet**: User connects their Ethereum wallet
2. **GitHub Authorization**: User authorizes the app to access their GitHub profile
3. **Verification**: The app verifies ownership and stores association on-chain
4. **Profile Analysis**: The app analyzes the GitHub profile (public or private data)
5. **Score Display**: Results are shown and stored on blockchain

## Understanding the Verification Flow

The project uses a secure multi-step verification process:

1. User signs a message with their wallet to prove ownership
2. User authorizes the app on GitHub to verify their GitHub identity
3. Our backend verifies both signatures and records the verified association
4. Smart contract checks verification status before allowing private data inclusion

## Zero-Knowledge Privacy

For private repository analysis, the application implements a privacy-preserving approach:

1. Private repository data is processed locally
2. Only aggregate metrics are used in score calculation
3. A zero-knowledge proof verifies the metrics without revealing sensitive data
4. The smart contract stores the proof reference but not the private data

## License

MIT