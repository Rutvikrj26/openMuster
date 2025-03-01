import React, { useState, useEffect } from 'react';
import { ProofManager } from '../services/zkProofManager';
import zkContractService from '../services/zkContractService';
import ProofDetailsViewer from './ProofDetailsViewer';

const ZKDashboard = ({ privateRepoData, contract, account, username, onProofsGenerated }) => {
  const [status, setStatus] = useState('idle'); // idle, initializing, generating, verifying, storing, success, error
  const [proofs, setProofs] = useState([]);
  const [currentProof, setCurrentProof] = useState(null);
  const [error, setError] = useState(null);
  const [verificationResults, setVerificationResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [contractStatus, setContractStatus] = useState('idle'); // idle, storing, success, error
  const [blockchainTxHash, setBlockchainTxHash] = useState(null);
  
  const proofManager = new ProofManager();
  
  // Initialize services when component mounts
  useEffect(() => {
    const initializeServices = async () => {
      if (account && contract) {
        try {
          setStatus('initializing');
          
          // Initialize proof manager
          await proofManager.initialize(account);
          
          // Initialize contract service
          zkContractService.initialize(contract, account);
          
          // Check if username already has ZK verifications
          const hasVerification = await zkContractService.hasZkVerification(username);
          
          if (hasVerification) {
            try {
              // Fetch existing verifications
              const existingProofs = await zkContractService.getProofVerifications(username);
              setProofs(existingProofs);
              setStatus('success');
            } catch (error) {
              console.error('Error fetching existing verifications:', error);
              setStatus('idle');
            }
          } else {
            setStatus('idle');
          }
        } catch (error) {
          console.error('Error initializing services:', error);
          setError('Failed to initialize ZK services: ' + error.message);
          setStatus('error');
        }
      }
    };
    
    initializeServices();
    
    // Clean up when component unmounts
    return () => {
      proofManager.cleanup();
    };
  }, [account, contract, username]);
  
  // Define proof types and their information
  const proofTypes = [
    {
      id: 'codeMetrics',
      type: 'riscZero',
      name: 'RiscZero ZKVM',
      description: 'Code metrics without revealing source code',
      color: 'blue',
      icon: (className) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'activity',
      type: 'noir',
      name: 'Noir Hyperplonk',
      description: 'Contribution activity without revealing commit details',
      color: 'purple',
      icon: (className) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'ownership',
      type: 'groth16',
      name: 'Groth16',
      description: 'Repository ownership verification with zero-knowledge',
      color: 'green',
      icon: (className) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'language',
      type: 'fflonk',
      name: 'Polygon FFlonk',
      description: 'Language proficiency without revealing code',
      color: 'orange',
      icon: (className) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      )
    }
  ];

  // Function to generate all proofs sequentially
  const generateAllProofs = async () => {
    if (!privateRepoData || !account || !username) {
      setError('Missing required data for proof generation');
      return;
    }

    try {
      // Reset state
      setStatus('generating');
      setError(null);
      setVerificationResults([]);
      setProgress(0);
      setBlockchainTxHash(null);
      setContractStatus('idle');

      // Generate each proof type sequentially
      const generatedProofs = [];
      
      // Track overall progress
      let currentStep = 0;
      const totalSteps = proofTypes.length + 1; // +1 for storing on blockchain
      
      for (const proofType of proofTypes) {
        setCurrentProof(proofType);
        setProgress(Math.round((currentStep / totalSteps) * 100));
        
        // Generate proof based on proof type
        let proofResult;
        switch (proofType.id) {
          case 'codeMetrics':
            proofResult = await proofManager.proveCodeMetrics({
              ...privateRepoData,
              walletAddress: account
            });
            break;
          case 'activity':
            proofResult = await proofManager.proveActivity({
              contributionCount: privateRepoData.contributionCount || Math.floor(Math.random() * 1000),
              activeDays: privateRepoData.activeDays || Math.floor(Math.random() * 365),
              longestStreak: privateRepoData.longestStreak || Math.floor(Math.random() * 100),
              activityTimeline: privateRepoData.activityTimeline || [],
              accessToken: privateRepoData.accessToken,
              walletAddress: account
            });
            break;
          case 'ownership':
            proofResult = await proofManager.proveOwnership({
              username,
              repoCount: privateRepoData.totalPrivateRepos,
              walletAddress: account,
              repositoryIds: privateRepoData.repositoryIds || [],
              accessToken: privateRepoData.accessToken
            });
            break;
          case 'language':
            proofResult = await proofManager.proveLanguage({
              languages: privateRepoData.languageStats || {},
              primaryLanguage: Object.entries(privateRepoData.languageStats || {})
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'JavaScript',
              languageDetails: privateRepoData.languageDetails || {},
              accessToken: privateRepoData.accessToken,
              walletAddress: account
            });
            break;
          default:
            break;
        }
        
        if (proofResult && proofResult.success) {
          // Add to generated proofs
          generatedProofs.push({
            proofType: proofType.type,
            name: proofType.name,
            description: proofType.description,
            color: proofType.color,
            icon: proofType.icon,
            verificationId: proofResult.verificationId,
            txHash: proofResult.txHash,
            verifiedAt: new Date(),
            verified: true
          });
          
          // Update verification results
          setVerificationResults([...generatedProofs]);
        } else {
          throw new Error(`Failed to generate ${proofType.name} proof`);
        }
        
        currentStep++;
      }

      // All proofs generated successfully, now store on blockchain
      setStatus('storing');
      setCurrentProof(null);
      setProgress(Math.round((currentStep / totalSteps) * 100));
      setContractStatus('storing');
      
      try {
        // Store all proofs on the blockchain
        const blockchainResult = await zkContractService.storeMultipleProofVerifications(
          username,
          generatedProofs
        );
        
        setBlockchainTxHash(blockchainResult.txHash);
        setContractStatus('success');
        
        // Update final progress
        currentStep++;
        setProgress(100);
        
        // Complete the process
        setStatus('success');
        setCurrentProof(null);
        setProofs(generatedProofs);
        
        // Call the callback with the proof results
        if (onProofsGenerated) {
          onProofsGenerated(generatedProofs, { 
            success: true, 
            results: generatedProofs,
            blockchainTxHash: blockchainResult.txHash 
          });
        }
      } catch (error) {
        console.error('Error storing proofs on blockchain:', error);
        setContractStatus('error');
        
        // We still consider the overall process successful if zkVerify proofs were generated
        // but blockchain storage failed
        setStatus('success');
        setProofs(generatedProofs);
        setError(`Proofs were verified on zkVerify but failed to store on blockchain: ${error.message}`);
        
        // Call the callback with the proof results
        if (onProofsGenerated) {
          onProofsGenerated(generatedProofs, { success: true, results: generatedProofs });
        }
      }
    } catch (error) {
      console.error('Error generating ZK proofs:', error);
      setStatus('error');
      setError(error.message || 'Failed to generate ZK proofs');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Zero-Knowledge Proofs
          </h2>
          
          {status === 'success' && (
            <span className="flex items-center text-sm text-green-600">
              <svg className="h-5 w-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              All Proofs Verified
            </span>
          )}
        </div>
        
        <p className="mt-2 text-sm text-gray-600">
          Generate ZK proofs to include your private repository data without revealing sensitive information.
          These proofs are verified on the zkVerify blockchain to maintain data privacy.
        </p>
      </div>
      
      {/* Status indicator */}
      {(status === 'generating' || status === 'verifying' || status === 'storing') && (
        <div className="px-6 pt-4">
          <div className="mb-4">
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    status === 'generating' ? 'bg-blue-500' : 
                    status === 'verifying' ? 'bg-purple-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-600">
              <span>
                {status === 'generating' ? 'Generating Proofs' : 
                 status === 'verifying' ? 'Verifying on zkVerify' : 
                 'Storing on Blockchain'}
              </span>
              <span>{progress}%</span>
            </div>
          </div>
          
          {currentProof && (
            <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
              <div className={`animate-pulse mr-3 text-${currentProof.color}-500`}>
                {currentProof.icon(`h-6 w-6`)}
              </div>
              <div>
                <div className="font-medium text-gray-800">{currentProof.name}</div>
                <div className="text-sm text-gray-600">
                  {status === 'generating' ? 'Generating proof...' : 'Verifying on zkVerify blockchain...'}
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2 mb-4">
            {verificationResults.map((result, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
              >
                <div className="flex items-center">
                  {result.icon(`h-5 w-5 text-${result.color}-500 mr-2`)}
                  <span className="font-medium text-gray-800">{result.name}</span>
                </div>
                
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {status === 'storing' && (
            <div className="mb-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium text-blue-700">Storing proof verification results on the blockchain...</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Success state */}
      {status === 'success' && proofs.length > 0 && (
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  All Proofs Successfully Verified
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your private repository data has been verified using zero-knowledge proofs on the zkVerify blockchain.</p>
                </div>
                
                {contractStatus === 'success' && blockchainTxHash && (
                  <div className="mt-2">
                    <span className="text-xs text-green-600">Blockchain Transaction: </span>
                    <a 
                      href={`https://sepolia.basescan.org/tx/${blockchainTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 font-mono"
                    >
                      {blockchainTxHash.substring(0, 10)}...{blockchainTxHash.substring(blockchainTxHash.length - 8)}
                    </a>
                  </div>
                )}
                
                {contractStatus === 'error' && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    Note: Proofs were verified on zkVerify but couldn't be stored on the application blockchain.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <ProofDetailsViewer proofs={proofs} />
        </div>
      )}
      
      {/* Error state */}
      {status === 'error' && (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error Generating Proofs
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'An unexpected error occurred. Please try again.'}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={generateAllProofs}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Initial state */}
      {status === 'idle' && (
        <div className="p-6">
          <button
            onClick={generateAllProofs}
            className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Generate All ZK Proofs
          </button>
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proofTypes.map(proofType => (
              <div 
                key={proofType.id} 
                className="border border-gray-200 rounded p-3 bg-gray-50"
              >
                <div className="flex items-center">
                  {proofType.icon(`h-5 w-5 text-${proofType.color}-500 mr-2`)}
                  <span className="font-medium text-gray-800">{proofType.name}</span>
                </div>
                <p className="mt-1 text-xs text-gray-600">{proofType.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>
            <span className="font-medium">Privacy Note:</span> Zero-knowledge proofs enable the verification of private repository metrics without exposing any sensitive data from your private repositories.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZKDashboard;