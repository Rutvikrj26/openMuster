import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProjectOnboarding = ({ account, contract, profileContract }) => {
  const [step, setStep] = useState(1); // 1: Connect Okto, 2: Connect GitHub, 3: Configure Project
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectInfo, setProjectInfo] = useState({
    name: '',
    description: '',
    website: '',
    githubUrl: '',
    repositories: [],
    selectedRepo: ''
  });
  const [connectedRepos, setConnectedRepos] = useState([]);
  const navigate = useNavigate();

  // Check if already connected to GitHub
// Check if already connected to GitHub
useEffect(() => {
  console.log("useEffect triggered");
  console.log("account:", account);
  console.log("contract:", !!contract);
  console.log("profileContract:", !!profileContract);
  
  if (account && profileContract) { // Changed from contract to profileContract
    console.log("Calling checkGitHubConnection from useEffect");
    checkGitHubConnection();
  }
}, [account, contract, profileContract]); // Added profileContract dependency
  const checkGitHubConnection = async () => {
    try {
      // Check if user has a verified GitHub connection
      console.log("Checking GitHub connection...");
      console.log("profileContract:", !!profileContract);
      console.log("account:", account);
      
      if (profileContract && account) {
        console.log("Getting wallet GitHub info...");
        const [username, verified, timestamp] = await profileContract.getWalletGitHubInfo(account);
        console.log("GitHub info returned:", { username, verified: !!verified, timestamp });
        
        if (verified && username) {
          // If already connected, check for repositories
          console.log("GitHub is verified, fetching repositories for:", username);
          fetchUserRepositories(username);
          setStep(2); // Move to GitHub repo selection step
        } else {
          console.log("GitHub not verified or no username");
        }
      } else {
        console.log("Missing profileContract or account");
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
    }
  };
  

  const fetchUserRepositories = async (username) => {
    try {
      setLoading(true);
      const OAUTH_SERVER_URL = process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:3001';
      
      // Get repositories with admin access
      const response = await axios.get(
        `${OAUTH_SERVER_URL}/api/github/repos/${username}/authenticated`,
        { withCredentials: true } // Important for cookies
      );
      
      if (response.data && response.data.repoDetails) {
        // Filter repos where user is an admin/owner
        const adminRepos = response.data.repoDetails.filter(repo => 
          !repo.private || repo.permissions?.admin === true
        );
        
        setProjectInfo(prev => ({
          ...prev,
          repositories: adminRepos
        }));
      }
      
      // Check if any repos are already connected
      const projectResponse = await axios.get(
        `${OAUTH_SERVER_URL}/api/projects/user/${account}`,
        { withCredentials: true }
      );
      
      if (projectResponse.data && projectResponse.data.projects) {
        setConnectedRepos(projectResponse.data.projects.map(p => p.repositoryId));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories. Please reconnect your GitHub account.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleRepoSelect = (e) => {
    const repoName = e.target.value;
    const selectedRepo = projectInfo.repositories.find(r => r.name === repoName);
    
    if (selectedRepo) {
      setProjectInfo(prev => ({ 
        ...prev, 
        selectedRepo: repoName,
        name: selectedRepo.name,
        description: selectedRepo.description || '',
        githubUrl: selectedRepo.html_url || ''
      }));
    }
  };

  const connectToOkto = async () => {
    // In a real implementation, this would connect to Okto wallet
    // For now, we'll simulate a successful connection
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If we already have a GitHub connection, go straight to repo selection
      console.log("Checking GitHub in connectToOkto...");
      console.log("profileContract exists:", !!profileContract);
      
      if (profileContract) {
        console.log("Getting wallet GitHub info in connectToOkto...");
        const [username, verified, timestamp] = await profileContract.getWalletGitHubInfo(account);
        console.log("GitHub info in connectToOkto:", { username, verified: !!verified, timestamp });
        
        if (verified && username) {
          console.log("GitHub is verified in connectToOkto, moving to step 2");
          await fetchUserRepositories(username);
          setStep(2);
        } else {
          console.log("GitHub not verified in connectToOkto");
          // Otherwise go to GitHub connection
          setStep(1.5); // Between step 1 and 2 - need to connect GitHub
        }
      } else {
        console.log("No profileContract in connectToOkto");
        setStep(1.5);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error connecting to Okto:', error);
      setError('Failed to connect to Okto wallet. Please try again.');
      setLoading(false);
    }
  };
  const connectToGitHub = () => {
    // We'll use the existing GitHub connection flow
    // Redirect to the GitHub connection page
    navigate('/connect-github', { state: { returnTo: '/project-onboarding' } });
  };

  const registerProject = async () => {
    if (!projectInfo.name || !projectInfo.selectedRepo) {
      setError('Please select a repository.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const OAUTH_SERVER_URL = process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:3001';
      
      // Get the selected repository details
      const repo = projectInfo.repositories.find(r => r.name === projectInfo.selectedRepo);
      
      if (!repo) {
        throw new Error('Selected repository not found');
      }
      
      // Register the project
      const response = await axios.post(
        `${OAUTH_SERVER_URL}/api/projects/register`,
        {
          name: projectInfo.name,
          description: projectInfo.description,
          website: projectInfo.website,
          githubUrl: repo.html_url,
          repositoryId: repo.id.toString(),
          repositoryName: repo.name,
          ownerAddress: account
        },
        { withCredentials: true }
      );
      
      if (response.data && response.data.success) {
        // Navigate to project dashboard
        navigate(`/projects/${response.data.projectId}`);
      } else {
        throw new Error('Failed to register project');
      }
    } catch (error) {
      console.error('Error registering project:', error);
      setError('Failed to register project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Open Source Project Onboarding</h1>
          <p className="mt-2 text-gray-300">
            Register your open source project to create bounties from GitHub issues
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>1</div>
              <span className="text-xs mt-1">Connect Wallet</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${step > 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>2</div>
              <span className="text-xs mt-1">Connect GitHub</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${step > 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>3</div>
              <span className="text-xs mt-1">Configure Project</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Step 1: Connect Okto */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h2 className="text-lg font-semibold text-blue-800">Connect Your Okto Wallet</h2>
                <p className="mt-2 text-sm text-blue-600">
                  Okto is a web3 wallet that lets you manage project tokens and distribute bounties 
                  to contributors based on their GitHub profile scores.
                </p>
              </div>
              
              <button
                onClick={connectToOkto}
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Connect Okto Wallet
                  </>
                )}
              </button>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>
          )}
          
          {/* Step 1.5: Connect GitHub if needed */}
          {step === 1.5 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h2 className="text-lg font-semibold text-blue-800">Connect Your GitHub Account</h2>
                <p className="mt-2 text-sm text-blue-600">
                  Connect your GitHub account to select repositories for bounty creation.
                </p>
              </div>
              
              <button
                onClick={connectToGitHub}
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Connect GitHub
                  </>
                )}
              </button>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Select GitHub Repository */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h2 className="text-lg font-semibold text-green-800">Select Repository</h2>
                <p className="mt-2 text-sm text-green-600">
                  Choose a GitHub repository to create bounties from issues. You must have admin access to the repository.
                </p>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <>
                  {projectInfo.repositories.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No repositories found with admin access.</p>
                      <button
                        onClick={connectToGitHub}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Reconnect GitHub
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor="repository" className="block text-sm font-medium text-gray-700">
                            Select Repository
                          </label>
                          <select
                            id="repository"
                            name="selectedRepo"
                            value={projectInfo.selectedRepo}
                            onChange={handleRepoSelect}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">-- Select a repository --</option>
                            {projectInfo.repositories.map((repo) => (
                              <option 
                                key={repo.id} 
                                value={repo.name}
                                disabled={connectedRepos.includes(repo.id.toString())}
                              >
                                {repo.name} {repo.private ? '(Private)' : '(Public)'} 
                                {connectedRepos.includes(repo.id.toString()) ? ' - Already Connected' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          disabled={!projectInfo.selectedRepo}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${
                            !projectInfo.selectedRepo ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          Next: Configure Project
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Configure Project */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
                <h2 className="text-lg font-semibold text-green-800">Configure Project Details</h2>
                <p className="mt-2 text-sm text-green-600">
                  Provide additional details about your project that will be shown to contributors.
                </p>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={projectInfo.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={projectInfo.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Brief description of your project"
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={projectInfo.website}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://your-project-website.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    name="githubUrl"
                    value={projectInfo.githubUrl}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Back
                  </button>
                  
                  <button
                    type="button"
                    onClick={registerProject}
                    disabled={loading || !projectInfo.name}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${
                      (loading || !projectInfo.name) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registering...
                      </>
                    ) : (
                      'Register Project'
                    )}
                  </button>
                </div>
              </form>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectOnboarding;