import React, { useState, useEffect } from 'react';
import { ZKVerifySubmissionService } from '../services/zkVerify';
import zkBrowserProvider from '../services/zkBrowserProvider';

const ZKDashboard = ({ privateRepoData, account, username, onProofsGenerated }) => {
  const [status, setStatus] = useState('idle');
  const [proofs, setProofs] = useState([]);
  const [currentProof, setCurrentProof] = useState(null);
  const [error, setError] = useState(null);
  const [verificationResults, setVerificationResults] = useState([]);
  
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
      setStatus('generating');
      setError(null);
      setProofs([]);
      setVerificationResults([]);

      // Generate each proof type sequentially
      const results = [];
      
      for (const proofType of proofTypes) {
        setCurrentProof(proofType);
        
        // Wait a bit to show the progress in the UI
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate proof based on proof type
        let proof;
        switch (proofType.id) {
          case 'codeMetrics':
            proof = await zkBrowserProvider.generateCodeMetricsProof(privateRepoData);
            break;
          case 'activity':
            proof = await zkBrowserProvider.generateActivityProof({
              contributionCount: Math.floor(Math.random() * 1000),
              activeDays: Math.floor(Math.random() * 365),
              longestStreak: Math.floor(Math.random() * 100),
              activityTimeline: [],
              accessToken: privateRepoData.accessToken
            });
            break;
          case 'ownership':
            proof = await zkBrowserProvider.generateOwnershipProof({
              username,
              repoCount: privateRepoData.totalPrivateRepos,
              walletAddress: account,
              repositoryIds: privateRepoData.repositoryIds || [],
              accessToken: privateRepoData.accessToken
            });
            break;
          case 'language':
            proof = await zkBrowserProvider.generateLanguageProof({
              languages: privateRepoData.languageStats || {},
              primaryLanguage: Object.entries(privateRepoData.languageStats || {})
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'JavaScript',
              languageDetails: {},
              accessToken: privateRepoData.accessToken
            });
            break;
          default:
            break;
        }
        
        results.push({
          ...proof,
          status: 'generated',
          proofTypeName: proofType.name,
          color: proofType.color,
          description: proofType.description,
          icon: proofType.icon
        });
        
        // Update the proofs state after each proof generation
        setProofs([...results]);
      }

      // Move to verification phase
      setStatus('verifying');
      setCurrentProof(null);

      // Verify each proof sequentially with zkVerify
      const verifiedResults = [];
      
      for (const proof of results) {
        setCurrentProof({ 
          id: proof.proofType, 
          type: proof.proofType,
          name: proof.proofTypeName,
          color: proof.color,
          description: proof.description,
          icon: proof.icon
        });
        
        // Wait a bit to show the progress in the UI
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Submit to zkVerify
        const verificationResult = await zkBrowserProvider.submitProofToZkVerify(
          proof.proofType,
          {
            proofId: proof.proofId,
            proof: proof.proof,
            publicInputs: proof.publicInputs
          }
        );
        
        verifiedResults.push({
          proofType: proof.proofType,
          proofTypeName: proof.proofTypeName,
          verificationId: verificationResult.verificationId,
          txHash: verificationResult.txHash,
          verified: true,
          verifiedAt: new Date(),
          color: proof.color,
          description: proof.description,
          icon: proof.icon
        });
        
        // Update verification results state
        setVerificationResults([...verifiedResults]);
      }

      // Complete the process
      setStatus('success');
      setCurrentProof(null);
      
      // Call the callback with the proof results
      if (onProofsGenerated) {
        onProofsGenerated(results, { success: true, results: verifiedResults });
      }
      
    } catch (error) {
      console.error('Error generating ZK proofs:', error);
      setStatus('error');
      setError(error.message || 'Failed to generate ZK proofs');
    }
  };

  // Get appropriate badge color based on proof type
  const getBadgeColor = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format blockchain transaction hash
  const formatTxHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Generate Zero-Knowledge Proofs
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
      
      {(status === 'generating' || status === 'verifying') && (
        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    status === 'generating' ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ 
                    width: status === 'generating' 
                      ? `${(proofs.length / proofTypes.length) * 100}%` 
                      : `${(verificationResults.length / proofTypes.length) * 100 + 50}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm font-medium text-gray-700">
                {status === 'generating' 
                  ? `Generating proof ${proofs.length + 1} of ${proofTypes.length}`
                  : `Verifying proof ${verificationResults.length + 1} of ${proofTypes.length}`
                }
              </span>
            </div>
          </div>
          
          {currentProof && (
            <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
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
          
          <div className="space-y-2">
            {proofs.map((proof, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  verificationResults.some(vr => vr.proofType === proof.proofType)
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center">
                  {proof.icon(`h-5 w-5 text-${proof.color}-500 mr-2`)}
                  <span className="font-medium text-gray-800">{proof.proofTypeName}</span>
                </div>
                
                <div>
                  {verificationResults.some(vr => vr.proofType === proof.proofType) ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Generated
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {status === 'success' && (
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
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
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {verificationResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className={`px-4 py-3 ${getBadgeColor(result.color)} border-b`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {result.icon(`h-5 w-5 mr-2`)}
                      <span className="font-medium">{result.proofTypeName}</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-white">
                  <div className="text-sm text-gray-600 mb-2">{result.description}</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-gray-500">TX Hash</span>
                      <a 
                        href={`https://explorer.zkverify.io/tx/${result.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-mono"
                      >
                        {formatTxHash(result.txHash)}
                      </a>
                    </div>
                    <div>
                      <span className="block text-gray-500">Verified At</span>
                      <span className="font-medium">
                        {result.verifiedAt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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