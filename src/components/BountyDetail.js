import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaGithub, FaArrowLeft, FaStar, FaCode, FaUserAlt } from 'react-icons/fa';
import { marked } from 'marked';
import { formatTokenAmount, calculateEligibleAmount } from '../utils/ethersUtils';

const BountyDetail = ({ account, contract, profileContract }) => {
  const { projectId, issueId } = useParams();
  const [bounty, setBounty] = useState(null);
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [profileScore, setProfileScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!contract || !projectId || !issueId) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Fetch bounty details from smart contract
      const fetchBountyDetails = async () => {
        const bountyData = await contract.getBountyByProjectAndIssue(projectId, issueId);
        
        if (!bountyData || !bountyData.exists) {
          setError('Bounty not found');
          setLoading(false);
          return;
        }
        
        // Format bounty data
        const formattedBounty = {
          amount: bountyData.amount, // Keep as BigNumber for now
          status: getBountyStatusString(bountyData.status),
          assignee: bountyData.assignee,
          difficultyLevel: bountyData.difficultyLevel,
          issueTitle: bountyData.issueTitle,
          issueUrl: bountyData.issueUrl,
          createdAt: new Date(bountyData.createdAt.toNumber() * 1000).toLocaleString(),
          exists: bountyData.exists
        };
        
        setBounty(formattedBounty);
        
        // Fetch project details
        const projectData = await contract.getProject(projectId);
        setProject(projectData);
        
        // Fetch issue details from GitHub API
        if (formattedBounty.issueUrl) {
          try {
            const issueUrlParts = new URL(formattedBounty.issueUrl).pathname.split('/');
            const owner = issueUrlParts[1];
            const repo = issueUrlParts[2];
            const issueNumber = issueUrlParts[4];
            
            const token = localStorage.getItem('github_access_token');
            const headers = token ? { 'Authorization': `token ${token}` } : {};
            
            const response = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
              { headers }
            );
            
            if (response.ok) {
              const issueData = await response.json();
              setIssue(issueData);
            }
          } catch (err) {
            console.warn('Could not fetch detailed issue data from GitHub', err);
          }
        }
        
        // If profileContract is available and user is connected, fetch their profile score
        if (profileContract && account) {
          try {
            const userInfo = await profileContract.getWalletGitHubInfo(account);
            if (userInfo && userInfo.verified) {
              const username = userInfo.username;
              const profile = await profileContract.getProfileScore(username);
              
              if (profile && profile.exists) {
                setProfileScore(profile.overallScore);
              }
            }
          } catch (err) {
            console.warn('Could not fetch profile score', err);
          }
        }
        
        setLoading(false);
      };

      fetchBountyDetails();
    } catch (err) {
      console.error('Error fetching bounty details:', err);
      setError(`Failed to fetch bounty details: ${err.message}`);
      setLoading(false);
    }
  }, [contract, projectId, issueId, account, profileContract]);


  const applyForBounty = async () => {
    if (!contract || !account || !bounty) return;
    
    setApplying(true);
    try {
      const tx = await contract.applyForBounty(projectId, issueId);
      await tx.wait();
      
      alert('Successfully applied for bounty!');
      // Refresh bounty data to update status
      const bountyData = await contract.getBountyByProjectAndIssue(projectId, issueId);
      setBounty({
        ...bounty,
        status: getBountyStatusString(bountyData.status),
        assignee: bountyData.assignee
      });
    } catch (err) {
      console.error('Error applying for bounty:', err);
      alert(`Failed to apply for bounty: ${err.message}`);
    }
    setApplying(false);
  };
  
  // Helper function to convert numeric status to string
  const getBountyStatusString = (statusCode) => {
    const statuses = ['OPEN', 'ASSIGNED', 'SUBMITTED', 'COMPLETED', 'CANCELLED'];
    return statuses[statusCode] || 'UNKNOWN';
  };
  
  // Render markdown content safely
  const renderMarkdown = (content) => {
    if (!content) return '';
    return { __html: marked(content) };
  };
  
  // Calculate eligible amount based on profile score
  const eligibleAmount = bounty ? calculateEligibleAmount(profileScore, bounty.amount) : null;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
        <div className="mt-4">
          <Link to="/dashboard" className="text-blue-600 hover:underline flex items-center">
            <FaArrowLeft className="mr-1" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  if (!bounty) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <Link 
        to={`/projects/${projectId}/bounties`} 
        className="inline-flex items-center text-blue-600 hover:underline mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to Bounties
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Bounty Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">{bounty.issueTitle}</h1>
            <span 
              className={`px-3 py-1 rounded-full text-sm font-medium
                ${bounty.status === 'OPEN' ? 'bg-green-100 text-green-800' : 
                  bounty.status === 'ASSIGNED' ? 'bg-yellow-100 text-yellow-800' : 
                  bounty.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }
              `}
            >
              {bounty.status}
            </span>
          </div>
          
          <div className="mt-2 flex flex-wrap items-center text-sm text-gray-300">
            <span className="flex items-center mr-4">
              <FaGithub className="mr-1" />
              <a 
                href={bounty.issueUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on GitHub
              </a>
            </span>
            
            <span className="flex items-center mr-4">
              <FaCode className="mr-1" />
              Difficulty: {bounty.difficultyLevel.charAt(0).toUpperCase() + bounty.difficultyLevel.slice(1)}
            </span>
            
            <span className="flex items-center">
              <FaStar className="mr-1" />
              Created: {bounty.createdAt}
            </span>
          </div>
        </div>
        
        {/* Reward Section */}
        <div className="p-6 bg-blue-50 border-b">
          <h2 className="text-lg font-semibold text-blue-800">Bounty Reward</h2>
          <div className="mt-3 flex justify-between items-center">
            <div>
              <span className="text-3xl font-bold text-blue-700">{formatTokenAmount(bounty.amount)}</span>
              
              {profileScore !== null && (
                <div className="mt-1 text-sm text-blue-600">
                  Your profile score: <span className="font-semibold">{profileScore}/100</span>
                  <div>
                    You're eligible for <span className="font-semibold">{eligibleAmount.percentage}</span> of the bounty 
                    (<span className="font-semibold">{eligibleAmount.amount} tokens</span>)
                  </div>
                </div>
              )}
            </div>
            
            {bounty.status === 'OPEN' && account && (
              <button
                onClick={applyForBounty}
                disabled={applying}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${
                  applying ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {applying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Applying...
                  </>
                ) : (
                  'Apply for Bounty'
                )}
              </button>
            )}
            
            {bounty.status === 'ASSIGNED' && bounty.assignee.toLowerCase() === account?.toLowerCase() && (
              <div className="text-yellow-700 font-medium">
                You are working on this bounty
              </div>
            )}
            
            {bounty.status === 'ASSIGNED' && bounty.assignee.toLowerCase() !== account?.toLowerCase() && (
              <div className="text-gray-500">
                <FaUserAlt className="inline mr-1" />
                Assigned to another contributor
              </div>
            )}
          </div>
        </div>
        
        {/* Issue Description */}
        {issue && (
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Issue Description</h2>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={renderMarkdown(issue.body)} />
            </div>
          </div>
        )}
        
        {/* Requirements */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Requirements</h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Review the full issue on GitHub before applying</li>
            <li>Submit a pull request that addresses all issue requirements</li>
            <li>Include comprehensive test coverage for your changes</li>
            <li>Your submission will be reviewed by the project maintainers</li>
            <li>Payment is released after your pull request is approved and merged</li>
          </ul>
          
          {!account && (
            <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-md p-4">
              <p className="text-yellow-700">
                Connect your wallet to apply for this bounty.
              </p>
            </div>
          )}
          
          {account && profileScore === null && (
            <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-md p-4">
              <p className="text-yellow-700">
                Complete your GitHub profile analysis to see your eligibility for this bounty.
              </p>
              <Link 
                to="/analyze" 
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                Analyze your GitHub profile →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BountyDetail;