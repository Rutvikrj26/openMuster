import React, { useState, useEffect } from 'react';
import zkProvider from '../services/zkProvider';
import { ProofManager } from '../services/zkProofManager.ts';

  const ZKPrivateProof = ({ privateRepoData, contract, account, username, onProofGenerated }) => {
    const [state, setState] = useState({
      status: 'idle', // idle, generating, verifying, success, error
      error: null,
      proofs: [],
      verificationResult: null
    });

  const proofManager = new ProofManager();

  useEffect(() => {
    // Reset state when username or privateRepoData changes
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
          
          if (proofVerifications.length > 0) {
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
      const codeMetricsProof = await zkProvider.generateCodeMetricsProof({
        totalRepos: privateRepoData.totalRepos,
        totalPrivateRepos: privateRepoData.totalPrivateRepos,
        repoDetails: privateRepoData.repoDetails,
        accessToken: privateRepoData.accessToken
      });

      // Generate activity proof (Noir)
      const activityProof = await zkProvider.generateActivityProof({
        contributionCount: privateRepoData.contributionCount || 0,
        activeDays: privateRepoData.activeDays || 0,
        longestStreak: privateRepoData.longestStreak || 0,
        activityTimeline: privateRepoData.activityTimeline || [],
        accessToken: privateRepoData.accessToken
      });

      // Generate ownership proof (Groth16)
      const ownershipProof = await zkProvider.generateOwnershipProof({
        username,
        repoCount: privateRepoData.totalPrivateRepos,
        walletAddress: account,
        repositoryIds: privateRepoData.repositoryIds || [],
        accessToken: privateRepoData.accessToken
      });

      // Generate language proof (FFlonk)
      const languageProof = await zkProvider.generateLanguageProof({
        languages: privateRepoData.languageStats || {},
        primaryLanguage: Object.entries(privateRepoData.languageStats || {})
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown',
        languageDetails: privateRepoData.languageDetails || {},
        accessToken: privateRepoData.accessToken
      });

      // Collect all proofs
      const proofs = [codeMetricsProof, activityProof, ownershipProof, languageProof];

      setState(prev => ({
        ...prev,
        proofs,
        status: 'verifying'
      }));

      // Verify proofs through zkVerify blockchain using our ProofManager
      console.log('Initializing zkVerify session...');
      let verificationResults = [];

      // Handle each proof individually through our ProofManager
      try {
        // Verify code metrics proof (RISC0)
        console.log('Verifying code metrics proof...');
        const metricsResult = await proofManager.proveCodeMetrics({
          ...privateRepoData,
          // Pass the already generated proof
          generatedProof: codeMetricsProof
        });
        verificationResults.push(metricsResult);
        
        // Verify activity proof (Noir)
        console.log('Verifying activity proof...');
        const activityResult = await proofManager.proveActivity({
          ...privateRepoData,
          generatedProof: activityProof
        });
        verificationResults.push(activityResult);
        
        // Verify ownership proof (Groth16)
        console.log('Verifying ownership proof...');
        const ownershipResult = await proofManager.proveOwnership({
          ...privateRepoData,
          username,
          walletAddress: account,
          generatedProof: ownershipProof
        });
        verificationResults.push(ownershipResult);
        
        // Verify language proof (FFlonk)
        console.log('Verifying language proof...');
        const languageResult = await proofManager.proveLanguage({
          ...privateRepoData,
          generatedProof: languageProof
        });
        verificationResults.push(languageResult);
        
        // Combine verification results
        const verificationResult = {
          success: verificationResults.every(r => r.success),
          results: verificationResults,
          txHash: verificationResults[0]?.verified?.events?.includedInBlock?.transactionHash
        };
      setState(prev => ({
        ...prev,
        status: 'success',
        verificationResult
      }));

      // Call the callback with the proofs and verification result
      if (onProofGenerated) {
        onProofGenerated(proofs, verificationResult);
      }

    } catch (error) {
      console.error('Error generating ZK proofs:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to generate and verify ZK proofs'
      }));
    }
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
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
      
      <p className="text-sm text-gray-600 mb-4">
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
          
          {state.status === 'success' && (state.verificationResult || state.proofs.length > 0) ? (
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
                                {new Date(proof.verifiedAt).toLocaleDateString()} 
                              </span>
                            )}
                          </div>
                          {proof.txHash && (
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-green-600 font-mono truncate w-40">
                                {proof.txHash.substring(0, 10)}...
                              </span>
                              <button
                                onClick={() => navigator.clipboard.writeText(proof.txHash)}
                                className="text-green-700 hover:text-green-800"
                              >
                                Copy
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {state.verificationResult?.txHash && (
                    <div className="mt-3 flex justify-between items-center text-xs">
                      <span className="text-green-800">Verification Transaction:</span>
                      <a 
                        href={`https://explorer.zkverify.io/tx/${state.verificationResult.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View on zkVerify Explorer
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={generateProofs}
              disabled={state.status === 'generating' || state.status === 'verifying'}
              className={`w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (state.status === 'generating' || state.status === 'verifying') ? 'opacity-75 cursor-not-allowed' : ''
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
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">
              <strong>How it works:</strong> Multiple zero-knowledge proof systems from zkVerify allow you to prove various aspects of your private repositories without revealing sensitive information. Only aggregate statistics and verified proofs are included in your on-chain score.
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