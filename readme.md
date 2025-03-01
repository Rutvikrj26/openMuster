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

## Zero-Knowledge Features

- **Multiple ZK Proof Systems**: Leverages four different ZK proof technologies from zkVerify:
  - **RiscZero ZKVM**: For code metrics and complexity analysis
  - **Noir Hyperplonk**: For contribution frequency and activity verification
  - **Groth16**: For repository ownership verification
  - **Polygon FFlonk**: For language proficiency verification

- **Privacy-Preserving Analysis**: Users can include private repositories in their GitHub score calculation without exposing repository contents, commit details, or other sensitive information.

- **On-Chain Verification**: All ZK proofs are verified on the zkVerify blockchain and linked to the user's profile in our smart contract.

- **ZK Badges**: Users earn verifiable ZK badges that demonstrate specific skills or achievements without revealing the underlying data.

## Architecture

![GitHub Profile zkVerify Architecture](./docs/zk-architecture.png)

The zkVerify integration follows this flow:

1. User connects wallet and authorizes GitHub with OAuth
2. Private repository metadata is retrieved via GitHub API
3. Multiple ZK proofs are generated locally:
   - Code metrics proof (RiscZero ZKVM)
   - Activity proof (Noir Hyperplonk)
   - Ownership proof (Groth16)
   - Language proof (Polygon FFlonk)
4. Proofs are submitted to zkVerify for verification
5. Verification results are stored on-chain via our ZKVerifyBridge
6. User profile displays enhanced score with ZK badges

## Smart Contracts

- **GitHubProfileScoreZK.sol**: Extends the original contract with ZK proof verification support
- **ZKVerifyBridge.sol**: Acts as a bridge between zkVerify blockchain and our application

## Setup Instructions

### Prerequisites

- Node.js and npm
- MetaMask or another Ethereum wallet
- Test ETH on Base Sepolia testnet
- GitHub account and OAuth application
- zkVerify API key (sign up at https://zkverify.io)

### Environment Variables

Add these to your `.env` file:

```
REACT_APP_ZKVERIFY_API_URL=https://api.zkverify.io
REACT_APP_ZKVERIFY_API_KEY=your_zkverify_api_key
```

### Deployment

```bash
# Deploy the ZK-enabled contracts
npx hardhat run scripts/deploy-zk-contracts.js --network base_sepolia
```

## Using ZK Proofs

1. Connect your wallet and verify your GitHub account via OAuth
2. When analyzing your profile, check "Use zero-knowledge proofs to protect private repo data"
3. Click "Generate Multiple ZK Proofs via zkVerify"
4. Wait for proofs to be generated and verified on zkVerify blockchain
5. Your profile will be updated with ZK badges and enhanced score

## ZK Proof Details

### Code Metrics Proof (RiscZero ZKVM)

Proves facts about repository metrics without revealing the actual code:
- Number of repositories
- Lines of code
- Code complexity
- Stars and forks

### Activity Proof (Noir Hyperplonk)

Proves contribution activity without revealing specific commits:
- Contribution frequency
- Active days per week/month
- Contribution streaks
- Contribution patterns

### Ownership Proof (Groth16)

Proves repository ownership without revealing repository details:
- Wallet-to-GitHub association
- Repository access rights
- Ownership duration
- Repository count

### Language Proof (Polygon FFlonk)

Proves language proficiency without revealing code:
- Languages used
- Primary language
- Language distribution
- Language diversity

## Resources

- [zkVerify Documentation](https://docs.zkverify.io)
- [RiscZero Documentation](https://www.risczero.com/docs)
- [Noir Documentation](https://noir-lang.org/docs)
- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)
- [Polygon FFlonk Documentation](https://polygon.technology/blog/introducing-plonky2-and-fflonk)

## License
MIT
