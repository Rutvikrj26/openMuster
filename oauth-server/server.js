require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { ethers } = require('ethers');
const crypto = require('crypto');
const cookieParser = require('cookie-parser'); // Add this dependency

const app = express();
const PORT = process.env.PORT || 3001;

// Encryption key for tokens (generate a secure one for production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  console.error('⚠️ WARNING: ENCRYPTION_KEY environment variable is not set!');
  console.error('This will cause authentication issues when the server restarts.');
  console.error('Set a fixed ENCRYPTION_KEY in your .env file for production.');
}

// Generate a temporary key if none is provided (development only)
const encryptionKey = ENCRYPTION_KEY || 
                     '2fbd59bdc2f792bbfe21954e605896fcc7d1ef8af75affb6ff1b170ccdf23657'; // Default fallback key
const IV_LENGTH = 16; // For AES, this is always 16

// Middleware
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); // Add cookie parser

// GitHub OAuth credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/api/auth/github/callback';

// Blockchain connection (for blockchain verification)
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org');
const contractABI = require('./contractABI.json');
const bountyContractABI = require('./BountycontractABI.json');
const contractAddress = process.env.CONTRACT_ADDRESS;

// Only setup wallet and contract if private key is provided
let wallet, contract;
if (process.env.PRIVATE_KEY) {
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  contract = new ethers.Contract(contractAddress, contractABI, wallet);
}

// In-memory storage (replace with database in production)
const pendingVerifications = new Map();

// Update the encryption function to use the stable key

function encryptToken(text) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      Buffer.from(encryptionKey, 'hex'), // Use the stable key
      iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

function decryptToken(text) {
  try {
    if (!text || typeof text !== 'string' || !text.includes(':')) {
      console.log('Invalid encrypted token format');
      return null;
    }
    
    const textParts = text.split(':');
    if (textParts.length < 2) {
      console.log('Encrypted token missing IV or data');
      return null;
    }
    
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    // Ensure IV is correct length
    if (iv.length !== IV_LENGTH) {
      console.log(`Invalid IV length: ${iv.length}, expected: ${IV_LENGTH}`);
      return null;
    }
    
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      Buffer.from(encryptionKey, 'hex'), // Use the stable key
      iv
    );
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    // Add more debug info for decryption errors
    console.error('Decryption error:', error);
    console.log('Encrypted text:', text);
    console.log('Key length:', encryptionKey.length);
    return null;
  }
}
// Route to initiate OAuth flow
app.get('/api/auth/github', (req, res) => {
  const { wallet: walletAddress, redirect: redirectPath } = req.query;
  
  if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  
  // Generate state parameter to prevent CSRF
  const state = crypto.randomBytes(16).toString('hex');
  pendingVerifications.set(state, { 
    walletAddress, 
    timestamp: Date.now(),
    redirectPath: redirectPath || ''
  });
  
  // Clean up old verifications (older than 1 hour)
  const oneHourAgo = Date.now() - 3600000;
  for (const [key, value] of pendingVerifications.entries()) {
    if (value.timestamp < oneHourAgo) {
      pendingVerifications.delete(key);
    }
  }
  
  // Redirect to GitHub authorization
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=read:user%20repo%20read:org&state=${state}`;
  
  res.json({ url: githubAuthUrl });
});

// Route to handle GitHub callback
app.get('/api/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state to prevent CSRF
  if (!state || !pendingVerifications.has(state)) {
    return res.status(400).send('Invalid state parameter');
  }
  
  const { walletAddress, redirectPath } = pendingVerifications.get(state);
  
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
    
    const originalGithubUsername = userResponse.data.login;
    const githubUsername = originalGithubUsername.toLowerCase(); // Normalize to lowercase
    
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
    
    // Set the secure cookie with encrypted token
    const encryptedToken = encryptToken(access_token);
    res.cookie('github_oauth_token', encryptedToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 'lax' is more compatible than 'strict'
      maxAge: 3600000 // 1 hour
    });
    
    // Determine where to redirect based on redirectPath
    let redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-success?username=${githubUsername}`;
    
    if (redirectPath) {
      // If there was a specific path to return to, use it
      redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}${redirectPath}`;
    }
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-failed?error=github`);
  }
});

app.get('/api/github/repos/:username/authenticated', async (req, res) => {
  const originalUsername = req.params.username;
  const username = originalUsername.toLowerCase();
  let token;
  
  // Try multiple auth mechanisms with fallbacks
  // 1. Try cookie first (new method)
  const encryptedToken = req.cookies?.github_oauth_token;
  if (encryptedToken) {
    try {
      token = decryptToken(encryptedToken);
      console.log("Using token from cookie authentication");
    } catch (err) {
      console.log("Error decrypting token from cookie:", err);
      // Continue to next auth method
    }
  }
  
  // 2. Try query param (fallback method)
  if (!token && req.query.token) {
    token = req.query.token;
    console.log("Using token from query parameter");
  }
  
  // 3. Check auth header (another fallback)
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
    console.log("Using token from authorization header");
  }
  
  // If no token found through any method
  if (!token) {
    return res.status(401).json({ 
      error: 'No authentication token found. Please provide a token or verify your GitHub account.',
      authMethods: {
        cookie: !!encryptedToken,
        queryParam: !!req.query.token,
        authHeader: !!req.headers.authorization
      }
    });
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
      repoDetails: repos
    });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    if (error.response?.status === 401) {
      res.status(401).json({ 
        error: 'GitHub authentication expired. Please verify your account again.'
      });
    } else {
      res.status(error.response?.status || 500).json({ 
        error: 'Failed to fetch GitHub data',
        githubError: error.response?.data || error.message
      });
    }
  }
});

