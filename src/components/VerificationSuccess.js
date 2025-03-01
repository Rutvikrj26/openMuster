import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerificationSuccess = ({ onVerificationComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const username = searchParams.get('username');
  
  useEffect(() => {
    // Call the completion callback if provided
    if (onVerificationComplete && username) {
      onVerificationComplete(username);
      
      // Navigate to the username's profile page after a short delay
      const timer = setTimeout(() => {
        navigate(`/results/${username}`);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [onVerificationComplete, username, navigate]);

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
          <svg 
            className="h-10 w-10 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        
        <h1 className="mt-4 text-2xl font-bold text-gray-800">GitHub Verification Successful!</h1>
        
        <p className="mt-2 text-gray-600">
          Your wallet has been successfully connected to GitHub username <strong>{username}</strong>.
        </p>
        
        <div className="mt-6 flex justify-center">
          <div className="animate-pulse inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600">
            Redirecting to your profile...
          </div>
        </div>
        
        <p className="mt-4 text-sm text-gray-500">
          Your wallet address is now securely linked to your GitHub account on the blockchain.
          This association will be used to include private repository data in your profile score.
        </p>
      </div>
    </div>
  );
};

export default VerificationSuccess;