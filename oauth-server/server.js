require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { ethers } = require('ethers');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// GitHub OAuth credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/api/auth/github/callback';

// Blockchain connection (for blockchain verification)
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org');
const contractABI = require('./contractABI.json');
const contractAddress = process.env.CONTRACT_ADDRESS;

// Only setup wallet and contract if private key is provided
let wallet, contract;
if (process.env.PRIVATE_KEY) {
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  contract = new ethers.Contract(contractAddress, contractABI, wallet);
}

// In-memory storage (replace with database in production)
const pendingVerifications = new Map();

// Route to initiate OAuth flow
app.get('/api/auth/github', (req, res) => {
  const walletAddress = req.query.wallet;
  
  if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  
  // Generate state parameter to prevent CSRF
  const state = crypto.randomBytes(16).toString('hex');
  pendingVerifications.set(state, { walletAddress, timestamp: Date.now() });
  
  // Clean up old verifications (older than 1 hour)
  const oneHourAgo = Date.now() - 3600000;
  for (const [key, value] of pendingVerifications.entries()) {
    if (value.timestamp < oneHourAgo) {
      pendingVerifications.delete(key);
    }
  }
  
  // Redirect to GitHub authorization
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=read:user%20repo&state=${state}`;
  
  res.json({ url: githubAuthUrl });
});

// Route to handle GitHub callback
app.get('/api/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state to prevent CSRF
  if (!state || !pendingVerifications.has(state)) {
    return res.status(400).send('Invalid state parameter');
  }
  
  const { walletAddress } = pendingVerifications.get(state);
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );
    
    const { access_token } = tokenResponse.data;
    
    // Get GitHub user data
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`
      }
    });
    
    const githubUsername = userResponse.data.login;
    
    // Generate verification hash (will be stored on-chain for reference)
    const verificationHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'string', 'uint256'],
        [walletAddress, githubUsername, Date.now()]
      )
    );
    
    // Record the verified association on the blockchain
    if (wallet && contract) {
      try {
        const tx = await contract.verifyUserWallet(
          walletAddress,
          githubUsername,
          verificationHash
        );
        
        await tx.wait();
        
        console.log(`Verified wallet ${walletAddress} with GitHub username ${githubUsername}`);
      } catch (error) {
        console.error('Blockchain verification failed:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-failed?error=blockchain`);
      }
    } else {
      console.log(`[DEV MODE] Would verify wallet ${walletAddress} with GitHub username ${githubUsername}`);
    }
    
    // Clean up
    pendingVerifications.delete(state);
    
    // Redirect back to frontend with success and token
    // In production, you should not pass the token in the URL - this is for demo purposes
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-success?username=${githubUsername}&token=${access_token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-failed?error=github`);
  }
});

// API to check verification status
app.get('/api/verify/status/:wallet', async (req, res) => {
  const { wallet } = req.params;
  
  if (!wallet || !ethers.utils.isAddress(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  
  try {
    if (contract) {
      const [username, verified, timestamp] = await contract.getWalletGitHubInfo(wallet);
      
      res.json({
        username,
        verified,
        verificationTimestamp: timestamp.toString(),
        walletAddress: wallet
      });
    } else {
      // In development mode without contract
      res.json({
        username: "",
        verified: false,
        verificationTimestamp: "0",
        walletAddress: wallet
      });
    }
  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({ error: 'Failed to check verification status' });
  }
});

// API to fetch GitHub repo information (for private data analysis)
app.get('/api/github/repos/:username', async (req, res) => {
  const { username } = req.params;
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ error: 'Access token required' });
  }
  
  try {
    // Fetch user's repositories including private ones
    const reposResponse = await axios.get(
      `https://api.github.com/users/${username}/repos?type=all&per_page=100`,
      {
        headers: {
          Authorization: `token ${token}`
        }
      }
    );
    
    // Process and anonymize private repo data for ZK applications
    const repos = reposResponse.data.map(repo => ({
      id: repo.id,
      name: repo.private ? `private-${repo.id}` : repo.name, // Anonymize private repo names
      private: repo.private,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      size: repo.size
    }));
    
    // Count metrics
    const totalPrivateRepos = repos.filter(repo => repo.private).length;
    const totalPublicRepos = repos.filter(repo => !repo.private).length;
    const totalPrivateStars = repos
      .filter(repo => repo.private)
      .reduce((sum, repo) => sum + repo.stars, 0);
    
    // Get repository IDs for proof verification
    const repositoryIds = repos.map(repo => repo.id.toString());
    
    // Return anonymized stats
    res.json({
      username,
      totalRepos: repos.length,
      totalPrivateRepos,
      totalPublicRepos,
      totalPrivateStars,
      languageStats: getLanguageStats(repos),
      repositoryIds,
      repoDetails: repos,
      accessToken: token  // Only sending back for demo
    });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
});

// Helper endpoint for ZK proof verification (proxies zkVerify API but keeps sensitive keys on server)
app.post('/api/zkverify/submit', async (req, res) => {
  const { proofType, proofData } = req.body;
  
  if (!proofType || !proofData) {
    return res.status(400).json({ error: 'Missing proof type or data' });
  }
  
  try {
    // In a real application, you would call the zkVerify API here
    // This is a placeholder to demonstrate the endpoint structure
    console.log(`Would submit ${proofType} proof to zkVerify`);
    
    // Simulate successful verification
    setTimeout(() => {
      res.json({
        success: true,
        verificationId: `zkv-${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: Date.now()
      });
    }, 1000); // Simulate network delay
  } catch (error) {
    console.error('Error submitting proof to zkVerify:', error);
    res.status(500).json({ error: 'Failed to submit proof' });
  }
});

// Helper function to get language statistics
function getLanguageStats(repos) {
  const stats = {};
  
  repos.forEach(repo => {
    if (repo.language) {
      stats[repo.language] = (stats[repo.language] || 0) + 1;
    }
  });
  
  return stats;
}

// Start the server
app.listen(PORT, () => {
  console.log(`OAuth server running on port ${PORT}`);
  console.log(`GitHub callback URL: ${GITHUB_REDIRECT_URI}`);
  
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.warn('⚠️ GitHub OAuth credentials not set. Authentication will not work correctly.');
  }
  
  if (!process.env.PRIVATE_KEY || !contractAddress) {
    console.warn('⚠️ Blockchain verification is in development mode. Changes will not be saved on-chain.');
  }
});