import React from 'react';

const ProfileHeader = ({ 
  username, 
  profileData, 
  isOwnVerifiedProfile, 
  recalculating,
  handleRecalculate,
  setShowTokenInput,
  showTokenInput
}) => {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center">
          <img 
            src={`https://github.com/${username}.png?size=100`}
            alt={`${username} GitHub avatar`} 
            className="h-16 w-16 rounded-full border-2 border-gray-200"
          />
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">{username}</h1>
            <a 
              href={`https://github.com/${username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              github.com/{username}
            </a>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-center">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900">{profileData.overallScore}</div>
            <div className="ml-2 text-sm font-medium text-gray-500">/100</div>
          </div>
          <div className="text-sm text-gray-500 mt-1">GITHUB PROFILE SCORE</div>
        </div>
      </div>
      
      {isOwnVerifiedProfile && (
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => handleRecalculate(false)}
            disabled={recalculating}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {recalculating ? 'Updating...' : 'Update Score'} 
          </button>
          
          <button
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showTokenInput ? 'Hide Token Input' : 'Include Private Repos'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;