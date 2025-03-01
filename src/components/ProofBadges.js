import React, { useState } from 'react';

const ProofBadges = ({ proofs }) => {
  const [expandedProof, setExpandedProof] = useState(null);

  // Special colors for each proof type
  const badgeColors = {
    riscZero: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-200',
      icon: 'text-blue-500'
    },
    noir: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-200',
      hover: 'hover:bg-purple-200',
      icon: 'text-purple-500'
    },
    groth16: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      hover: 'hover:bg-green-200',
      icon: 'text-green-500'
    },
    fflonk: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
      hover: 'hover:bg-orange-200',
      icon: 'text-orange-500'
    }
  };

  // Get formatted label for proof type
  const getProofLabel = (type) => {
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

  // Get icon for each proof type
  const getProofIcon = (type) => {
    const colors = badgeColors[type]?.icon || 'text-gray-500';
    
    switch (type) {
      case 'riscZero':
        return (
          <svg className={`h-5 w-5 ${colors}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'noir':
        return (
          <svg className={`h-5 w-5 ${colors}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'groth16':
        return (
          <svg className={`h-5 w-5 ${colors}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'fflonk':
        return (
          <svg className={`h-5 w-5 ${colors}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
      default:
        return (
          <svg className={`h-5 w-5 ${colors}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Get description for each proof type
  const getProofDescription = (type) => {
    switch (type) {
      case 'riscZero':
        return 'Proves code metrics without revealing source code';
      case 'noir':
        return 'Proves contribution frequency without revealing commits';
      case 'groth16':
        return 'Proves repository ownership with zero-knowledge';
      case 'fflonk':
        return 'Proves language proficiency without revealing code';
      default:
        return 'Zero-knowledge proof verification';
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  if (!proofs || proofs.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">ZK Proof Badges</h3>
      <div className="flex flex-wrap gap-2">
        {proofs.map((proof, index) => {
          const colors = badgeColors[proof.proofType] || {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            border: 'border-gray-200',
            hover: 'hover:bg-gray-200'
          };
          
          return (
            <div key={index} className="relative">
              <button
                onClick={() => setExpandedProof(expandedProof === index ? null : index)}
                className={`${colors.bg} ${colors.text} ${colors.border} ${colors.hover} border rounded-full px-3 py-1 text-xs font-medium flex items-center transition-colors duration-200`}
              >
                {getProofIcon(proof.proofType)}
                <span className="ml-1">{getProofLabel(proof.proofType)}</span>
              </button>
              
              {expandedProof === index && (
                <div className={`absolute z-10 mt-2 w-64 rounded-md shadow-lg ${colors.bg} ${colors.border} border p-3`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {getProofIcon(proof.proofType)}
                      <span className={`ml-1 font-medium ${colors.text}`}>
                        {getProofLabel(proof.proofType)}
                      </span>
                    </div>
                    <button
                      onClick={() => setExpandedProof(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="mt-2 text-xs text-gray-600">
                    {getProofDescription(proof.proofType)}
                  </p>
                  
                  {proof.verifiedAt && (
                    <div className="mt-2 text-xs text-gray-500">
                      Verified on: {formatDate(proof.verifiedAt)}
                    </div>
                  )}
                  
                  {proof.txHash && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500 truncate w-32">
                        TX: {proof.txHash.substring(0, 8)}...
                      </span>
                      <a
                        href={`https://explorer.zkverify.io/tx/${proof.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${colors.text} underline`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProofBadges;