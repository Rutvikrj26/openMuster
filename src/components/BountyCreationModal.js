import React, { useState } from 'react';

const BountyCreationModal = ({ issue, onClose, onSubmit }) => {
  const [bountyAmount, setBountyAmount] = useState(50);
  const [difficultyLevel, setDifficultyLevel] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(bountyAmount, difficultyLevel);
  };
  
  // Generate suggested amount based on difficulty
  const suggestedAmounts = {
    easy: 30,
    medium: 50,
    hard: 80,
    expert: 120
  };
  
  const updateDifficulty = (level) => {
    setDifficultyLevel(level);
    setBountyAmount(suggestedAmounts[level]);
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Create Bounty for Issue #{issue.number}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-300 mb-4">
                      {issue.title}
                    </p>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['easy', 'medium', 'hard', 'expert'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            className={`py-2 px-3 text-sm font-medium rounded-md ${
                              difficultyLevel === level
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => updateDifficulty(level)}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bounty Amount (Tokens)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={bountyAmount}
                          onChange={(e) => setBountyAmount(Number(e.target.value))}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="50"
                          min="10"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">
                            tokens
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-blue-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Contributor Score Requirements</h4>
                      <p className="text-xs text-blue-600">
                        Bounty will be available to contributors based on their profile score:
                      </p>
                      <ul className="text-xs text-blue-600 mt-1 pl-5 list-disc">
                        <li>Score 0-20: 10 tokens</li>
                        <li>Score 20-40: 20 tokens</li>
                        <li>Score 40-60: 40 tokens</li>
                        <li>Score 60-80: 60 tokens</li>
                        <li>Score 80-100: {bountyAmount} tokens (full amount)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              >
                Create Bounty
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BountyCreationModal;