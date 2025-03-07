import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GitHubProfileAnalyzer } from '../services/githubAnalyzer';

const UsernameInput = ({ account, contract, verified }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      
      const normalizedUsername = username.trim().toLowerCase();

      // Check if profile already exists on blockchain
      const existingProfile = await contract.getProfileScore(normalizedUsername);
      
      if (existingProfile.exists) {
        // Navigate to results for existing profile
        navigate(`/results/${normalizedUsername}`);
        return;
      }
      
      // Analyze GitHub profile
      const analyzer = new GitHubProfileAnalyzer();
      const analysis = await analyzer.analyze(normalizedUsername);
      
      // Store on blockchain (without including private repos)
      const tx = await contract.addProfileScore(
        normalizedUsername,
        Math.round(analysis.overallScore),
        analysis.metrics.profileCompleteness,
        analysis.metrics.followers,
        analysis.metrics.repositories,
        analysis.metrics.stars,
        analysis.metrics.languageDiversity,
        analysis.metrics.hasPopularRepos === 'Yes',
        analysis.metrics.recentActivity,
        false // Don't include private repos for manual username input
      );

      console.log(`[ANALYZE] Transaction sent with hash: ${tx.hash}`);
 
      console.log(`[ANALYZE] Waiting for transaction to be mined...`);      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log(`[ANALYZE] Transaction mined in block: ${receipt.blockNumber}`);
      console.log(`[ANALYZE] Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`[ANALYZE] Events emitted:`, receipt.events);      

      // Verify data was stored - fetch immediately after transaction
      console.log(`[ANALYZE] Verifying data was stored by fetching from chain...`);
      const verificationData = await contract.getProfileScore(normalizedUsername);
      console.log(`[ANALYZE] Verification data exists flag: ${verificationData.exists}`);
      console.log(`[ANALYZE] Verification data:`, verificationData);

      
      // Navigate to results page
      navigate(`/results/${normalizedUsername}`);
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
        
        {/* Verification banner */}
        {!verified && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You're analyzing public repositories only. 
                  <Link to="/connect-github" className="font-medium text-blue-700 underline ml-1">
                    Verify your GitHub account
                  </Link> to include private data in your score.
                </p>
              </div>
            </div>
          </div>
        )}
        
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