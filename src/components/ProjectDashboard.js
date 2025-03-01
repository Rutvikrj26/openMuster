import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import IssueList from './IssueList';
import BountyList from './BountyList';
import ProjectStats from './ProjectStats';

const ProjectDashboard = ({ account, contract }) => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('issues');

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const OAUTH_SERVER_URL = process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:3001';
      
      // Fetch project details
      const response = await axios.get(
        `${OAUTH_SERVER_URL}/api/projects/${projectId}`,
        { withCredentials: true }
      );
      
      if (response.data && response.data.project) {
        setProject(response.data.project);
        
        // Fetch repository issues
        const issuesResponse = await axios.get(
          `${OAUTH_SERVER_URL}/api/github/issues/${response.data.project.repositoryOwner}/${response.data.project.repositoryName}`,
          { withCredentials: true }
        );
        
        if (issuesResponse.data && issuesResponse.data.issues) {
          setIssues(issuesResponse.data.issues);
        }
        
        // Fetch bounties for this project
        const bountiesResponse = await axios.get(
          `${OAUTH_SERVER_URL}/api/bounties/project/${projectId}`,
          { withCredentials: true }
        );
        
        if (bountiesResponse.data && bountiesResponse.data.bounties) {
          setBounties(bountiesResponse.data.bounties);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to load project details. Please try again.');
      setLoading(false);
    }
  };

  const createBounty = async (issueId, bountyAmount, difficultyLevel) => {
    try {
      setLoading(true);
      const OAUTH_SERVER_URL = process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:3001';
      
      const response = await axios.post(
        `${OAUTH_SERVER_URL}/api/bounties/create`,
        {
          projectId,
          issueId,
          bountyAmount,
          difficultyLevel,
          createdBy: account
        },
        { withCredentials: true }
      );
      
      if (response.data && response.data.success) {
        // Refresh bounties
        fetchProjectDetails();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating bounty:', error);
      setError('Failed to create bounty. Please try again.');
      setLoading(false);
    }
  };

  if (loading && !project) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        {error || 'Project not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Project Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <Link 
              to={`/project/${projectId}/settings`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Project Settings
            </Link>
          </div>
          <p className="mt-2 text-gray-300">{project.description}</p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {project.repositoryOwner}/{project.repositoryName}
            </a>
          </div>
        </div>
        
        {/* Project Stats */}
        <ProjectStats project={project} issues={issues} bounties={bounties} />
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'issues'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('issues')}
            >
              Issues ({issues.length})
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'bounties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('bounties')}
            >
              Bounties ({bounties.length})
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'issues' ? (
            <IssueList 
              issues={issues} 
              bounties={bounties} 
              onCreateBounty={createBounty} 
              isProjectOwner={project.ownerAddress.toLowerCase() === account?.toLowerCase()}
            />
          ) : (
            <BountyList 
              bounties={bounties} 
              isProjectOwner={project.ownerAddress.toLowerCase() === account?.toLowerCase()}
              onRefresh={fetchProjectDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;