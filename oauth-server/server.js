require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { ethers } = require('ethers');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// GitHub OAuth credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

// Blockchain connection
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractABI = require('./contractABI.json');
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

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
    try {
      const tx = await contract.verifyUserWallet(
        walletAddress,
        githubUsername,
        verificationHash
      );
      
      await tx.wait();
      
      console.log(`Verified wallet ${walletAddress} with GitHub username ${githubUsername}`);
      
      // Clean up
      pendingVerifications.delete(state);
      
      // Redirect back to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}/verification-success?username=${githubUsername}`);
    } catch (error) {
      console.error('Blockchain verification failed:', error);
      res.redirect(`${process.env.FRONTEND_URL}/verification-failed?error=blockchain`);
    }
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/verification-failed?error=github`);
  }
});

// API to check verification status
app.get('/api/verify/status/:wallet', async (req, res) => {
  const { wallet } = req.params;
  
  if (!wallet || !ethers.utils.isAddress(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  
  try {
    const [username, verified, timestamp] = await contract.getWalletGitHubInfo(wallet);
    
    res.json({
      username,
      verified,
      verificationTimestamp: timestamp.toString(),
      walletAddress: wallet
    });
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
    
    // Return anonymized stats
    res.json({
      username,
      totalRepos: repos.length,
      totalPrivateRepos,
      totalPublicRepos,
      totalPrivateStars,
      languageStats: getLanguageStats(repos)
    });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
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
});