import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';

// Components
import ConnectWallet from './components/ConnectWallet';
import UsernameInput from './components/UsernameInput';
import ProfileResults from './components/ProfileResults';
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
  
  // NEW: State for registered username
  const [registeredUsername, setRegisteredUsername] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
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
              
              // NEW: Check if this wallet has a registered username
              await checkRegisteredUsername(contract, accounts[0]);
            }
          }
        } catch (error) {
          console.error("Failed to connect to wallet:", error);
        }
      }
      
      setLoading(false);
    };
    
    init();
  }, [contractAddress]);
  
  // NEW: Function to check if wallet has a registered username
  const checkRegisteredUsername = async (contract, address) => {
    try {
      setCheckingUsername(true);
      
      // Call the contract to check for registered username
      const hasUsername = await contract.hasRegisteredUsername(address);
      
      if (hasUsername) {
        const username = await contract.getWalletUsername(address);
        setRegisteredUsername(username);
      } else {
        setRegisteredUsername(null);
      }
    } catch (error) {
      console.error("Error checking registered username:", error);
      setRegisteredUsername(null);
    } finally {
      setCheckingUsername(false);
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
          
          // NEW: Check if this wallet has a registered username
          await checkRegisteredUsername(contract, accounts[0]);
        }
      } catch (error) {
        console.error("Failed to connect to wallet:", error);
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
    setRegisteredUsername(null);
  };
  
  // NEW: Function to update registered username
  const updateRegisteredUsername = (username) => {
    setRegisteredUsername(username);
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
            
            // NEW: Check if this wallet has a registered username
            await checkRegisteredUsername(contract, accounts[0]);
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
  
  // App context values to pass to components
  const appContextValue = {
    account,
    provider,
    signer,
    contract,
    loading,
    connectWallet,
    disconnectWallet,
    registeredUsername,
    updateRegisteredUsername
  };
  
  if (loading || checkingUsername) {
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
          username={registeredUsername} 
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                account ? (
                  registeredUsername ? (
                    <Navigate to={`/results/${registeredUsername}`} replace />
                  ) : (
                    <Navigate to="/analyze" replace />
                  )
                ) : (
                  <ConnectWallet onConnect={connectWallet} />
                )
              } 
            />
            
            <Route 
              path="/analyze" 
              element={
                account ? (
                  <UsernameInput 
                    account={account} 
                    contract={contract}
                    onRegister={updateRegisteredUsername}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/results/:username" 
              element={
                account ? (
                  <ProfileResults 
                    account={account} 
                    contract={contract}
                    isRegistered={Boolean(registeredUsername)}
                  />
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