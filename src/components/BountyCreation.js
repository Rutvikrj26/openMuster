import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const BountyCreation = ({ 
  issue, 
  projectId, 
  projectOwnerAddress, 
  account, 
  web3Provider, 
  onBountyCreated 
}) => {
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [existingBounty, setExistingBounty] = useState(null);
  
  // Calculate minimum date for deadline (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];
  
  useEffect(() => {
    // Check if current user is the project owner
    setIsProjectOwner(account && projectOwnerAddress && 
      account.toLowerCase() === projectOwnerAddress.toLowerCase());
    
    // Check if this issue already has a bounty
    const checkExistingBounty = async () => {
      try {
        const OAUTH_SERVER_URL = process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:3001';
        const response = await axios.get(
          `${OAUTH_SERVER_URL}/api/bounties/issue/${issue.number}?projectId=${projectId}`,
          { withCredentials: true }
        );
        
        if (response.data && response.data.success && response.data.bounty) {
          setExistingBounty(response.data.bounty);
        }
      } catch (error) {
        console.log('No existing bounty found or error checking:', error);
      }
    };
    
    checkExistingBounty();
  }, [account, projectOwnerAddress, issue.number, projectId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid bounty amount');
      return;
    }
    
    if (!deadline) {
      toast.error('Please set a deadline for the bounty');
      return;
    }
    
    // Verify user is connected to wallet and is project owner
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!isProjectOwner) {
      toast.error('Only the project owner can create bounties');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Get contract info from backend
      const OAUTH_SERVER_URL = process.env.REACT_APP_OAUTH_SERVER_URL || 'http://localhost:3001';
      const contractInfoResponse = await axios.get(`${OAUTH_SERVER_URL}/api/contract/info`);
      const { bountyContractAddress, bountyContractABI } = contractInfoResponse.data;
      
      // 2. Connect to contract using user's wallet
      const signer = web3Provider.getSigner();
      const bountyContract = new ethers.Contract(
        bountyContractAddress,
        bountyContractABI,
        signer
      );
      
      const deadlineDate = new Date(deadline);
      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000); // Convert to seconds
      
      // 4. Create bounty transaction
      const tx = await bountyContract.createBounty(
        projectId,
        issue.number,  // GitHub issue number
        issue.title,   // Title
        issue.html_url, // Issue URL
        deadlineTimestamp,
        { value: amount }
      );
      
      // 5. Wait for transaction to be confirmed
      toast.info('Creating bounty... Please wait for confirmation');
      const receipt = await tx.wait();
      
      // 6. Extract bounty ID from event
      const bountyCreatedEvent = receipt.events?.find(e => e.event === 'BountyCreated');
      const bountyId = bountyCreatedEvent?.args?.bountyId.toString();
      
      toast.success('Bounty created successfully!');
      
      // 7. Reset form
      setAmount('');
      setDeadline('');
      
      // 8. Notify parent component
      if (onBountyCreated) {
        onBountyCreated({
          id: bountyId,
          amount: amount,
          deadline: deadlineTimestamp,
          issueNumber: issue.number,
          issueTitle: issue.title,
          issueUrl: issue.html_url,
          status: 'OPEN'
        });
      }
      
    } catch (error) {
      console.error('Error creating bounty:', error);
      toast.error(error.message || 'Failed to create bounty');
    } finally {
      setLoading(false);
    }
  };
  
  // If this issue already has a bounty, show its details instead
  if (existingBounty) {
    return (
      <div className="mt-2 mb-4 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-800">Bounty Added</h4>
            <p className="text-sm text-blue-600">
              {ethers.utils.formatEther(existingBounty.amount)} ETH
            </p>
            <p className="text-xs text-blue-500">
              Deadline: {new Date(existingBounty.deadline * 1000).toLocaleDateString()}
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
            {existingBounty.status}
          </div>
        </div>
      </div>
    );
  }
  
  // Only show the form if user is the project owner
  if (!isProjectOwner) {
    return null;
  }
  
  return (
    <div className="mt-2 mb-4 border border-gray-200 rounded-md p-4 bg-gray-50">
      <h4 className="text-sm font-medium mb-2">Add Bounty to this Issue</h4>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bounty-amount" className="block text-xs font-medium text-gray-700">
              Bounty Amount (ETH)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                step="0.01"
                min="0"
                id="bounty-amount"
                className="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">ETH</span>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="bounty-deadline" className="block text-xs font-medium text-gray-700">
              Deadline
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="bounty-deadline"
                min={minDateString}
                className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Bounty...
              </>
            ) : 'Create Bounty'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BountyCreation;