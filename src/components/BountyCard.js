import React from 'react';
import { Link } from 'react-router-dom';
import { FaCodeBranch, FaTag } from 'react-icons/fa';
import { formatTokenAmount, calculateEligibleAmount } from '../utils/ethersUtils';

const BountyCard = ({ bounty, profileScore, isApplied = false }) => {
  // Format difficulty level with proper capitalization
  const formatDifficulty = (level) => {
    if (!level) return '';
    return level.charAt(0).toUpperCase() + level.slice(1);
  };
  
  // Get eligible amount based on profile score
  const eligibleAmount = calculateEligibleAmount(profileScore, bounty.amount);
  
  // Format the bounty amount to display
  const displayAmount = formatTokenAmount(bounty.amount);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {bounty.title}
            </h3>
            <div className="text-sm text-gray-300 mb-3 flex items-center">
              <FaCodeBranch className="mr-1 text-gray-500" />
              {bounty.projectName}
              
              {bounty.difficultyLevel && (
                <>
                  <span className="mx-2">•</span>
                  <FaTag className="mr-1 text-gray-500" />
                  {formatDifficulty(bounty.difficultyLevel)}
                </>
              )}
            </div>
          </div>
          
          <div className="ml-4 flex flex-col items-end">
            <div className="text-2xl font-semibold text-blue-600">{displayAmount}</div>
          </div>
        </div>
        
        {profileScore !== null && (
          <div className="mt-4 bg-blue-50 rounded p-3 text-sm text-blue-800">
            {isApplied ? (
              <div className="font-medium">
                You've applied for this bounty
              </div>
            ) : (
              <>
                <span className="font-medium">You're eligible for: </span>
                {eligibleAmount.percentage} ({eligibleAmount.amount} tokens)
              </>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${bounty.status === 'OPEN' ? 'bg-green-100 text-green-800' : 
                  bounty.status === 'ASSIGNED' ? 'bg-yellow-100 text-yellow-800' : 
                  bounty.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }
              `}
            >
              {bounty.status}
            </span>
          </div>
          
          <Link
            to={`/bounties/${bounty.projectId}/${bounty.issueId}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BountyCard;