import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitHubProfileAnalyzer } from '../services/githubAnalyzer';

const UsernameInput = ({ account, contract, onRegister }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // NEW: State for whether to register wallet
  const [registerWallet, setRegisterWallet] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Check if profile already exists on blockchain
      const existingProfile = await contract.getProfileScore(username);
      
      if (existingProfile.exists) {
        // If profile exists but we want to register wallet
        if (registerWallet) {
          try {
            // Register wallet with username
            const tx = await contract.registerUserWallet(username);
            await tx.wait();
            
            // Update the registered username in the parent component
            if (onRegister) {
              onRegister(username);
            }
          } catch (error) {
            console.error("Error registering wallet:", error);
            // Continue to profile even if registration fails
          }
        }
        
        // Navigate to results
        navigate(`/results/${username}`);
        return;
      }
      
      // Analyze GitHub profile
      const analyzer = new GitHubProfileAnalyzer();
      const analysis = await analyzer.analyze(username);
      
      // Store on blockchain
      const tx = await contract.addProfileScore(
        analysis.username,
        Math.round(analysis.overallScore),
        analysis.metrics.profileCompleteness,
        analysis.metrics.followers,
        analysis.metrics.repositories,
        analysis.metrics.stars,
        analysis.metrics.languageDiversity,
        analysis.metrics.hasPopularRepos === 'Yes',
        analysis.metrics.recentActivity,
        registerWallet // NEW: Pass the register wallet flag
      );
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Update the registered username in the parent component if registering
      if (registerWallet && onRegister) {
        onRegister(username);
      }
      
      // Navigate to results page
      navigate(`/results/${username}`);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Analyze GitHub Profile</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
              GitHub Username
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-5 w-5 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" 
                  />
                </svg>
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. octocat"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* NEW: Remember wallet checkbox */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="registerWallet"
                type="checkbox"
                checked={registerWallet}
                onChange={(e) => setRegisterWallet(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="registerWallet" className="ml-2 block text-sm text-gray-700">
                Remember this GitHub username for my wallet
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This will associate your GitHub username with your wallet address, so you won't need to re-enter it next time.
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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
                  Analyzing...
                </>
              ) : (
                'Analyze Profile'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>
            This will analyze the GitHub profile and store the results on the blockchain.
            <br />
            You will need to confirm a transaction in your wallet.
          </p>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">How It Works</h2>
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                1
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-700">
                We analyze the GitHub profile using various metrics including repositories, stars, followers, and activity level.
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
                A score is calculated based on these metrics, with higher emphasis on star count, activity, and repository quality.
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
                The results are permanently stored on the blockchain, creating an immutable record of the developer's profile score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameInput;