import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';

// Components
import ConnectWallet from './components/ConnectWallet';
import ConnectGitHub from './components/ConnectGithub';
import UsernameInput from './components/UsernameInput';
import ZKPrivateProof from './components/ZKPrivateProof';
import ProfileResults from './components/ProfileResults';
import VerificationSuccess from './components/VerificationSuccess';
import VerificationFailed from './components/VerificationFailed';
import Navbar from './components/Navbar';

// Contract ABI
import { CONTRACT_ABI } from './constants/contractAbi';

function App() {
  // State for wallet connection
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for GitHub verification
  const [verifiedUsername, setVerifiedUsername] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({
    verified: false,
    checking: true
  });
  
  // Contract config
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  
  // Initialize provider and check if wallet is already connected
  useEffect(() => {
    const init = async () => {
      // Check if ethereum is available (MetaMask or other wallet)
      if (window.ethereum) {
        try {
          // Create ethers provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);
          
          // Get accounts
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const signer = provider.getSigner();
            setSigner(signer);
            
            // Initialize contract
            if (contractAddress) {
              const contract = new ethers.Contract(
                contractAddress,
                CONTRACT_ABI,
                signer
              );
              setContract(contract);
              
              // Check GitHub verification status
              await checkGitHubVerification(contract, accounts[0]);
            }
          }
        } catch (error) {
          console.error("Failed to connect to wallet:", error);
          setVerificationStatus({ verified: false, checking: false });
        }
      }
      
      setLoading(false);
    };
    
    init();
  }, [contractAddress]);
  
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
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // Update app state
        setAccount(accounts[0]);
        
        // Get signer
        const signer = provider.getSigner();
        setSigner(signer);
        
        // Initialize contract
        if (contractAddress) {
          const contract = new ethers.Contract(
            contractAddress,
            CONTRACT_ABI,
            signer
          );
          setContract(contract);
          
          // Check GitHub verification status
          await checkGitHubVerification(contract, accounts[0]);
        }
      } catch (error) {
        console.error("Failed to connect to wallet:", error);
        setVerificationStatus({ verified: false, checking: false });
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet!");
    }
  };
  
  // Function to disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setVerifiedUsername(null);
    setVerificationStatus({ verified: false, checking: false });
  };
  
  // Function to handle successful GitHub verification
  const handleVerificationSuccess = (username) => {
    setVerifiedUsername(username);
    setVerificationStatus({ verified: true, checking: false });
  };
  
  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const signer = provider.getSigner();
          setSigner(signer);
          
          // Reinitialize contract with new signer
          if (contractAddress) {
            const contract = new ethers.Contract(
              contractAddress,
              CONTRACT_ABI,
              signer
            );
            setContract(contract);
            
            // Check GitHub verification status for the new account
            await checkGitHubVerification(contract, accounts[0]);
          }
        } else {
          // User disconnected all accounts
          disconnectWallet();
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        // Reload the page on chain change
        window.location.reload();
      });
    }
    
    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [contractAddress, provider]);
  
  if (loading || verificationStatus.checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading application...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar 
          account={account} 
          onDisconnect={disconnectWallet}
          username={verifiedUsername}
          verified={verificationStatus.verified}
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
                    isVerified={verificationStatus.verified}
                    verifiedUsername={verifiedUsername}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
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
        
        <footer className="py-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} GitHub Profile Score - Web3 App</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;