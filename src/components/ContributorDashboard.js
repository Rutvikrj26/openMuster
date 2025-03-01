import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGithub, FaStar, FaCode, FaHistory } from 'react-icons/fa';

const ContributorDashboard = ({ account, contract, profileContract }) => {
  const [profileData, setProfileData] = useState(null);
  const [activeBounties, setActiveBounties] = useState([]);
  const [completedBounties, setCompletedBounties] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!account || !contract || !profileContract) {
        setLoading(false);
        return;
      }
      
      try {
        // Get contributor's GitHub info
        const [username, verified] = await profileContract.getWalletGitHubInfo(account);
        
        if (!username || !verified) {
          setError("Please connect your GitHub account to view your dashboard");
          setLoading(false);
          return;
        }
        
        // Get contributor's profile score
        const profile = await profileContract.getProfileScore(username);
        
        // Get contributor's active bounties
        const activeBountiesData = await contract.getContributorActiveBounties(account);
        
        // Get contributor's completed bounties
        const completedBountiesData = await contract.getContributorCompletedBounties(account);
        
        // Calculate total earnings
        const totalEarnings = completedBountiesData.reduce(
          (sum, bounty) => sum + Number(bounty.amount), 
          0
        );
        
        setProfileData({
          username,
          score: profile.overallScore,
          followers: profile.followers,
          repoCount: profile.repoCount,
          totalStars: profile.totalStars,
          languageDiversity: profile.languageDiversity,
          recentActivity: profile.recentActivity
        });
        
        setActiveBounties(activeBountiesData);
        setCompletedBounties(completedBountiesData);
        setEarnings(totalEarnings);
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [account, contract, profileContract]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <div className="text-center">
          <Link 
            to="/connect-github"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Connect GitHub
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Contributor Dashboard</h1>
      
      {/* Profile Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <FaGithub className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{profileData?.username}</h2>
              <p className="text-gray-500">GitHub Profile Score: <span className="font-semibold text-blue-600">{profileData?.score}/100</span></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-md text-center">
              <div className="text-xl font-bold text-blue-700">{profileData?.followers}</div>
              <div className="text-sm text-blue-600">Followers</div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-md text-center">
              <div className="text-xl font-bold text-green-700">{profileData?.repoCount}</div>
              <div className="text-sm text-green-600">Repositories</div>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-md text-center">
              <div className="text-xl font-bold text-purple-700">{profileData?.totalStars}</div>
              <div className="text-sm text-purple-600">Total Stars</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Earnings Tier Based on Score</span>
            <span className="text-sm font-medium text-blue-600">{profileData?.score}/100</span>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded-full">
            <div 
              className="h-3 bg-blue-600 rounded-full" 
              style={{ width: `${profileData?.score}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0-20%: 10 tokens</span>
            <span>20-40%: 20 tokens</span>
            <span>40-60%: 40 tokens</span>
            <span>60-80%: 60 tokens</span>
            <span>80-100%: 100%</span>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Active Bounties</h3>
            <div className="bg-blue-100 text-blue-600 rounded-full h-8 w-8 flex items-center justify-center">
              {activeBounties.length}
            </div>
          </div>
          <p className="text-gray-500 mt-2">Bounties you're currently working on</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
            <div className="bg-green-100 text-green-600 rounded-full h-8 w-8 flex items-center justify-center">
              {completedBounties.length}
            </div>
          </div>
          <p className="text-gray-500 mt-2">Bounties you've successfully completed</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Total Earnings</h3>
            <div className="text-xl font-bold text-green-600">{earnings} <span className="text-sm">tokens</span></div>
          </div>
          <p className="text-gray-500 mt-2">Tokens earned from completed bounties</p>
        </div>
      </div>
      
      {/* Active Bounties */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Active Bounties</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {activeBounties.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>You don't have any active bounties.</p>
              <Link 
                to="/explore-bounties"
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                Explore available bounties →
              </Link>
            </div>
          ) : (
            activeBounties.map(bounty => (
              <div key={bounty.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{bounty.issueTitle}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FaCode className="mr-1" />
                      <span>Project: {bounty.projectName}</span>
                      <span className="mx-2">•</span>
                      <span>Assigned: {new Date(bounty.assignedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="bg-blue-50 px-3 py-1 rounded-full text-sm font-medium text-blue-700">
                      {bounty.amount} tokens
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <Link 
                    to={`/bounties/${bounty.projectId}/${bounty.issueId}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Completed Bounties */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Completed Bounties</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {completedBounties.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>You haven't completed any bounties yet.</p>
            </div>
          ) : (
            completedBounties.map(bounty => (
              <div key={bounty.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{bounty.issueTitle}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FaCode className="mr-1" />
                      <span>Project: {bounty.projectName}</span>
                      <span className="mx-2">•</span>
                      <span>Completed: {new Date(bounty.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="bg-green-50 px-3 py-1 rounded-full text-sm font-medium text-green-700">
                      {bounty.amount} tokens
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <Link 
                    to={`/bounties/${bounty.projectId}/${bounty.issueId}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributorDashboard;