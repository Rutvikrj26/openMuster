import React, { useState } from 'react';

/**
 * This is a conceptual component showing how ZK proofs could be integrated
 * It doesn't actually implement real ZK proofs but demonstrates the UI and flow
 */
const ZKPrivateProof = ({ privateRepoData, onProofGenerated }) => {
  const [generating, setGenerating] = useState(false);
  const [proof, setProof] = useState(null);
  
  // Mock function to simulate generating a ZK proof
  const generateProof = async () => {
    if (!privateRepoData) return;
    
    try {
      setGenerating(true);
      
      // In a real implementation, this would call a ZK library or service
      // to generate an actual zero-knowledge proof
      
      // Mock delay to simulate proof generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock proof data structure
      const mockProof = {
        // These would be cryptographic values in a real implementation
        pi_a: [
          "0x" + Math.random().toString(16).substring(2, 34),
          "0x" + Math.random().toString(16).substring(2, 34),
          "0x1"
        ],
        pi_b: [
          [
            "0x" + Math.random().toString(16).substring(2, 34),
            "0x" + Math.random().toString(16).substring(2, 34)
          ],
          [
            "0x" + Math.random().toString(16).substring(2, 34),
            "0x" + Math.random().toString(16).substring(2, 34)
          ],
          ["0x1", "0x0"]
        ],
        pi_c: [
          "0x" + Math.random().toString(16).substring(2, 34),
          "0x" + Math.random().toString(16).substring(2, 34),
          "0x1"
        ],
        // Public inputs that don't reveal private data
        public_inputs: {
          totalRepoCount: privateRepoData.totalRepos,
          privateRepoCount: privateRepoData.totalPrivateRepos,
          languageCount: Object.keys(privateRepoData.languageStats).length,
          totalPrivateStars: privateRepoData.totalPrivateStars,
          // This hash would be a commitment to the full private data
          dataCommitment: "0x" + Math.random().toString(16).substring(2, 66)
        },
        timestamp: Date.now()
      };
      
      setProof(mockProof);
      
      // Call the callback with the proof
      if (onProofGenerated) {
        onProofGenerated(mockProof);
      }
    } catch (error) {
      console.error('Error generating ZK proof:', error);
    } finally {
      setGenerating(false);
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
        <h2 className="text-lg font-semibold text-gray-800">Zero-Knowledge Private Repository Proof</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Generate a zero-knowledge proof of your private repositories. This allows your private 
        data to be included in your score without revealing sensitive information.
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
              <p className="font-medium">{Object.keys(privateRepoData.languageStats).length}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">Private Stars</span>
              <p className="font-medium">{privateRepoData.totalPrivateStars}</p>
            </div>
          </div>
          
          {proof ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Proof Generated Successfully
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your private repository data is now included in your score calculation while maintaining privacy.</p>
                  </div>
                  <div className="mt-2">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(proof.public_inputs))}
                      >
                        Copy Proof Hash
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={generateProof}
              disabled={generating}
              className={`w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                generating ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {generating ? (
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
                  Generating Zero-Knowledge Proof...
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
                  Generate ZK Proof of Private Repositories
                </>
              )}
            </button>
          )}
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">
              <strong>How it works:</strong> Zero-knowledge proofs allow you to prove you have certain private repo metrics without revealing the actual repositories or their contents. Only aggregate statistics are included in your on-chain score.
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