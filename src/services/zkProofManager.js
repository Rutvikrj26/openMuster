import zkBrowserProvider from './zkBrowserProvider';

/**
 * ProofManager class for managing ZK proofs
 * Handles initialization, generation, and submission of zero-knowledge proofs
 */
export class ProofManager {
  constructor() {
    this.zkProvider = zkBrowserProvider;
    this.initialized = false;
    this.walletAddress = null;
    this.initPromise = null; // Track initialization promise to avoid multiple calls
  }
  
  /**
   * Initialize the ZK Proof Manager with a wallet address
   * @param {string} walletAddress - The user's wallet address 
   * @returns {Promise<void>}
   */
  async initialize(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address is required for ZK proof initialization');
    }
    
    // If already initialized with this wallet, return immediately
    if (this.initialized && this.walletAddress === walletAddress) {
      console.log('ZK Proof Manager already initialized with wallet:', walletAddress);
      return;
    }
    
    // If initialization is in progress, wait for it
    if (this.initPromise) {
      try {
        await this.initPromise;
        // If initialization completed for a different wallet, reinitialize
        if (this.walletAddress !== walletAddress) {
          this.initPromise = this._initializeInternal(walletAddress);
          await this.initPromise;
        }
      } catch (error) {
        // Previous initialization failed, try again
        this.initPromise = this._initializeInternal(walletAddress);
        await this.initPromise;
      }
    } else {
      // First initialization
      this.initPromise = this._initializeInternal(walletAddress);
      await this.initPromise;
    }
  }
  
  /**
   * Internal initialization logic
   * @private
   * @param {string} walletAddress - The user's wallet address
   * @returns {Promise<void>}
   */
  async _initializeInternal(walletAddress) {
    try {
      console.log('Initializing ZK Provider with wallet:', walletAddress);
      
      // Reset state
      this.initialized = false;
      this.walletAddress = null;
      
      // Initialize the zkProvider
      await this.zkProvider.initializeSession(walletAddress);
      
      // Update state after successful initialization
      this.initialized = true;
      this.walletAddress = walletAddress;
      
      console.log('ZK Proof Manager initialized successfully with wallet:', walletAddress);
    } catch (error) {
      console.error('Error initializing ZK Proof Manager:', error);
      // Reset init promise so we can try again
      this.initPromise = null;
      throw new Error(`Failed to initialize ZK proof system: ${error.message}`);
    }
  }
  
  /**
   * Clean up resources when done
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (this.initialized) {
      try {
        await this.zkProvider.closeSession();
        this.initialized = false;
        this.walletAddress = null;
        this.initPromise = null;
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
   * @returns {Promise<Object>} - The proof and verification result
   */
  async proveCodeMetrics(privateRepoData) {
    if (!this.initialized) {
      // Try to auto-initialize if walletAddress is provided in privateRepoData
      if (privateRepoData.walletAddress) {
        await this.initialize(privateRepoData.walletAddress);
      } else {
        this.checkInitialized();
      }
    }
    
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
      console.log('Submitting code metrics proof to zkVerify...');
      const verificationResult = await this.zkProvider.submitProofToZkVerify(
        'riscZero',
        generatedProof
      );
      
      console.log('Code metrics proof verification complete:', verificationResult);
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
   * @returns {Promise<Object>} - The proof and verification result
   */
  async proveActivity(activityData) {
    if (!this.initialized) {
      // Try to auto-initialize if walletAddress is provided
      if (activityData.walletAddress) {
        await this.initialize(activityData.walletAddress);
      } else {
        this.checkInitialized();
      }
    }
    
    try {
      // Generate the proof
      console.log('Generating activity proof...');
      const generatedProof = activityData.generatedProof?.proofType === 'noir' 
        ? activityData.generatedProof 
        : await this.zkProvider.generateActivityProof(activityData);
      
      // Submit the proof to zkVerify
      console.log('Submitting activity proof to zkVerify...');
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
   * @returns {Promise<Object>} - The proof and verification result
   */
  async proveOwnership(ownershipData) {
    if (!this.initialized) {
      // Try to auto-initialize if walletAddress is provided
      if (ownershipData.walletAddress) {
        await this.initialize(ownershipData.walletAddress);
      } else {
        this.checkInitialized();
      }
    }
    
    try {
      // Generate the proof
      console.log('Generating ownership proof...');
      const generatedProof = ownershipData.generatedProof?.proofType === 'groth16' 
        ? ownershipData.generatedProof 
        : await this.zkProvider.generateOwnershipProof(ownershipData);
      
      // Submit the proof to zkVerify
      console.log('Submitting ownership proof to zkVerify...');
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
   * @returns {Promise<Object>} - The proof and verification result
   */
  async proveLanguage(languageData) {
    if (!this.initialized) {
      // Try to auto-initialize if walletAddress is provided
      if (languageData.walletAddress) {
        await this.initialize(languageData.walletAddress);
      } else {
        this.checkInitialized();
      }
    }
    
    try {
      // Generate the proof
      console.log('Generating language proficiency proof...');
      const generatedProof = languageData.generatedProof?.proofType === 'fflonk' 
        ? languageData.generatedProof 
        : await this.zkProvider.generateLanguageProof(languageData);
      
      // Submit the proof to zkVerify
      console.log('Submitting language proof to zkVerify...');
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
