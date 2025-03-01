import React from 'react';
import { Link } from 'react-router-dom';

const ProfileActions = ({ isVerified, username }) => {
  return (
    <div className="mt-6 flex flex-wrap gap-4 justify-center">
      <Link 
        to="/analyze" 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Analyze Another Profile
      </Link>
      
      {!isVerified && (
        <Link 
          to="/verify" 
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Verify Your GitHub Account
        </Link>
      )}
      
      <a 
        href={`https://github.com/${username}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        View GitHub Profile
      </a>
    </div>
  );
};

export default ProfileActions;