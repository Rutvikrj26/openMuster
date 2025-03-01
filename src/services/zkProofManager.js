import zkBrowserProvider from './zkBrowserProvider';

/**
 * Browser-compatible Proof Manager for generating and submitting
 * ZK proofs without using Node.js-specific libraries directly
 */
export class ProofManager {
  constructor() {
    this.zkProvider = zkBrowserProvider;
  }
  
  /**
   * Generate and submit a code metrics proof
   */
  async proveCodeMetrics(privateRepoData) {
    try {
      let generatedProof;
      
      // If a proof was already generated, use it. Otherwise, generate one.
      if (privateRepoData.generatedProof && privateRepoData.generatedProof.proofType === 'riscZero') {
        console.log('Using pre-generated code metrics proof...');
        generatedProof = privateRepoData.generatedProof;
      } else {
        // Generate the proof
        console.log('Generating code metrics proof...');
        generatedProof = await this.zkProvider.generateCodeMetricsProof(privateRepoData);
      }
      
      // Submit the proof to zkVerify
      console.log('Submitting proof to zkVerify...');
      const verificationResult = await this.zkProvider.submitProofToZkVerify(
        'riscZero',
        {
          proofId: generatedProof.proofId,
          proof: generatedProof.proof,
          publicInputs: generatedProof.publicInputs
        }
      );
      
      console.log('Proof verification complete');
      return {
        generated: generatedProof,
        verified: {
          events: {
            includedInBlock: {
              transactionHash: verificationResult.txHash
            }
          }
        },
        success: verificationResult.success
      };
    } catch (error) {
      console.error('Code metrics proof workflow failed:', error);
      throw error;
    }
  }

  /**
   * Generate and submit an activity proof
   */
  async proveActivity(activityData) {
    try {
      // Generate the proof
      console.log('Generating activity proof...');
      const generatedProof = await this.zkProvider.generateActivityProof(activityData);
      
      // Submit the proof to zkVerify
      console.log('Submitting proof to zkVerify...');
      const verificationResult = await this.zkProvider.submitProofToZkVerify(
        'noir',
        {
          proofId: generatedProof.proofId,
          proof: generatedProof.proof,
          publicInputs: generatedProof.publicInputs
        }
      );
      
      console.log('Activity proof verification complete');
      return {
        generated: generatedProof,
        verified: {
          events: {
            includedInBlock: {
              transactionHash: verificationResult.txHash
            }
          }
        },
        success: verificationResult.success
      };
    } catch (error) {
      console.error('Activity proof workflow failed:', error);
      throw error;
    }
  }
  
  /**
   * Generate and submit an ownership proof
   */
  async proveOwnership(ownershipData) {
    try {
      // Generate the proof
      console.log('Generating ownership proof...');
      const generatedProof = await this.zkProvider.generateOwnershipProof(ownershipData);
      
      // Submit the proof to zkVerify
      console.log('Submitting proof to zkVerify...');
      const verificationResult = await this.zkProvider.submitProofToZkVerify(
        'groth16',
        {
          proofId: generatedProof.proofId,
          proof: generatedProof.proof,
          publicInputs: generatedProof.publicInputs
        }
      );
      
      console.log('Ownership proof verification complete');
      return {
        generated: generatedProof,
        verified: {
          events: {
            includedInBlock: {
              transactionHash: verificationResult.txHash
            }
          }
        },
        success: verificationResult.success
      };
    } catch (error) {
      console.error('Ownership proof workflow failed:', error);
      throw error;
    }
  }

  /**
   * Generate and submit a language proficiency proof
   */
  async proveLanguage(languageData) {
    try {
      // Generate the proof
      console.log('Generating language proficiency proof...');
      const generatedProof = await this.zkProvider.generateLanguageProof(languageData);
      
      // Submit the proof to zkVerify
      console.log('Submitting proof to zkVerify...');
      const verificationResult = await this.zkProvider.submitProofToZkVerify(
        'fflonk',
        {
          proofId: generatedProof.proofId,
          proof: generatedProof.proof,
          publicInputs: generatedProof.publicInputs
        }
      );
      
      console.log('Language proof verification complete');
      return {
        generated: generatedProof,
        verified: {
          events: {
            includedInBlock: {
              transactionHash: verificationResult.txHash
            }
          }
        },
        success: verificationResult.success
      };
    } catch (error) {
      console.error('Language proof workflow failed:', error);
      throw error;
    }
  }
}

// Export a singleton instance for convenience
export default new ProofManager();