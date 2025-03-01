import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';

import OpenSourceBountyABI from './abis/OpenSourceBounty.json'; // Make sure this file exists
import GitHubProfileScoreOAuthABI from './abis/GitHubProfileScoreOAuth.json'; // Make sure this file exists

// Components
import ConnectWallet from './components/ConnectWallet';
import ConnectGitHub from './components/ConnectGithub';
import UsernameInput from './components/UsernameInput';
import ProfileResults from './components/ProfileResults';
import VerificationSuccess from './components/VerificationSuccess';
import VerificationFailed from './components/VerificationFailed';
import Navbar from './components/Navbar';
import ContributorDashboard from './components/ContributorDashboard';
import ExploreBounties from './components/ExploreBounties';
import BountyDetail from './components/BountyDetail';
import ProjectOnboarding from './components/ProjectOnboarding';
import BountyList from './components/BountyList';

// Contract ABI
import { CONTRACT_ABI } from './constants/contractAbi';

function App() {
  // State for wallet connection
  const [account, setAccount] = useState(null);
  const [walletType, setWalletType] = useState('ethereum'); // Default to 'ethereum' for compatibility
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for GitHub verification
  const [verifiedUsername, setVerifiedUsername] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({
    verified: false,
    checking: false  // Changed from true to false to prevent loading screen hanging
  });
  
  const [bountyContract, setBountyContract] = useState(null);
  const [profileContract, setProfileContract] = useState(null);

  // Contract config
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const bountyContractAddress = process.env.REACT_APP_BOUNTY_CONTRACT_ADDRESS || process.env.BOUNTY_CONTRACT_ADDRESS;
  const profileContractAddress = process.env.REACT_APP_ZK_CONTRACT_ADDRESS;

  // Initialize provider and check if wallet is already connected
  useEffect(() => {
    const init = async () => {
      try {
        // Clear any previous connection data if it's causing issues
        // Uncomment the next line if you want to start fresh
        // localStorage.removeItem('connectedAccount');
        
        // Check if ethereum is available (MetaMask or other wallet)
        if (window.ethereum) {
          // Create ethers provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          // Check if we have accounts without requesting new access
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            console.log("Found connected account:", accounts[0]);
            setAccount(accounts[0]);
            const signer = provider.getSigner();
            setSigner(signer);
            
            // Initialize main contract
            if (contractAddress) {
              try {
                const contract = new ethers.Contract(
                  contractAddress,
                  CONTRACT_ABI,
                  signer
                );
                setContract(contract);
                
                // Check GitHub verification status
                await checkGitHubVerification(contract, accounts[0]);
              } catch (contractError) {
                console.error("Contract initialization error:", contractError);
                // Continue without contract
              }
            }
            
            // Initialize bounty contract
            if (bountyContractAddress) {
              try {
                const bContract = new ethers.Contract(
                  bountyContractAddress,
                  OpenSourceBountyABI.abi || OpenSourceBountyABI,
                  signer
                );
                setBountyContract(bContract);
                console.log("Bounty contract initialized");
              } catch (error) {
                console.error("Bounty contract initialization error:", error);
              }
            }
            
            // Initialize profile contract
            if (profileContractAddress) {
              try {
                const pContract = new ethers.Contract(
                  profileContractAddress,
                  GitHubProfileScoreOAuthABI.abi || GitHubProfileScoreOAuthABI,
                  signer
                );
                setProfileContract(pContract);
                console.log("Profile contract initialized");
              } catch (error) {
                console.error("Profile contract initialization error:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        // Always set loading to false, even if there are errors
        setLoading(false);
      }
    };
    
    init();
  }, [contractAddress, bountyContractAddress, profileContractAddress]);
  
  // Function to check GitHub verification status
  const checkGitHubVerification = async (contract, address) => {
    try {
      setVerificationStatus({ ...verificationStatus, checking: true });
      
      // Call contract to get GitHub username and verification status
      const [username, verified, timestamp] = await contract.getWalletGitHubInfo(address);
      
      if (verified && username) {
        setVerifiedUsername(username);
        setVerificationStatus({ verified: true, checking: false });
      } else {
        setVerifiedUsername(null);
        setVerificationStatus({ verified: false, checking: false });
      }
    } catch (error) {
      console.error("Error checking GitHub verification:", error);
      setVerificationStatus({ verified: false, checking: false });
    }
  };

  // Function to connect wallet
  const connectWallet = async (address, walletType, walletProvider) => {
    if (!address || !walletProvider) {
      console.error("Invalid connect wallet parameters");
      return;
    }
    
    try {
      setLoading(true);
      
      if (walletType === 'ethereum' || !walletType) {
        // Default to Ethereum if type is not specified
        const provider = new ethers.providers.Web3Provider(walletProvider);
        setProvider(provider);
        setAccount(address);
        setWalletType('ethereum');
        
        // Get signer
        const signer = provider.getSigner();
        setSigner(signer);
        
        // Initialize main contract
        if (contractAddress) {
          try {
            const contract = new ethers.Contract(
              contractAddress,
              CONTRACT_ABI,
              signer
            );
            setContract(contract);
            
            // Check GitHub verification status
            await checkGitHubVerification(contract, address);
          } catch (contractError) {
            console.error("Contract initialization error:", contractError);
            // Continue without contract
          }
        }
        
        // Initialize bounty contract
        if (bountyContractAddress) {
          try {
            const bContract = new ethers.Contract(
              bountyContractAddress,
              OpenSourceBountyABI.abi || OpenSourceBountyABI,
              signer
            );
            setBountyContract(bContract);
            console.log("Bounty contract initialized");
          } catch (error) {
            console.error("Bounty contract initialization error:", error);
          }
        }
        
        // Initialize profile contract
        if (profileContractAddress) {
          try {
            const pContract = new ethers.Contract(
              profileContractAddress,
              GitHubProfileScoreOAuthABI.abi || GitHubProfileScoreOAuthABI,
              signer
            );
            setProfileContract(pContract);
            console.log("Profile contract initialized");
          } catch (error) {
            console.error("Profile contract initialization error:", error);
          }
        }
        
      } else if (walletType === 'polkadot') {
        // Basic Polkadot wallet handling for now
        setAccount(address);
        setWalletType('polkadot');
        // We'll implement the rest of Polkadot integration later
        setVerificationStatus({ verified: false, checking: false });
      }
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
      setVerificationStatus({ verified: false, checking: false });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setBountyContract(null);
    setProfileContract(null);
    setVerifiedUsername(null);
    setVerificationStatus({ verified: false, checking: false });
    setWalletType('ethereum'); // Reset to default
    
    // Clear saved connection info
    localStorage.removeItem('connectedAccount');
    localStorage.removeItem('walletType');
  };
  
  // Function to handle successful GitHub verification
  const handleVerificationSuccess = (username) => {
    setVerifiedUsername(username);
    setVerificationStatus({ verified: true, checking: false });
  };
  
  // Listen for account changes
  useEffect(() => {
    if (window.ethereum && walletType === 'ethereum') {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          if (provider) {
            const ethSigner = provider.getSigner();
            setSigner(ethSigner);
            
            // Reinitialize contract with new signer
            if (contractAddress) {
              try {
                const ethContract = new ethers.Contract(
                  contractAddress,
                  CONTRACT_ABI,
                  ethSigner
                );
                setContract(ethContract);
                
                // Check GitHub verification status for the new account
                await checkGitHubVerification(ethContract, accounts[0]);
              } catch (error) {
                console.error("Contract reinitialization error:", error);
              }
            }
            
            // Reinitialize bounty contract
            if (bountyContractAddress) {
              try {
                const bContract = new ethers.Contract(
                  bountyContractAddress,
                  OpenSourceBountyABI.abi || OpenSourceBountyABI,
                  ethSigner
                );
                setBountyContract(bContract);
              } catch (error) {
                console.error("Bounty contract reinitialization error:", error);
              }
            }
            
            // Reinitialize profile contract
            if (profileContractAddress) {
              try {
                const pContract = new ethers.Contract(
                  profileContractAddress,
                  GitHubProfileScoreOAuthABI.abi || GitHubProfileScoreOAuthABI,
                  ethSigner
                );
                setProfileContract(pContract);
              } catch (error) {
                console.error("Profile contract reinitialization error:", error);
              }
            }
          }
        } else {
          // User disconnected all accounts
          disconnectWallet();
        }
      };
      
      const handleChainChanged = () => {
        // Reload the page on chain change
        window.location.reload();
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        // Clean up listeners
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [contractAddress, bountyContractAddress, profileContractAddress, provider, walletType]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading application...</p>
          <p className="mt-2 text-sm text-gray-500">
            If loading takes too long, try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar 
          account={account} 
          walletType={walletType}
          onDisconnect={disconnectWallet}
          username={verifiedUsername}
          verified={verificationStatus.verified}
          navItems={[
            { label: 'Explore Bounties', path: '/explore-bounties' },
            { label: 'Contributor Dashboard', path: '/contributor-dashboard' },
            { label: 'Create Project', path: '/project-onboarding' }
          ]}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Home route - redirects based on connection status */}
            <Route 
              path="/" 
              element={
                account ? (
                  // If wallet is connected and GitHub is verified, go to profile
                  verificationStatus.verified ? (
                    <Navigate to={`/results/${verifiedUsername}`} replace />
                  ) : (
                    // If wallet is connected but GitHub not verified, go to GitHub connect
                    <Navigate to="/connect-github" replace />
                  )
                ) : (
                  // If wallet not connected, show connect wallet page
                  <ConnectWallet onConnect={connectWallet} />
                )
              } 
            />
            
            {/* GitHub connection route */}
            <Route 
              path="/connect-github" 
              element={
                account ? (
                  <ConnectGitHub 
                    account={account} 
                    contract={contract}
                    walletType={walletType}
                    onVerificationSuccess={handleVerificationSuccess}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />

            {/* Manual username input (for public data only) */}
            <Route 
              path="/analyze" 
              element={
                account ? (
                  <UsernameInput 
                    account={account} 
                    contract={contract}
                    walletType={walletType}
                    verified={verificationStatus.verified}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            {/* Profile results page */}
            <Route 
              path="/results/:username" 
              element={
                account ? (
                  <ProfileResults 
                    account={account} 
                    contract={contract}
                    walletType={walletType}
                    isVerified={verificationStatus.verified}
                    verifiedUsername={verifiedUsername}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route path="/contributor-dashboard" element={
              <ContributorDashboard 
                account={account} 
                contract={bountyContract} 
                profileContract={profileContract} 
              />
            } />

            <Route path="/explore-bounties" element={
              <ExploreBounties 
                account={account} 
                contract={bountyContract} 
                profileContract={profileContract} 
              />
            } />

            <Route path="/bounties/:projectId/:issueId" element={
              <BountyDetail 
                account={account} 
                contract={bountyContract} 
                profileContract={profileContract} 
              />
            } />

            <Route path="/projects/:projectId/bounties" element={
              <BountyList 
                account={account} 
                contract={bountyContract} 
              />
            } />

            <Route path="/project-onboarding" element={
              <ProjectOnboarding 
                account={account} 
                contract={bountyContract}
                profileContract={profileContract} 
              />
            } />
            
            {/* GitHub OAuth callback routes */}
            <Route 
              path="/verification-success" 
              element={
                account ? (
                  <VerificationSuccess 
                    onVerificationComplete={handleVerificationSuccess}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/verification-failed" 
              element={
                account ? (
                  <VerificationFailed />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </main>
        
        <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-800">
          <p>© {new Date().getFullYear()} GitHub Profile Score - Web3 App</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;