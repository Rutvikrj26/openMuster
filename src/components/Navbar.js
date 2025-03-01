import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ account, onDisconnect, username, verified }) => {
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and App name */}
          <Link to="/" className="flex items-center">
            <svg 
              className="h-8 w-8 text-white mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" 
              />
            </svg>
            <span className="text-white font-bold text-xl">GitHub Profile Score</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {account && (
              <>
                {verified && username ? (
                  <Link 
                    to={`/results/${username}`} 
                    className="text-white hover:text-blue-100"
                  >
                    My Profile
                  </Link>
                ) : (
                  <Link 
                    to="/connect-github" 
                    className="text-white hover:text-blue-100"
                  >
                    Connect GitHub
                  </Link>
                )}
                <Link 
                  to="/analyze" 
                  className="text-white hover:text-blue-100"
                >
                  Analyze Profile
                </Link>
              </>
            )}
          </div>
          
          {/* Wallet connection info */}
          <div className="flex items-center">
            {account ? (
              <div className="flex items-center">
                {/* GitHub username if verified */}
                {verified && username && (
                  <Link 
                    to={`/results/${username}`} 
                    className="mr-4 flex items-center"
                  >
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">Verified</span>
                    <span className="text-white font-medium hover:text-blue-100 transition-colors">
                      @{username}
                    </span>
                  </Link>
                )}
                
                {/* Wallet Address */}
                <span className="text-white mr-3">
                  <svg 
                    className="h-4 w-4 text-green-300 inline mr-1" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  {formatAddress(account)}
                </span>
                
                {/* Disconnect Button */}
                <button 
                  onClick={onDisconnect}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-1 px-3 rounded-md text-sm transition duration-300"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <span className="text-white opacity-75">Not Connected</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;