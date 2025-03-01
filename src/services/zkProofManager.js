import zkBrowserProvider from './zkBrowserProvider';

/**
 * ProofManager class for managing ZK proofs
 * Handles initialization, generation, and submission of zero-knowledge proofs
 */
export class ProofManager {
  constructor() {
    this.zkProvider = zkBrowserProvider;
    this.initialized = false;
  }
  
  /**
   * Initialize the ZK Proof Manager with a wallet address
   * @param {string} walletAddress - The user's wallet address 
   */
  async initialize(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address is required for ZK proof initialization');
    }
    
    try {
      await this.zkProvider.initializeSession(walletAddress);
      this.initialized = true;
      console.log('ZK Proof Manager initialized with wallet:', walletAddress);
    } catch (error) {
      console.error('Error initializing ZK Proof Manager:', error);
      throw new Error(`Failed to initialize ZK proof system: ${error.message}`);
    }
  }
  
  /**
   * Clean up resources when done
   */
  async cleanup() {
    if (this.initialized) {
      try {
        await this.zkProvider.closeSession();
        this.initialized = false;
        console.log('ZK Proof Manager resources cleaned up');
      } catch (error) {
        console.error('Error cleaning up ZK Proof Manager:', error);
      }
    }
  }
  
  /**
   * Check initialization status
   * @throws {Error} If the manager is not initialized
   */
  checkInitialized() {
    if (!this.initialized) {
      throw new Error('ZK Proof Manager not initialized. Call initialize() first.');
    }
  }
  
  /**
   * Generate and submit a code metrics proof
   * @param {Object} privateRepoData - Private repository data to prove
   * @returns {Object} - The proof and verification result
   */
  async proveCodeMetrics(privateRepoData) {
    this.checkInitialized();
    
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
        generatedProof
      );
      
      console.log('Proof verification complete:', verificationResult);
      return {
        generated: generatedProof,
        verified: verificationResult,
        success: verificationResult.success,
        txHash: verificationResult.txHash,
        verificationId: verificationResult.verificationId
      };
    } catch (error) {
      console.error('Code metrics proof workflow failed:', error);
      throw error;
    }
  }

  /**
   * Generate and submit an activity proof
   * @param {Object} activityData - Activity data to prove
   * @returns {Object} - The proof and verification result
   */
  async proveActivity(activityData) {
    this.checkInitialized();
    
    try {
      // Generate the proof
      console.log('Generating activity proof...');
      const generatedProof = activityData.generatedProof?.proofType === 'noir' 
        ? activityData.generatedProof 
        : await this.zkProvider.generateActivityProof(activityData);
      
      // Submit the proof to zkVerify
      console.log('Submitting proof to zkVerify...');
      const verificationResult = await this.zkProvider.submitProofToZkVerify(
        'noir',
        generatedProof
      );
      
      console.log('Activity proof verification complete:', verificationResult);
      return {
        generated: generatedProof,
        verified: verificationResult,
        success: verificationResult.success,
        txHash: verificationResult.txHash,
        verificationId: verificationResult.verificationId
      };
    } catch (error) {
      console.error('Activity proof workflow failed:', error);
      throw error;
    }
  }
  
  /**
   * Generate and submit an ownership proof
   * @param {Object} ownershipData - Ownership data to prove
   * @returns {Object} - The proof and verification result
   */
  async proveOwnership(ownershipData) {
    this.checkInitialized();
    
    try {
      // Generate the proof
      console.log('Generating ownership proof...');
      const generatedProof = ownershipData.generatedProof?.proofType === 'groth16' 
        ? ownershipData.generatedProof 
        : await this.zkProvider.generateOwnershipProof(ownershipData);
      
      // Submit the proof to zkVerify
      console.log('Submitting proof to zkVerify...');
      const verificationResult = await this.zkProvider.submitProofToZkVerify(
        'groth16',
        generatedProof
      );
      
      console.log('Ownership proof verification complete:', verificationResult);
      return {
        generated: generatedProof,
        verified: verificationResult,
        success: verificationResult.success,
        txHash: verificationResult.txHash,
        verificationId: verificationResult.verificationId
      };
    } catch (error) {
      console.error('Ownership proof workflow failed:', error);
      throw error;
    }
  }

  /**
   * Generate and submit a language proficiency proof
   * @param {Object} languageData - Language data to prove
   * @returns {Object} - The proof and verification result
   */
  async proveLanguage(languageData) {
    this.checkInitialized();
    
    try {
      // Generate the proof
      console.log('Generating language proficiency proof...');
      const generatedProof = languageData.generatedProof?.proofType === 'fflonk' 
        ? languageData.generatedProof 
        : await this.zkProvider.generateLanguageProof(languageData);
      
      // Submit the proof to zkVerify
      console.log('Submitting proof to zkVerify...');
      const verificationResult = await this.zkProvider.submitProofToZkVerify(
        'fflonk',
        generatedProof
      );
      
      console.log('Language proof verification complete:', verificationResult);
      return {
        generated: generatedProof,
        verified: verificationResult,
        success: verificationResult.success,
        txHash: verificationResult.txHash,
        verificationId: verificationResult.verificationId
      };
    } catch (error) {
      console.error('Language proof workflow failed:', error);
      throw error;
    }
  }
}

// Export a singleton instance for convenience
export default new ProofManager();