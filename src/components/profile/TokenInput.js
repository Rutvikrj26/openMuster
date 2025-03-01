import React from 'react';
import { initiateGithubAuth } from '../../utils/githubauth';

const TokenInput = ({ 
  account,  // Add wallet address prop
  username,
  showZkProofSection, 
  setShowZkProofSection,
  handleRecalculate,
  recalculating,
  isVerifiedForUsername
}) => {
  // Function to start GitHub auth flow
  const startGithubAuth = () => {
    // Store current path to return here after auth
    const currentPath = `/results/${username}`;
    initiateGithubAuth(account, currentPath);
  };

  return (
    <div className="border-t border-gray-200 p-6 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Include Private Repository Data
      </h2>

      {!isVerifiedForUsername ? (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
          <p className="text-sm">
            <span className="font-medium">Verification required:</span> To include private repositories, 
            your wallet must be verified as the owner of this GitHub account. Please reconnect GitHub to verify.
          </p>
        </div>
      ) : (
        <p className="text-sm text-green-600 mb-4">
          ✓ Your wallet is verified for this GitHub account. You can include private repositories.
        </p>
      )}      

      <p className="text-sm text-gray-300 mb-4">
        Connect your GitHub account to include private repositories in your score calculation.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="use-zk"
              name="use-zk"
              type="checkbox"
              checked={showZkProofSection}
              onChange={(e) => setShowZkProofSection(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="use-zk" className="font-medium text-gray-700">
              Use zero-knowledge proofs to protect private repo data
            </label>
            <p className="text-gray-500">
              Generate ZK proofs to verify private data without exposing details.
            </p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={startGithubAuth}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reconnect GitHub
          </button>
          
          <button
            onClick={() => handleRecalculate(true)}
            disabled={recalculating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {recalculating ? 'Processing...' : 'Include Private Repos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenInput;