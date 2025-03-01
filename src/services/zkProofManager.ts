import { ZKVerifySubmissionService } from './zkVerify.ts';
import zkProvider from './zkProvider';

/**
 * ProofManager connects proof generation (API) with verification (zkVerify blockchain)
 */
export class ProofManager {
  private zkProvider: any;
  private zkVerifyService: ZKVerifySubmissionService;
  
  constructor() {
    // This is already a singleton instance
    this.zkProvider = zkProvider;
    // zkVerify service doesn't actually need an API key for blockchain interactions
    this.zkVerifyService = new ZKVerifySubmissionService();
  }
  
  /**
   * Generate and verify code metrics proof
   */
  async proveCodeMetrics(privateRepoData: any) {
    try {
      let generatedProof;
      
      // If a proof was already generated, use it. Otherwise, generate one.
      if (privateRepoData.generatedProof) {
        console.log('Using pre-generated code metrics proof...');
        generatedProof = privateRepoData.generatedProof;
      } else {
        // Step 1: Generate the proof using the API
        console.log('Generating code metrics proof...');
        generatedProof = await this.zkProvider.generateCodeMetricsProof(privateRepoData);
      }
      
      // Step 2: Initialize zkVerify blockchain session
      console.log('Initializing zkVerify session...');
      await this.zkVerifyService.initializeSession({
        network: 'testnet',
        seedPhrase: process.env.ZKVERIFY_SEED_PHRASE,
        readOnly: !process.env.ZKVERIFY_SEED_PHRASE
      });
      
      // Step 3: Submit and verify the proof on blockchain
      console.log('Submitting proof to zkVerify blockchain...');
      const verificationResult = await this.zkVerifyService.verifyProof(
        {
          vk: generatedProof.publicInputs?.vk || generatedProof.proofId,
          proof: generatedProof.proof,
          publicSignals: Array.isArray(generatedProof.publicInputs) 
            ? generatedProof.publicInputs 
            : Object.values(generatedProof.publicInputs),
          version: 'V1_2' // For RISC0
        },
        'risc0',
        { waitForAttestation: true }
      );
      
      console.log('Proof verification complete');
      return {
        generated: generatedProof,
        verified: verificationResult,
        success: !!verificationResult.transactionResult?.success
      };
    } catch (error) {
      console.error('Code metrics proof workflow failed:', error);
      throw error;
    } finally {
      await this.zkVerifyService.closeSession();
    }
  }  

  /**
   * Generate and verify activity proof
   */
  async proveActivity(activityData: any) {
    try {
      // Step 1: Generate the proof
      console.log('Generating activity proof...');
      const generatedProof = await this.zkProvider.generateActivityProof(activityData);
      
      // Step 2: Initialize zkVerify blockchain session
      console.log('Initializing zkVerify session...');
      await this.zkVerifyService.initializeSession({
        network: 'testnet',
        seedPhrase: process.env.ZKVERIFY_SEED_PHRASE,
        readOnly: !process.env.ZKVERIFY_SEED_PHRASE
      });
      
      // Step 3: Submit and verify the proof on blockchain
      console.log('Submitting proof to zkVerify blockchain...');
      const verificationResult = await this.zkVerifyService.verifyProof(
        {
          vk: generatedProof.publicInputs?.vk || generatedProof.proofId,
          proof: generatedProof.proof,
          publicSignals: Array.isArray(generatedProof.publicInputs) 
            ? generatedProof.publicInputs 
            : Object.values(generatedProof.publicInputs),
        },
        'noir',
        { waitForAttestation: true }
      );
      
      console.log('Proof verification complete');
      return {
        generated: generatedProof,
        verified: verificationResult,
        success: !!verificationResult.transactionResult?.success
      };
    } catch (error) {
      console.error('Activity proof workflow failed:', error);
      throw error;
    } finally {
      await this.zkVerifyService.closeSession();
    }
  }
  
  /**
   * Generate and verify ownership proof
   */
  async proveOwnership(ownershipData: any) {
    try {
      // Step 1: Generate the proof
      console.log('Generating ownership proof...');
      const generatedProof = await this.zkProvider.generateOwnershipProof(ownershipData);
      
      // Step 2: Initialize zkVerify blockchain session
      console.log('Initializing zkVerify session...');
      await this.zkVerifyService.initializeSession({
        network: 'testnet',
        seedPhrase: process.env.ZKVERIFY_SEED_PHRASE,
        readOnly: !process.env.ZKVERIFY_SEED_PHRASE
      });
      
      // Step 3: Submit and verify the proof on blockchain
      console.log('Submitting proof to zkVerify blockchain...');
      const verificationResult = await this.zkVerifyService.verifyProof(
        {
          vk: generatedProof.publicInputs?.vk || generatedProof.proofId,
          proof: generatedProof.proof,
          publicSignals: Array.isArray(generatedProof.publicInputs) 
            ? generatedProof.publicInputs 
            : Object.values(generatedProof.publicInputs),
        },
        'groth16',
        { 
          library: 'gnark',
          curveType: 'bn128',
          waitForAttestation: true 
        }
      );
      
      console.log('Proof verification complete');
      return {
        generated: generatedProof,
        verified: verificationResult,
        success: !!verificationResult.transactionResult?.success
      };
    } catch (error) {
      console.error('Ownership proof workflow failed:', error);
      throw error;
    } finally {
      await this.zkVerifyService.closeSession();
    }
  }

  /**
   * Generate and verify language proof
   */
  async proveLanguage(languageData: any) {
    try {
      // Step 1: Generate the proof
      console.log('Generating language proficiency proof...');
      const generatedProof = await this.zkProvider.generateLanguageProof(languageData);
      
      // Step 2: Initialize zkVerify blockchain session
      console.log('Initializing zkVerify session...');
      await this.zkVerifyService.initializeSession({
        network: 'testnet',
        seedPhrase: process.env.ZKVERIFY_SEED_PHRASE,
        readOnly: !process.env.ZKVERIFY_SEED_PHRASE
      });
      
      // Step 3: Submit and verify the proof on blockchain
      console.log('Submitting proof to zkVerify blockchain...');
      const verificationResult = await this.zkVerifyService.verifyProof(
        {
          vk: generatedProof.publicInputs?.vk || generatedProof.proofId,
          proof: generatedProof.proof,
          publicSignals: Array.isArray(generatedProof.publicInputs) 
            ? generatedProof.publicInputs 
            : Object.values(generatedProof.publicInputs),
        },
        'fflonk',
        { waitForAttestation: true }
      );
      
      console.log('Proof verification complete');
      return {
        generated: generatedProof,
        verified: verificationResult,
        success: !!verificationResult.transactionResult?.success
      };
    } catch (error) {
      console.error('Language proof workflow failed:', error);
      throw error;
    } finally {
      await this.zkVerifyService.closeSession();
    }
  }
}

export default new ProofManager();