// Legacy API to fetch GitHub repo information (for backward compatibility)
app.get('/api/github/repos/:username', async (req, res) => {
  const originalUsername = req.params.username;
  const username = originalUsername.toLowerCase();
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
      repoDetails: repos
    });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
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
        username: username.toLowerCase(),
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

// Add after the existing endpoints, before the server startup code

// Projects-related API endpoints
app.post('/api/projects/register', async (req, res) => {
  const { 
    name, 
    description, 
    website, 
    githubUrl, 
    repositoryId, 
    repositoryName, 
    ownerAddress 
  } = req.body;
  
  // Validate required fields
  if (!name || !githubUrl || !repositoryId || !ownerAddress || !repositoryName) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }
  
  // Validate wallet address
  if (!ethers.utils.isAddress(ownerAddress)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid wallet address' 
    });
  }
  
  try {
    // Get the bounty contract ABI and address
    const bountyContractAddress = process.env.BOUNTY_CONTRACT_ADDRESS;
    
    if (!bountyContractAddress) {
      return res.status(500).json({ 
        success: false, 
        error: 'Bounty contract not configured' 
      });
    }
    
    // Connect to the bounty contract
    const bountyContract = new ethers.Contract(
      bountyContractAddress, 
      bountyContractABI, 
      wallet
    );
    
    console.log(`Registering project "${name}" for wallet ${ownerAddress}`);
    console.log(`Repository: ${repositoryName} (ID: ${repositoryId})`);
    
    // Submit transaction to register project on-chain
    const tx = await bountyContract.registerProject(
      name,
      description || '',
      website || '',
      githubUrl,
      repositoryName,
      repositoryId
    );
    
    console.log(`Transaction submitted with hash: ${tx.hash}`);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Extract project ID from the event
    const projectRegisteredEvent = receipt.events?.find(e => e.event === 'ProjectRegistered');
    const projectId = projectRegisteredEvent?.args?.projectId.toString() || '0';
    
    console.log(`Project registered with ID: ${projectId}`);
    
    // Return success response with project ID
    res.json({
      success: true,
      projectId,
      txHash: tx.hash
    });
    
  } catch (error) {
    console.error('Error registering project:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to register project' 
    });
  }
});

// API to fetch projects by user/owner
app.get('/api/projects/user/:address', async (req, res) => {
  const { address } = req.params;
  
  if (!ethers.utils.isAddress(address)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid wallet address' 
    });
  }
  
  try {
    const bountyContractAddress = process.env.BOUNTY_CONTRACT_ADDRESS;
    const bountyContractABI = require('./bountyContractABI.json');
    
    if (!bountyContractAddress) {
      return res.status(500).json({ 
        success: false, 
        error: 'Bounty contract not configured' 
      });
    }
    
    // Connect to the bounty contract
    const bountyContract = new ethers.Contract(
      bountyContractAddress, 
      bountyContractABI, 
      provider
    );
    
    // Get project IDs owned by this address
    const projectIds = await bountyContract.getProjectsByOwner(address);
    
    // Fetch details for each project
    const projects = [];
    for (const id of projectIds) {
      const projectData = await bountyContract.getProject(id);
      
      if (projectData.exists) {
        projects.push({
          id: projectData.id.toString(),
          name: projectData.name,
          description: projectData.description,
          website: projectData.website,
          githubUrl: projectData.githubUrl,
          repositoryName: projectData.repoName,
          repositoryId: projectData.repoId.toString(),
          ownerAddress: projectData.owner,
          createdAt: new Date(projectData.timestamp.toNumber() * 1000).toISOString()
        });
      }
    }
    
    res.json({
      success: true,
      projects
    });
    
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch projects' 
    });
  }
});

// API to get a specific project by ID
app.get('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const bountyContractAddress = process.env.BOUNTY_CONTRACT_ADDRESS;
    const bountyContractABI = require('./bountyContractABI.json');
    
    if (!bountyContractAddress) {
      return res.status(500).json({ 
        success: false, 
        error: 'Bounty contract not configured' 
      });
    }
    
    // Connect to the bounty contract
    const bountyContract = new ethers.Contract(
      bountyContractAddress, 
      bountyContractABI, 
      provider
    );
    
    // Get project data
    const projectData = await bountyContract.getProject(id);
    
    if (!projectData.exists) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    const project = {
      id: projectData.id.toString(),
      name: projectData.name,
      description: projectData.description,
      website: projectData.website,
      githubUrl: projectData.githubUrl,
      repositoryOwner: projectData.githubUrl.split('/').slice(-2)[0],
      repositoryName: projectData.repoName,
      repositoryId: projectData.repoId.toString(),
      ownerAddress: projectData.owner,
      createdAt: new Date(projectData.timestamp.toNumber() * 1000).toISOString()
    };
    
    res.json({
      success: true,
      project
    });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch project' 
    });
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