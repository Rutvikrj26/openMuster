import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConnectGitHub = ({ account, contract, onVerificationSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate();
  
  const OAUTH_SERVER_URL = process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:3001';

  // Check if the wallet is already verified
  useEffect(() => {
    const checkVerification = async () => {
      if (!account || !contract) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Call the contract to check verification status
        const [username, verified, timestamp] = await contract.getWalletGitHubInfo(account);
        
        setVerificationStatus({
          username: username || '',
          verified,
          timestamp: timestamp?.toString() || '0'
        });
        
        // If verified, call the onVerificationSuccess callback
        if (verified && username) {
          onVerificationSuccess(username);
        }
      } catch (error) {
        console.error('Error checking verification:', error);
        setError('Failed to check verification status');
      } finally {
        setLoading(false);
      }
    };
    
    checkVerification();
  }, [account, contract, onVerificationSuccess]);

  // Start the GitHub OAuth flow
  const initiateGitHubAuth = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Call the OAuth server to get the GitHub authorization URL
      const response = await axios.get(`${OAUTH_SERVER_URL}/api/auth/github?wallet=${account}`);
      
      // Redirect to GitHub for authorization
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error initiating GitHub auth:', error);
      setError('Failed to connect to GitHub. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <svg 
            className="h-16 w-16 mx-auto text-gray-700" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Connect Your GitHub Account</h1>
        
        <p className="text-gray-600 mb-6 text-center">
          To analyze your GitHub profile including private repositories, we need to verify that you own the account.
        </p>
        
        {verificationStatus?.verified ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Verified GitHub Account
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your wallet is verified with GitHub username <strong>{verificationStatus.username}</strong>.</p>
                  <p className="mt-1 text-xs text-green-600">
                    Verified on {new Date(parseInt(verificationStatus.timestamp) * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={initiateGitHubAuth}
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <svg 
                    className="h-5 w-5 mr-2" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z" clipRule="evenodd" />
                  </svg>
                  Connect with GitHub
                </>
              )}
            </button>
          </>
        )}
        
        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>
            This will redirect you to GitHub to authorize our application.
            <br />
            We only request read access to your profile and repositories.
          </p>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Why Connect GitHub?</h2>
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                1
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-700">
                <strong>Secure Verification</strong> - We verify that you actually own the GitHub account associated with your wallet.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                2
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-700">
                <strong>Include Private Repositories</strong> - Your private repositories can be included in your score calculation.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                3
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-700">
                <strong>Private Data Protection</strong> - We use zero-knowledge proofs to include private repo metrics without exposing sensitive data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectGitHub;