import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BountyCreationModal from './BountyCreationModal';
import { FaGithub, FaTag, FaLock, FaLockOpen, FaUsers, FaStar } from 'react-icons/fa';
import { formatTokenAmount } from '../utils/ethersUtils';

const BountyList = ({ account, contract, projectId, repositoryUrl }) => {
  const [issues, setIssues] = useState([]);
  const [bounties, setBounties] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filter, setFilter] = useState('all'); // all, open, closed
  const [sort, setSort] = useState('newest'); // newest, oldest, most-commented
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Parse owner and repo from GitHub URL
  const getRepoInfo = () => {
    try {
      const url = new URL(repositoryUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        return {
          owner: pathParts[0],
          repo: pathParts[1]
        };
      }
      return null;
    } catch (e) {
      console.error('Invalid repository URL', e);
      return null;
    }
  };

  // Fetch issues from GitHub
  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    
    const repoInfo = getRepoInfo();
    if (!repoInfo) {
      setError('Invalid repository URL');
      setLoading(false);
      return;
    }
    
    const { owner, repo } = repoInfo;
    
    try {
      // Get GitHub access token from localStorage or your auth system
      const token = localStorage.getItem('github_access_token');
      const headers = token ? { 'Authorization': `token ${token}` } : {};
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=${filter === 'all' ? 'all' : filter}&sort=created&direction=${sort === 'newest' ? 'desc' : 'asc'}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter out pull requests (they're also returned as issues by the API)
      const filteredIssues = data.filter(issue => !issue.pull_request);
      
      setIssues(filteredIssues);
      
      // Fetch bounty details for these issues from your smart contract
      await fetchBountyDetails(filteredIssues.map(issue => issue.number));
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError(`Failed to fetch issues: ${err.message}`);
      setLoading(false);
    }
  };

  // Fetch bounty details from smart contract
  const fetchBountyDetails = async (issueNumbers) => {
    if (!contract || !projectId) return;
    
    try {
      const bountyMap = {};
      
      // For each issue, check if a bounty exists
      for (const issueNumber of issueNumbers) {
        try {
          const bountyDetails = await contract.getBountyByProjectAndIssue(
            projectId,
            issueNumber.toString()
          );
          
          if (bountyDetails && bountyDetails.exists) {
            bountyMap[issueNumber] = {
              amount: bountyDetails.amount, // Keep as BigNumber
              status: bountyDetails.status,
              assignee: bountyDetails.assignee,
              difficultyLevel: bountyDetails.difficultyLevel,
              createdAt: new Date(bountyDetails.createdAt.toNumber() * 1000).toLocaleString(),
              exists: true
            };
          }
        } catch (err) {
          console.warn(`Error fetching bounty for issue #${issueNumber}:`, err);
        }
      }
      
      setBounties(bountyMap);
    } catch (err) {
      console.error('Error fetching bounty details:', err);
    }
  };

  // Create a new bounty
  const createBounty = async (amount, difficultyLevel) => {
    if (!contract || !selectedIssue || !projectId) return;
    
    try {
      const bountyAmount = ethers.utils.parseUnits(amount.toString(), 18);
      
      const tx = await contract.createBounty(
        projectId,
        selectedIssue.number.toString(),
        bountyAmount,
        difficultyLevel,
        selectedIssue.title,
        selectedIssue.html_url
      );
      
      await tx.wait();
      
      // Refresh bounty data
      await fetchBountyDetails([selectedIssue.number]);
      setShowModal(false);
      
      // Show success message
      alert(`Bounty created successfully for issue #${selectedIssue.number}`);
    } catch (err) {
      console.error('Error creating bounty:', err);
      alert(`Failed to create bounty: ${err.message}`);
    }
  };

  // Filter issues based on search term
  const filteredIssues = issues.filter(issue => {
    return issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           issue.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           issue.number.toString().includes(searchTerm);
  });

  useEffect(() => {
    if (repositoryUrl) {
      fetchIssues();
    }
  }, [repositoryUrl, filter, sort, projectId, contract]);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 py-4 px-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">GitHub Issues</h2>
        <div className="flex items-center space-x-2">
          <div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Issues</option>
              <option value="open">Open Issues</option>
              <option value="closed">Closed Issues</option>
            </select>
          </div>
          <div>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-commented">Most Commented</option>
            </select>
          </div>
          <button 
            onClick={fetchIssues} 
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md py-2 px-3"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Issue List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-6 text-center">
            <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-300">Loading issues...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No issues found.</p>
          </div>
        ) : (
          filteredIssues.map(issue => (
            <div key={issue.id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    {issue.state === 'open' ? (
                      <FaLockOpen className="text-green-500 mr-2" />
                    ) : (
                      <FaLock className="text-red-500 mr-2" />
                    )}
                    <span className={`text-sm font-medium ${issue.state === 'open' ? 'text-green-500' : 'text-red-500'}`}>
                      {issue.state.charAt(0).toUpperCase() + issue.state.slice(1)}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm text-gray-500">
                      #{issue.number}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FaUsers className="mr-1" /> {issue.comments}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {issue.title}
                  </h3>
                  
                  <p className="mt-1 text-sm text-gray-500">
                    Opened {new Date(issue.created_at).toLocaleDateString()} by {issue.user.login}
                  </p>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {issue.labels.map(label => (
                      <span 
                        key={label.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `#${label.color}33`,
                          color: `#${label.color}`,
                          border: `1px solid #${label.color}`
                        }}
                      >
                        <FaTag className="mr-1" size={10} />
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="ml-4">
                  {/* Show bounty details if it exists */}
                  {bounties[issue.number] ? (
                    <div className="bg-green-50 rounded-md p-3 text-sm border border-green-200">
                      <div className="font-semibold text-green-800 mb-1">
                        Bounty: {formatTokenAmount(bounties[issue.number].amount)}
                      </div>
                      <div className="text-xs text-green-700">
                        Status: {bounties[issue.number].status}
                      </div>
                      <div className="text-xs text-green-700">
                        Difficulty: {bounties[issue.number].difficultyLevel}
                      </div>
                      <a 
                        href={`/bounties/${projectId}/${issue.number}`}
                        className="mt-2 block text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Details →
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedIssue(issue);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      disabled={issue.state !== 'open'}
                    >
                      Create Bounty
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bounty Creation Modal */}
      {showModal && selectedIssue && (
        <BountyCreationModal
          issue={selectedIssue}
          onClose={() => setShowModal(false)}
          onSubmit={createBounty}
        />
      )}
    </div>
  );
};

export default BountyList;