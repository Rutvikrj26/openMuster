import React from 'react';

const BlockchainInfo = ({ profileData, account }) => {
  // Helper function to format addresses
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
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
  );
};

export default BlockchainInfo;