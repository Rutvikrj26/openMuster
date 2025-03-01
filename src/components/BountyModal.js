import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BountyModal = ({ isOpen, onClose, onSubmit, issue, isSubmitting, projectId }) => {
  const [amount, setAmount] = useState('0.05');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)); // Default: 2 weeks from now
  const [difficultyLevel, setDifficultyLevel] = useState('medium'); // Default difficulty level
  const [amountError, setAmountError] = useState('');
  const [deadlineError, setDeadlineError] = useState('');

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSubmitting, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    
    // Validate amount
    if (!value || parseFloat(value) <= 0) {
      setAmountError('Amount must be greater than 0');
    } else if (parseFloat(value) > 10) {
      setAmountError('Amount cannot exceed 10 ETH');
    } else {
      setAmountError('');
    }
  };

  const handleDeadlineChange = (date) => {
    setDeadline(date);
    
    // Validate deadline
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1); // At least 1 day in the future
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90); // Max 90 days in the future
    
    if (date < minDate) {
      setDeadlineError('Deadline must be at least 1 day in the future');
    } else if (date > maxDate) {
      setDeadlineError('Deadline cannot exceed 90 days from now');
    } else {
      setDeadlineError('');
    }
  };

  const handleDifficultyChange = (level) => {
    setDifficultyLevel(level);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (amountError || deadlineError) {
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError('Amount must be greater than 0');
      return;
    }
    
    if (!deadline) {
      setDeadlineError('Please select a deadline');
      return;
    }
    
    // Convert amount to wei
    const amountInWei = ethers.utils.parseEther(amount);
    
    onSubmit({ 
      amount: amountInWei.toString(), 
      deadline,
      difficultyLevel, // Include difficulty level
      issueNumber: issue.number 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={!isSubmitting ? onClose : undefined}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Create Bounty for Issue #{issue.number}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    You're creating a bounty for the issue: <strong>{issue.title}</strong>
                  </p>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bounty Amount (ETH)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          value={amount}
                          onChange={handleAmountChange}
                          className={`block w-full pr-12 sm:text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            amountError ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="0.05"
                          disabled={isSubmitting}
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">ETH</span>
                        </div>
                      </div>
                      {amountError && (
                        <p className="mt-1 text-sm text-red-600">{amountError}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        This is the amount that will be paid to the developer who completes the bounty.
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline
                      </label>
                      <DatePicker
                        selected={deadline}
                        onChange={handleDeadlineChange}
                        minDate={new Date()}
                        dateFormat="MMMM d, yyyy"
                        className={`block w-full border sm:text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          deadlineError ? 'border-red-300' : 'border-gray-300'
                        } p-2`}
                        disabled={isSubmitting}
                        required
                      />
                      {deadlineError && (
                        <p className="mt-1 text-sm text-red-600">{deadlineError}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Contributors must complete the task before this deadline to be eligible for payment.
                      </p>
                    </div>
                    
                    {/* Difficulty Level Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['easy', 'medium', 'hard', 'expert'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleDifficultyChange(level)}
                            disabled={isSubmitting}
                            className={`py-2 px-3 text-sm font-medium rounded-md focus:outline-none ${
                              difficultyLevel === level 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Select the difficulty level of this bounty to help contributors understand the complexity.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || amountError || deadlineError}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                (isSubmitting || amountError || deadlineError) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : 'Create Bounty'}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>

          {/* Important information box */}
          <div className="bg-blue-50 px-4 py-3 border-t border-blue-100">
            <h4 className="text-sm font-medium text-blue-800">Important Information:</h4>
            <ul className="mt-2 text-xs text-blue-700 list-disc pl-5 space-y-1">
              <li>The bounty amount will be locked in the smart contract until the task is completed.</li>
              <li>Contributors must meet the deadline to be eligible for payment.</li>
              <li>You'll have the opportunity to review submissions before approving payment.</li>
              <li>The difficulty level helps contributors understand the expected effort.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyModal;