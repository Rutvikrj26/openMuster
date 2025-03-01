import { ethers } from 'ethers';

/**
 * ZkContractService handles interactions with the smart contract
 * for storing ZK proof verification results on the blockchain
 */
class ZkContractService {
  constructor() {
    this.contract = null;
    this.account = null;
  }
  
  /**
   * Initialize the contract service
   * @param {Object} contract - The ethers.js contract instance
   * @param {string} account - The user's wallet address
   */
  initialize(contract, account) {
    if (!contract) {
      throw new Error('Contract instance is required');
    }
    
    this.contract = contract;
    this.account = account;
    
    console.log('ZK Contract Service initialized with contract:', contract.address);
    console.log('Account:', account);
  }
  
  /**
   * Store ZK proof verification result on the blockchain
   * @param {string} username - GitHub username
   * @param {string} proofType - The type of proof (riscZero, noir, groth16, fflonk)
   * @param {string} verificationId - ID from zkVerify
   * @param {string} txHash - Transaction hash on zkVerify blockchain
   * @returns {Promise<Object>} - Transaction receipt
   */
  async storeProofVerification(username, proofType, verificationId, txHash) {
    if (!this.contract || !this.account) {
      throw new Error('ZK Contract Service not initialized');
    }
    
    if (!username || !proofType || !verificationId || !txHash) {
      throw new Error('Missing required parameters for storing proof verification');
    }
    
    try {
      console.log(`Storing ${proofType} proof verification for ${username} on blockchain...`);
      
      // Check if this function exists on the contract
      if (!this.contract.addZKProofVerification) {
        throw new Error('Contract does not support ZK proof verification');
      }
      
      // Call the smart contract function to store the verification
      const tx = await this.contract.addZKProofVerification(
        username,
        proofType,
        verificationId,
        txHash
      );
      
      console.log(`Transaction sent with hash: ${tx.hash}`);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        events: receipt.events
      };
    } catch (error) {
      console.error('Error storing proof verification on blockchain:', error);
      throw new Error(`Failed to store proof verification: ${error.message}`);
    }
  }
  
  /**
   * Store multiple ZK proof verifications in one transaction
   * @param {string} username - GitHub username
   * @param {Array<Object>} proofs - Array of proof objects
   * @returns {Promise<Object>} - Transaction receipt
   */
  async storeMultipleProofVerifications(username, proofs) {
    if (!this.contract || !this.account) {
      throw new Error('ZK Contract Service not initialized');
    }
    
    if (!username || !proofs || !Array.isArray(proofs) || proofs.length === 0) {
      throw new Error('Missing required parameters for storing multiple proof verifications');
    }
    
    try {
      console.log(`Storing ${proofs.length} proof verifications for ${username} on blockchain...`);
      
      // Check if batch function exists on the contract
      if (this.contract.addMultipleZKProofVerifications) {
        // Use batch function if available
        const proofTypes = proofs.map(p => p.proofType);
        const verificationIds = proofs.map(p => p.verificationId);
        const txHashes = proofs.map(p => p.txHash);
        
        const tx = await this.contract.addMultipleZKProofVerifications(
          username,
          proofTypes,
          verificationIds,
          txHashes
        );
        
        console.log(`Batch transaction sent with hash: ${tx.hash}`);
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log(`Batch transaction confirmed in block ${receipt.blockNumber}`);
        
        return {
          success: true,
          txHash: tx.hash,
          blockNumber: receipt.blockNumber,
          events: receipt.events
        };
      } else {
        // Fall back to individual transactions if batch function is not available
        console.log('Batch function not available, using individual transactions');
        
        const results = [];
        for (const proof of proofs) {
          const result = await this.storeProofVerification(
            username,
            proof.proofType,
            proof.verificationId,
            proof.txHash
          );
          results.push(result);
        }
        
        return {
          success: true,
          results
        };
      }
    } catch (error) {
      console.error('Error storing multiple proof verifications:', error);
      throw new Error(`Failed to store multiple proof verifications: ${error.message}`);
    }
  }
  
  /**
   * Get all ZK proof verifications for a username
   * @param {string} username - GitHub username
   * @returns {Promise<Array<Object>>} - Array of proof verification objects
   */
  async getProofVerifications(username) {
    if (!this.contract) {
      throw new Error('ZK Contract Service not initialized');
    }
    
    if (!username) {
      throw new Error('Username is required');
    }
    
    try {
      console.log(`Fetching ZK proof verifications for ${username}...`);
      
      // Check if this function exists on the contract
      if (!this.contract.getAllZkProofVerifications) {
        throw new Error('Contract does not support getting ZK proof verifications');
      }
      
      // Call the smart contract function to get verifications
      const verifications = await this.contract.getAllZkProofVerifications(username);
      
      return verifications.map(v => ({
        proofType: v.proofType,
        verificationId: v.verificationId,
        txHash: v.txHash,
        verifiedAt: new Date(v.verifiedAt.toNumber() * 1000)
      }));
    } catch (error) {
      console.error('Error fetching proof verifications:', error);
      throw new Error(`Failed to fetch proof verifications: ${error.message}`);
    }
  }
  
  /**
   * Check if a username has any ZK proof verifications
   * @param {string} username - GitHub username
   * @returns {Promise<boolean>} - Whether the username has any ZK proof verifications
   */
  async hasZkVerification(username) {
    if (!this.contract) {
      throw new Error('ZK Contract Service not initialized');
    }
    
    if (!username) {
      throw new Error('Username is required');
    }
    
    try {
      // Get the profile data
      const profileData = await this.contract.getProfileScore(username);
      
      // Check if the profile has ZK verification
      return profileData.hasZkVerification || false;
    } catch (error) {
      console.error('Error checking ZK verification status:', error);
      return false;
    }
  }
}

// Export a singleton instance
export default new ZkContractService();