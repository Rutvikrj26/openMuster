import React, { useState } from 'react';
import BountyCreationModal from './BountyCreationModal';

const IssueList = ({ issues, bounties, onCreateBounty, isProjectOwner }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Check if an issue already has a bounty
  const hasBounty = (issueNumber) => {
    return bounties.some(bounty => bounty.issueNumber === issueNumber);
  };
  
  // Filter issues
  const filteredIssues = issues.filter(issue => {
    if (filter === 'withBounty') return hasBounty(issue.number);
    if (filter === 'withoutBounty') return !hasBounty(issue.number);
    return true; // 'all'
  });
  
  const handleCreateBounty = (issue) => {
    setSelectedIssue(issue);
    setShowModal(true);
  };
  
  const submitBounty = (bountyAmount, difficultyLevel) => {
    onCreateBounty(selectedIssue.id, bountyAmount, difficultyLevel);
    setShowModal(false);
  };

  return (
    <div>
      {/* Filter Controls */}
      <div className="flex justify-between mb-4">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
            onClick={() => setFilter('all')}
          >
            All Issues
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'withBounty' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
            onClick={() => setFilter('withBounty')}
          >
            With Bounty
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              filter === 'withoutBounty' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
            onClick={() => setFilter('withoutBounty')}
          >
            Without Bounty
          </button>
        </div>
      </div>
    
      {/* Issues Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                            #{issue.number}: {issue.title}
                          </a>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {issue.labels.map(label => (
                            <span 
                              key={label.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
                              style={{
                                backgroundColor: `#${label.color}20`,
                                color: `#${label.color}`
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        issue.state === 'open' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {issue.state}
                    </span>
                    {hasBounty(issue.number) && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Bounty
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isProjectOwner && !hasBounty(issue.number) && (
                      <button
                        onClick={() => handleCreateBounty(issue)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Create Bounty
                      </button>
                    )}
                    {hasBounty(issue.number) && (
                      <span className="text-gray-400">Bounty Created</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No issues found matching the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Bounty Creation Modal */}
      {showModal && selectedIssue && (
        <BountyCreationModal
          issue={selectedIssue}
          onClose={() => setShowModal(false)}
          onSubmit={submitBounty}
        />
      )}
    </div>
  );
};

export default IssueList;