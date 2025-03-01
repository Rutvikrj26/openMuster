import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const VerificationFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error') || 'unknown';
  
  // Get a user-friendly error message based on the error code
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'github':
        return 'We couldn\'t connect to your GitHub account. This may be due to GitHub API issues or you may have denied the authorization request.';
      case 'blockchain':
        return 'We were able to verify your GitHub account, but there was an issue saving this verification to the blockchain.';
      case 'timeout':
        return 'The verification process took too long and timed out. Please try again.';
      default:
        return 'An unexpected error occurred during the verification process.';
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
          <svg 
            className="h-10 w-10 text-red-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h1 className="mt-4 text-2xl font-bold text-gray-800">Verification Failed</h1>
        
        <div className="mt-2 p-4 bg-red-50 border border-red-100 rounded-md">
          <p className="text-red-700">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate('/connect-github')}
            className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
          
          <Link
            to="/analyze"
            className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Skip Verification (Public Data Only)
          </Link>
        </div>
        
        <p className="mt-4 text-sm text-gray-500">
          If the problem persists, please check your wallet connection and GitHub permissions,
          or continue without verification to analyze only your public GitHub data.
        </p>
      </div>
    </div>
  );
};

export default VerificationFailed;