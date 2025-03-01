# GitHub Profile Analyzer - Web3 App

A decentralized web application that analyzes GitHub profiles and stores the results on the blockchain.

## Features

- Connect your Ethereum wallet (MetaMask, Coinbase Wallet, etc.)
- Analyze any GitHub profile using various metrics
- Store analysis results permanently on the blockchain
- View a comprehensive score breakdown

## Project Structure

The project consists of two main parts:
1. Smart Contract (Solidity)
2. Frontend Application (React)

## Setup Instructions

### Prerequisites

- Node.js and npm
- MetaMask or another Ethereum wallet
- Test ETH on Base Sepolia testnet

### Smart Contract Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your wallet private key and other required values

3. Compile the smart contract:
   ```bash
   npm run compile
   ```

4. Deploy to Base Sepolia testnet:
   ```bash
   npm run deploy:base-sepolia
   ```

5. The contract address will be automatically saved to `.env.local`

### Frontend Development

1. Start the development server:
   ```bash
   npm start
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

## Smart Contract Details

- Network: Base Sepolia Testnet
- Contract: `GitHubProfileScore`
- Functions:
  - `addProfileScore`: Store a new GitHub profile analysis
  - `getProfileScore`: Retrieve a stored profile analysis
  - `getProfileCount`: Get the total number of analyzed profiles
  - `getProfiles`: Get a list of profiles with pagination

## License

MIT