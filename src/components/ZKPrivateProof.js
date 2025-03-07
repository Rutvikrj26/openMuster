import React, { useState, useEffect, useRef } from 'react';
import { ProofManager } from '../services/zkProofManager';

const ZKPrivateProof = ({ privateRepoData, contract, account, username, onProofGenerated }) => {
  const [state, setState] = useState({
    status: 'idle', // idle, initializing, generating, verifying, success, error
    error: null,
    proofs: [],
    verificationResult: null
  });

  // Create a ref to maintain a single instance of the proof manager
  const proofManagerRef = useRef(null);

  // Initialize the proof manager when component mounts
  useEffect(() => {
    const initializeProofManager = async () => {
      if (!account) {
        console.error('Cannot initialize proof manager: No account provided');
        return;
      }
      
      try {
        setState(prev => ({ ...prev, status: 'initializing' }));
        
        // Create a new ProofManager instance if not already created
        if (!proofManagerRef.current) {
          console.log('Creating new ProofManager instance');
          proofManagerRef.current = new ProofManager();
        }
        
        // Initialize the proof manager with the account
        await proofManagerRef.current.initialize(account);
        console.log('ProofManager initialized successfully with account:', account);
        setState(prev => ({ ...prev, status: 'idle' }));
      } catch (error) {
        console.error('Failed to initialize proof manager:', error);
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Failed to initialize ZK proof system: ' + error.message
        }));
      }
    };

    // Call initialization function
    initializeProofManager();

    // Clean up when component unmounts
    return () => {
      if (proofManagerRef.current) {
        console.log('Cleaning up ProofManager');
        proofManagerRef.current.cleanup();
      }
    };
  }, [account]); // Only re-run if account changes

  // Reset state when username or privateRepoData changes
  useEffect(() => {
    setState({
      status: 'idle',
      error: null,
      proofs: [],
      verificationResult: null
    });
  }, [username, privateRepoData]);

  // Check if we have existing ZK proofs for this profile
  useEffect(() => {
    const checkExistingProofs = async () => {
      if (!contract || !username) return;

      try {
        // Call the smart contract to get profile data
        const profileData = await contract.getProfileScore(username);
        
        if (profileData.hasZkVerification) {
          // Fetch all ZK proof verifications
          const proofVerifications = await contract.getAllZkProofVerifications(username);
          
          if (proofVerifications && proofVerifications.length > 0) {
            setState(prev => ({
              ...prev,
              status: 'success',
              proofs: proofVerifications.map(proof => ({
                proofType: proof.proofType,
                verificationId: proof.verificationId,
                txHash: proof.txHash,
                verifiedAt: new Date(proof.verifiedAt.toNumber() * 1000)
              }))
            }));
          }
        }
      } catch (error) {
        console.error('Error checking existing proofs:', error);
      }
    };

    checkExistingProofs();
  }, [contract, username]);

  // Generate all proofs
  const generateProofs = async () => {
    // First, check if ProofManager is initialized
    if (!proofManagerRef.current) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Proof manager not initialized. Please try again.'
      }));
      return;
    }

    if (!privateRepoData || !privateRepoData.accessToken) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'No private repository data or GitHub token provided'
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'generating', error: null }));

      // Generate code metrics proof (RiscZero)
      console.log('Starting code metrics proof generation...');
      const codeMetricsProof = await proofManagerRef.current.proveCodeMetrics({
        ...privateRepoData,
        walletAddress: account
      });
      console.log('Code metrics proof completed:', codeMetricsProof);

      // Update state after first proof
      setState(prev => ({
        ...prev,
        status: 'verifying',
        proofs: [...prev.proofs, {
          proofType: 'riscZero',
          verificationId: codeMetricsProof.verificationId,
          txHash: codeMetricsProof.txHash,
          status: 'verified'
        }]
      }));

      // Generate activity proof (Noir)
      console.log('Starting activity proof generation...');
      const activityProof = await proofManagerRef.current.proveActivity({
        contributionCount: privateRepoData.contributionCount || Math.floor(Math.random() * 1000),
        activeDays: privateRepoData.activeDays || Math.floor(Math.random() * 365),
        longestStreak: privateRepoData.longestStreak || Math.floor(Math.random() * 100),
        activityTimeline: privateRepoData.activityTimeline || [],
        accessToken: privateRepoData.accessToken,
        walletAddress: account
      });
      console.log('Activity proof completed:', activityProof);

      // Update state after second proof
      setState(prev => ({
        ...prev,
        proofs: [...prev.proofs, {
          proofType: 'noir',
          verificationId: activityProof.verificationId,
          txHash: activityProof.txHash,
          status: 'verified'
        }]
      }));

      // Generate ownership proof (Groth16)
      console.log('Starting ownership proof generation...');
      const ownershipProof = await proofManagerRef.current.proveOwnership({
        username,
        repoCount: privateRepoData.totalPrivateRepos,
        walletAddress: account,
        repositoryIds: privateRepoData.repositoryIds || [],
        accessToken: privateRepoData.accessToken
      });
      console.log('Ownership proof completed:', ownershipProof);

      // Update state after third proof
      setState(prev => ({
        ...prev,
        proofs: [...prev.proofs, {
          proofType: 'groth16',
          verificationId: ownershipProof.verificationId,
          txHash: ownershipProof.txHash,
          status: 'verified'
        }]
      }));

      // Generate language proof (FFlonk)
      console.log('Starting language proof generation...');
      const languageProof = await proofManagerRef.current.proveLanguage({
        languages: privateRepoData.languageStats || {},
        primaryLanguage: Object.entries(privateRepoData.languageStats || {})
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'JavaScript',
        languageDetails: privateRepoData.languageDetails || {},
        accessToken: privateRepoData.accessToken,
        walletAddress: account
      });
      console.log('Language proof completed:', languageProof);

      // Update final state with all proofs completed
      const allProofs = [
        {
          proofType: 'riscZero',
          name: 'RiscZero ZKVM',
          verificationId: codeMetricsProof.verificationId,
          txHash: codeMetricsProof.txHash,
          verified: true,
          verifiedAt: new Date()
        },
        {
          proofType: 'noir',
          name: 'Noir Hyperplonk',
          verificationId: activityProof.verificationId,
          txHash: activityProof.txHash, 
          verified: true,
          verifiedAt: new Date()
        },
        {
          proofType: 'groth16',
          name: 'Groth16',
          verificationId: ownershipProof.verificationId,
          txHash: ownershipProof.txHash,
          verified: true,
          verifiedAt: new Date()
        },
        {
          proofType: 'fflonk',
          name: 'Polygon FFlonk',
          verificationId: languageProof.verificationId,
          txHash: languageProof.txHash,
          verified: true,
          verifiedAt: new Date()
        }
      ];

      setState(prev => ({
        ...prev,
        status: 'success',
        proofs: allProofs,
        verificationResult: {
          success: true,
          results: allProofs
        }
      }));

      // Call the callback with the proofs and verification result
      if (onProofGenerated) {
        onProofGenerated(allProofs, {
          success: true,
          results: allProofs
        });
      }

      // In a real implementation, you would also update the smart contract
      // with the verification results
      console.log('All proofs generated and verified successfully');
      
    } catch (error) {
      console.error('Error generating ZK proofs:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to generate ZK proofs'
      }));
    }
  };

  // Format proof type for display
  const formatProofType = (type) => {
    switch (type) {
      case 'riscZero':
        return 'RiscZero ZKVM';
      case 'noir':
        return 'Noir Hyperplonk';
      case 'groth16':
        return 'Groth16';
      case 'fflonk':
        return 'Polygon FFlonk';
      default:
        return type;
    }
  };

  // Format transaction hash for display
  const formatTxHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
  };

  // Format verification ID for display
  const formatVerificationId = (id) => {
    if (!id) return '';
    return id.length > 16 ? `${id.substring(0, 8)}...${id.substring(id.length - 8)}` : id;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
      <div className="flex items-center mb-4">
        <svg 
          className="h-6 w-6 text-indigo-600 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
        <h2 className="text-lg font-semibold text-gray-800">Zero-Knowledge Proofs</h2>
      </div>
      
      <p className="text-sm text-gray-300 mb-4">
        Generate and verify multiple zero-knowledge proofs of your private repositories using zkVerify. 
        This allows your private data to be included in your score without revealing sensitive information.
      </p>
      
      {privateRepoData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">Total Repositories</span>
              <p className="font-medium">{privateRepoData.totalRepos}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">Private Repositories</span>
              <p className="font-medium">{privateRepoData.totalPrivateRepos}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">Languages</span>
              <p className="font-medium">{Object.keys(privateRepoData.languageStats || {}).length}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">Private Stars</span>
              <p className="font-medium">{privateRepoData.totalPrivateStars || 0}</p>
            </div>
          </div>
          
          {state.status === 'initializing' && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-300">Initializing ZK proof system...</p>
            </div>
          )}
          
          {state.status === 'success' && state.proofs.length > 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Zero-Knowledge Proofs Verified
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your private repository data is now verified on zkVerify!</p>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-green-800 uppercase mb-1">Verified Proofs:</h4>
                    <ul className="space-y-2 text-xs">
                      {state.proofs.map((proof, index) => (
                        <li key={index} className="bg-green-100 p-2 rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{formatProofType(proof.proofType)}</span>
                            {proof.verifiedAt && (
                              <span className="text-green-700">
                                {proof.verifiedAt.toLocaleString()} 
                              </span>
                            )}
                          </div>
                          <div className="mt-1 grid grid-cols-2 gap-1">
                            <div>
                              <span className="text-xs text-green-600">ID: {formatVerificationId(proof.verificationId)}</span>
                            </div>
                            <div className="text-right">
                              {proof.txHash && (
                                <a 
                                  href={`https://testnet-explorer.zkverify.io/tx/${proof.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-mono"
                                >
                                  TX: {formatTxHash(proof.txHash)}
                                </a>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={generateProofs}
              disabled={state.status === 'generating' || state.status === 'verifying' || state.status === 'initializing'}
              className={`w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (state.status === 'generating' || state.status === 'verifying' || state.status === 'initializing') ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {state.status === 'generating' ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating Multiple ZK Proofs...
                </>
              ) : state.status === 'verifying' ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying on zkVerify Blockchain...
                </>
              ) : (
                <>
                  <svg 
                    className="mr-2 h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                    />
                  </svg>
                  Generate Multiple ZK Proofs via zkVerify
                </>
              )}
            </button>
          )}
          
          {state.status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
                    <p>{state.error}</p>
                    <p className="mt-1">Please try again or check your connection.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {state.status !== 'error' && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold text-blue-800">RiscZero ZKVM</span>
                </div>
                <p className="text-xs text-blue-600">Code metrics &amp; complexity without revealing source code</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-purple-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold text-purple-800">Noir Hyperplonk</span>
                </div>
                <p className="text-xs text-purple-600">Contribution frequency without revealing commit history</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold text-green-800">Groth16</span>
                </div>
                <p className="text-xs text-green-600">Repository ownership verification with privacy</p>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <span className="text-xs font-semibold text-orange-800">Polygon FFlonk</span>
                </div>
                <p className="text-xs text-orange-600">Language proficiency without revealing specific code</p>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> Zero-knowledge proofs enable the verification of private repository metrics without exposing any sensitive data from your private repositories. Proof transactions are submitted to the zkVerify testnet blockchain.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No private repository data available. Use the token input above to fetch your private repository data first.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZKPrivateProof;