import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { GitHubProfileAnalyzer } from '../services/githubAnalyzer';

const ProfileResults = ({ account, contract, isRegistered }) => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // NEW: State for recalculation
  const [recalculating, setRecalculating] = useState(false);

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
          analyzedBy: data.analyzedBy
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

  // NEW: Function to recalculate profile score
  const handleRecalculate = async () => {
    if (!contract || !username) return;
    
    try {
      setRecalculating(true);
      setError('');
      
      // Analyze GitHub profile
      const analyzer = new GitHubProfileAnalyzer();
      const analysis = await analyzer.analyze(username);
      
      // Store on blockchain - don't register wallet again
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
        false // Don't register wallet again
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
        analyzedBy: account
      };
      
      setProfileData(updatedData);
      
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
                <h1 className="text-2xl font-bold">{username}</h1>
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
          
          {/* NEW: Recalculate button for registered users */}
          {isRegistered && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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
                    Recalculate Score
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Score breakdown */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h2>
          
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
                  Public repos
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
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center">
        <Link 
          to="/analyze" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          Analyze Another Profile
        </Link>
      </div>
    </div>
  );
};

export default ProfileResults;