import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import { GitHubProfileAnalyzer } from '../services/githubAnalyzer';
import ZKPrivateProof from './ZKPrivateProof';
import ProofBadges from './ProofBadges';

const ProfileResults = ({ account, contract, isVerified, verifiedUsername }) => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recalculating, setRecalculating] = useState(false);
  const [githubToken, setGithubToken] = useState(null);
  const [zkProofs, setZkProofs] = useState([]);
  const [showZkProofSection, setShowZkProofSection] = useState(false);

  // New state for OAuth token
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  // Check if this is the verified user's own profile
  const isOwnVerifiedProfile = isVerified && verifiedUsername === username;
  
  const OAUTH_SERVER_URL = process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!contract || !username) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Get profile data from blockchain
        const data = await contract.getProfileScore(username);
        
        if (!data.exists) {
          setError(`No data found for GitHub user ${username}`);
          setLoading(false);
          return;
        }
        
        // Format the data
        const formattedData = {
          username: data.username,
          analyzedAt: new Date(data.timestamp.toNumber() * 1000).toISOString(),
          overallScore: data.overallScore,
          metrics: {
            profileCompleteness: data.profileCompleteness,
            followers: data.followers,
            repositories: data.repoCount,
            stars: data.totalStars,
            languageDiversity: data.languageDiversity,
            hasPopularRepos: data.hasPopularRepos ? 'Yes' : 'No',
            recentActivity: data.recentActivity
          },
          analyzedBy: data.analyzedBy,
          includesPrivateRepos: data.includesPrivateRepos
        };
        
        setProfileData(formattedData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError(`Error fetching data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [contract, username]);

  useEffect(() => {
    const checkZkProofs = async () => {
      if (!contract || !username || !profileData) return;
      
      try {
        // Check if the profile has ZK verifications
        if (profileData.hasZkVerification) {
          // Get all ZK proof verifications
          const allProofs = await contract.getAllZkProofVerifications(username);
          
          // Format for our component
          const formattedProofs = allProofs.map(proof => ({
            proofType: proof.proofType,
            verificationId: proof.verificationId,
            txHash: proof.txHash,
            verifiedAt: new Date(proof.verifiedAt.toNumber() * 1000)
          }));
          
          setZkProofs(formattedProofs);
        }
      } catch (error) {
        console.error('Error fetching ZK proofs:', error);
      }
    };
    
    checkZkProofs();
  }, [contract, username, profileData]);

  const handleProofGenerated = async (proofs, verificationResult) => {
    // Update local state with the new proofs
    const newProofs = proofs.map(proof => ({
      proofType: proof.proofType,
      verificationId: proof.proofId,
      txHash: verificationResult?.txHash || '',
      verifiedAt: new Date()
    }));
    
    setZkProofs(newProofs);

    setProfileData(prev => ({
        ...prev,
        hasZkVerification: true
      }));

    await fetchProfileData();

   };

  // Function to recalculate profile score
  const handleRecalculate = async (includePrivateRepos = false) => {
    if (!contract || !username) return;
    
    try {
      setRecalculating(true);
      setError('');
      
      // If including private repos, we need to fetch them through the OAuth server
      let privateRepoData = null;
      if (includePrivateRepos && githubToken) {
        try {
          const response = await axios.get(
            `${OAUTH_SERVER_URL}/api/github/repos/${username}?token=${githubToken}`
          );
          privateRepoData = response.data;
        } catch (error) {
          console.error('Error fetching private repo data:', error);
          setError('Failed to fetch private repository data. Please check your token.');
          setRecalculating(false);
          return;
        }
      }
      
      // Analyze GitHub profile
      const analyzer = new GitHubProfileAnalyzer();
      const analysis = await analyzer.analyze(username, privateRepoData);
      
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
        includePrivateRepos
      );
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Update profile data with new values
      const updatedData = {
        username: analysis.username,
        analyzedAt: new Date().toISOString(),
        overallScore: analysis.overallScore,
        metrics: {
          profileCompleteness: analysis.metrics.profileCompleteness,
          followers: analysis.metrics.followers,
          repositories: analysis.metrics.repositories,
          stars: analysis.metrics.stars,
          languageDiversity: analysis.metrics.languageDiversity,
          hasPopularRepos: analysis.metrics.hasPopularRepos,
          recentActivity: analysis.metrics.recentActivity
        },
        analyzedBy: account,
        includesPrivateRepos
      };
      
      setProfileData(updatedData);
      
      // Clear token after successful analysis
      if (includePrivateRepos) {
        setGithubToken(null);
        setShowTokenInput(false);
      }
      
    } catch (error) {
      console.error('Error recalculating profile:', error);
      setError(`Error recalculating profile: ${error.message}`);
    } finally {
      setRecalculating(false);
    }
  };

  // Function to determine score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Function to format address
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading profile data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <svg 
            className="h-16 w-16 text-red-500 mx-auto" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mt-4">{error}</h2>
          <p className="text-gray-600 mt-2">The requested profile could not be found on the blockchain.</p>
          <Link 
            to="/analyze" 
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Analyze a Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  className="h-16 w-16 rounded-full border-2 border-white shadow-md" 
                  src={`https://github.com/${username}.png`} 
                  alt={`${username}'s avatar`}
                />
              </div>
              <div className="ml-4 text-white">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold">{username}</h1>
                  {profileData.includesPrivateRepos && (
                    <span className="ml-2 bg-blue-900 text-blue-100 text-xs px-2 py-0.5 rounded-full">
                      Includes Private Data
                    </span>
                  )}
                </div>
                <a 
                  href={`https://github.com/${username}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white text-sm inline-flex items-center"
                >
                  <svg 
                    className="h-4 w-4 mr-1" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white">
                {profileData.overallScore}
              </div>
              <div className="text-blue-100 text-sm">Overall Score</div>
            </div>
          </div>
          
          {/* Recalculate buttons for verified users */}
          {isOwnVerifiedProfile && (
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {/* Button to recalculate with public data only */}
              <button
                onClick={() => handleRecalculate(false)}
                disabled={recalculating}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  recalculating ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {recalculating ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" 
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
                    Updating...
                  </>
                ) : (
                  <>
                    <svg 
                      className="mr-2 h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                    Update Public Data
                  </>
                )}
              </button>
              
              {/* Button to show/hide private data token input */}
              <button
                onClick={() => setShowTokenInput(!showTokenInput)}
                disabled={recalculating}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-900 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg 
                  className="mr-2 h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
                Include Private Repos
              </button>
            </div>
          )}
          
          {/* Token input for private repo access */}
          {showTokenInput && (
            <div className="mt-3 bg-white bg-opacity-10 rounded-md p-3">
              <label className="block text-sm font-medium text-white mb-1">
                GitHub Personal Access Token
              </label>
              <div className="flex">
                <input
                  type="password"
                  value={githubToken || ''}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="Enter your GitHub token with repo scope"
                  className="flex-grow min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <div className="flex items-center mt-2">
                <input
                    type="checkbox"
                    id="useZkProofs"
                    checked={showZkProofSection}
                    onChange={e => setShowZkProofSection(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="useZkProofs" className="ml-2 block text-sm text-blue-100">
                    Use zero-knowledge proofs to protect private repo data
                </label>
                </div>
                <button
                  onClick={() => handleRecalculate(true)}
                  disabled={!githubToken || recalculating}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze All Repos
                </button>
              </div>
              <p className="mt-1 text-xs text-blue-100">
                Your token is used only for this analysis and never stored. Create a token with 'repo' scope at GitHub Developer Settings.
              </p>
            </div>
          )}
        </div>

        {showZkProofSection && privateRepoData && (
        <ZKPrivateProof
            privateRepoData={privateRepoData}
            contract={contract}
            account={account}
            username={username}
            onProofGenerated={handleProofGenerated}
        />
        )}

        {/* Score breakdown */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h2>

          {zkProofs.length > 0 && (
            <div className="px-6 py-3 bg-indigo-50">
                <ProofBadges proofs={zkProofs} />
            </div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Profile Completeness</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-xl font-semibold text-gray-900">
                  {profileData.metrics.profileCompleteness}%
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Personal details & bio
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Followers</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-xl font-semibold text-gray-900">
                  {profileData.metrics.followers}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  GitHub followers
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Repositories</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-xl font-semibold text-gray-900">
                  {profileData.metrics.repositories}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {profileData.includesPrivateRepos ? 'All repos' : 'Public repos'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Stars</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-xl font-semibold text-gray-900">
                  {profileData.metrics.stars}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Total across all repos
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Language Diversity</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-xl font-semibold text-gray-900">
                  {profileData.metrics.languageDiversity}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Different languages used
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Has Popular Repos</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-xl font-semibold text-gray-900">
                  {profileData.metrics.hasPopularRepos}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Repos with 10+ stars
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Recent Activity</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-xl font-semibold text-gray-900">
                  {profileData.metrics.recentActivity}/100
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Based on recent events
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blockchain info */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Blockchain Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Analyzed On:</span>
              <p className="mt-1 text-gray-900">{formatDate(profileData.analyzedAt)}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-500">Analyzed By:</span>
              <p className="mt-1 text-gray-900">
                <a 
                  href={`https://sepolia.basescan.org/address/${profileData.analyzedBy}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {formatAddress(profileData.analyzedBy)}
                  {account.toLowerCase() === profileData.analyzedBy.toLowerCase() && 
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">You</span>
                  }
                </a>
              </p>
            </div>
            
            <div>
              <span className="font-medium text-gray-500">Data Privacy:</span>
              <p className="mt-1 text-gray-900">
                {profileData.includesPrivateRepos ? (
                  <span className="text-green-600 font-medium">Includes private repositories</span>
                ) : (
                  <span className="text-gray-500">Public repositories only</span>
                )}
              </p>
            </div>
            
            <div>
                <span className="font-medium text-gray-500">Data Privacy:</span>
                <p className="mt-1 text-gray-900">
                    {profileData.includesPrivateRepos ? (
                    <span className="text-green-600 font-medium">
                        {profileData.hasZkVerification 
                        ? "Includes private repositories (ZK verified)" 
                        : "Includes private repositories"}
                    </span>
                    ) : (
                    <span className="text-gray-500">Public repositories only</span>
                    )}
                </p>
                </div>          
            </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center space-x-4">
        <Link 
          to="/analyze" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          Analyze Another Profile
        </Link>
        
        {!isVerified && (
          <Link 
            to="/connect-github" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z" clipRule="evenodd" />
            </svg>
            Verify Your GitHub
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProfileResults;