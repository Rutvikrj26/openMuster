import React, { useState, useEffect } from 'react';

const ProofDetailsViewer = ({ proofs = [] }) => {
  const [selectedProof, setSelectedProof] = useState(null);
  const [expandedProofIndex, setExpandedProofIndex] = useState(null);

  useEffect(() => {
    // Set the first proof as selected by default if proofs are available
    if (proofs.length > 0 && !selectedProof) {
      setSelectedProof(proofs[0]);
      setExpandedProofIndex(0);
    }
  }, [proofs, selectedProof]);

  // Get color class based on proof type
  const getProofColor = (proofType) => {
    switch (proofType) {
      case 'riscZero':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'noir':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'groth16':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fflonk':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get icon based on proof type
  const getProofIcon = (proofType) => {
    switch (proofType) {
      case 'riscZero':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'noir':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'groth16':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'fflonk':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Format proof name for display
  const formatProofName = (proofType) => {
    switch (proofType) {
      case 'riscZero':
        return 'RiscZero ZKVM';
      case 'noir':
        return 'Noir Hyperplonk';
      case 'groth16':
        return 'Groth16';
      case 'fflonk':
        return 'Polygon FFlonk';
      default:
        return proofType;
    }
  };

  // Format transaction hash for display
  const formatTxHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  // Format verification ID for display
  const formatVerificationId = (id) => {
    if (!id) return 'N/A';
    return id.length > 16 ? `${id.substring(0, 8)}...${id.substring(id.length - 8)}` : id;
  };

  // Description of each proof type
  const getProofDescription = (proofType) => {
    switch (proofType) {
      case 'riscZero':
        return 'Proves code metrics without revealing source code. Uses RISC-Zero ZKVM to generate a proof that the repository metrics are correct.';
      case 'noir':
        return 'Proves contribution frequency and activity without revealing commit details. Uses Noir Hyperplonk to verify activity patterns.';
      case 'groth16':
        return 'Proves repository ownership with zero-knowledge. Verifies ownership of private repositories without revealing their contents.';
      case 'fflonk':
        return 'Proves language proficiency without revealing code. Demonstrates language usage across repositories privately.';
      default:
        return 'Zero-knowledge proof verification';
    }
  };

  // Toggle expanded proof
  const toggleProof = (index) => {
    if (expandedProofIndex === index) {
      setExpandedProofIndex(null);
    } else {
      setExpandedProofIndex(index);
      setSelectedProof(proofs[index]);
    }
  };

  if (!proofs || proofs.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <svg className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-gray-600">No proof data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Zero-Knowledge Proof Verifications</h3>
        <p className="mt-1 text-sm text-gray-500">
          All proofs are verified on the zkVerify blockchain, preserving your private data privacy
        </p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Proof list */}
        <div className="p-4 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Available Proofs</h4>
          <div className="space-y-2">
            {proofs.map((proof, index) => (
              <div 
                key={index}
                onClick={() => toggleProof(index)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  expandedProofIndex === index 
                    ? getProofColor(proof.proofType)
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`p-2 rounded-full mr-3 ${expandedProofIndex === index ? '' : getProofColor(proof.proofType)}`}>
                  {getProofIcon(proof.proofType)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{formatProofName(proof.proofType)}</div>
                  <div className="text-xs text-gray-500">
                    {proof.verifiedAt ? new Date(proof.verifiedAt).toLocaleDateString() : 'Verified'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proof details */}
        <div className="p-4 w-full md:w-2/3">
          {selectedProof && (
            <div>
              <div className={`p-4 rounded-t-lg ${getProofColor(selectedProof.proofType)}`}>
                <div className="flex items-center">
                  <div className="mr-3">
                    {getProofIcon(selectedProof.proofType)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{formatProofName(selectedProof.proofType)}</h3>
                    <p className="text-sm">Verified on zkVerify</p>
                  </div>
                </div>
              </div>

              <div className="border-l border-r border-b border-gray-200 rounded-b-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  {getProofDescription(selectedProof.proofType)}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Transaction Hash</h4>
                    <a
                      href={`https://explorer.zkverify.io/tx/${selectedProof.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <span className="font-mono">{formatTxHash(selectedProof.txHash)}</span>
                      <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Verification ID</h4>
                    <p className="font-mono">{formatVerificationId(selectedProof.verificationId)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Verification Date</h4>
                    <p>{selectedProof.verifiedAt ? new Date(selectedProof.verifiedAt).toLocaleString() : 'N/A'}</p>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Status</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProofDetailsViewer;