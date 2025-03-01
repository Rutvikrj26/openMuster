import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaCode, FaSortAmountDown, FaFilter } from 'react-icons/fa';

const ExploreBounties = ({ account, contract, profileContract }) => {
  const [bounties, setBounties] = useState([]);
  const [filteredBounties, setFilteredBounties] = useState([]);
  const [profileScore, setProfileScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!contract) {
        setLoading(false);
        setError("Contract not initialized");
        return;
      }
      
      try {
        // Fetch all open bounties
        const allBounties = await contract.getAllOpenBounties();
        setBounties(allBounties);
        
        // If account is connected, get profile score
        if (account && profileContract) {
          try {
            const [username, verified] = await profileContract.getWalletGitHubInfo(account);
            if (username && verified) {
              const profile = await profileContract.getProfileScore(username);
              setProfileScore(profile.overallScore);
            }
          } catch (err) {
            console.warn("Could not get profile score:", err);
            // Continue without profile score
          }
        }
        
      } catch (err) {
        console.error("Error loading bounties:", err);
        setError("Failed to load bounties. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [account, contract, profileContract]);
  
  // Apply filters and sorting whenever they change
  useEffect(() => {
    let result = [...bounties];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(bounty => 
        bounty.issueTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bounty.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter(bounty => 
        bounty.difficultyLevel === difficultyFilter
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'highest-reward':
        result.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case 'easiest':
        const difficultyOrder = { 'easy': 0, 'medium': 1, 'hard': 2, 'expert': 3 };
        result.sort((a, b) => difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel]);
        break;
      default:
        // Default to newest
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredBounties(result);
  }, [bounties, searchTerm, difficultyFilter, sortBy]);
  
  // Helper function to calculate eligible amount based on profile score
  const getEligibleAmount = (totalAmount, score) => {
    if (!score) return { amount: '?', percentage: '?' };
    
    let percentage, amount;
    
    if (score >= 80) {
      percentage = '100%';
      amount = totalAmount;
    } else if (score >= 60) {
      percentage = '60%';
      amount = Math.floor(totalAmount * 0.6);
    } else if (score >= 40) {
      percentage = '40%';
      amount = Math.floor(totalAmount * 0.4);
    } else if (score >= 20) {
      percentage = '20%';
      amount = Math.floor(totalAmount * 0.2);
    } else {
      percentage = '10%';
      amount = Math.floor(totalAmount * 0.1);
    }
    
    return { amount, percentage };
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Bounties</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search bounties by title or project name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-700 hover:text-blue-600"
          >
            <FaFilter className="mr-2" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
          
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="highest-reward">Highest Reward</option>
              <option value="easiest">Easiest</option>
            </select>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Filter by Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDifficultyFilter('all')}
                className={`px-3 py-1 rounded-md ${
                  difficultyFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDifficultyFilter('easy')}
                className={`px-3 py-1 rounded-md ${
                  difficultyFilter === 'easy'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => setDifficultyFilter('medium')}
                className={`px-3 py-1 rounded-md ${
                  difficultyFilter === 'medium'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setDifficultyFilter('hard')}
                className={`px-3 py-1 rounded-md ${
                  difficultyFilter === 'hard'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                Hard
              </button>
              <button
                onClick={() => setDifficultyFilter('expert')}
                className={`px-3 py-1 rounded-md ${
                  difficultyFilter === 'expert'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                Expert
              </button>
            </div>
          </div>
        )}
      </div>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          {/* Profile Score Notice */}
          {account && !profileScore && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">Your GitHub profile isn't analyzed yet</p>
              <p className="mt-1">
                Complete your profile analysis to see your eligible rewards for each bounty.
              </p>
              <Link
                to="/analyze"
                className="inline-block mt-2 text-blue-600 hover:underline"
              >
                Analyze your GitHub profile →
              </Link>
            </div>
          )}
          
          {/* Bounties Grid */}
          {filteredBounties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No bounties found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBounties.map(bounty => {
                const eligibleAmount = getEligibleAmount(bounty.amount, profileScore);
                
                return (
                  <div key={bounty.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="px-6 py-4 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">#{bounty.issueNumber}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          bounty.difficultyLevel === 'easy' ? 'bg-green-100 text-green-800' :
                          bounty.difficultyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          bounty.difficultyLevel === 'hard' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {bounty.difficultyLevel.charAt(0).toUpperCase() + bounty.difficultyLevel.slice(1)}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-800 truncate">{bounty.issueTitle}</h3>
                      <p className="text-sm text-gray-500 mt-1">{bounty.projectName}</p>
                    </div>
                    
                    <div className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xl font-bold text-blue-600">{bounty.amount} <span className="text-sm">tokens</span></div>
                          {profileScore !== null && (
                            <div className="text-xs text-gray-500 mt-1">
                              You're eligible for: <span className="font-medium text-blue-600">{eligibleAmount.amount} tokens ({eligibleAmount.percentage})</span>
                            </div>
                          )}
                        </div>
                        <Link
                          to={`/bounties/${bounty.projectId}/${bounty.issueId}`}
                          className="inline-flex items-center px-3 py-1 border border-blue-600 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 focus:outline-none"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExploreBounties;