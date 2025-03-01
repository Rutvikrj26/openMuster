import axios from 'axios';

/**
 * ZkProvider service handles the generation and verification of ZK proofs
 * using the zkVerify infrastructure
 */
class ZkProvider {
  constructor() {
    this.baseUrl = process.env.REACT_APP_ZKVERIFY_API_URL || 'https://api.zkverify.io';
    this.apiKey = process.env.REACT_APP_ZKVERIFY_API_KEY;
  }

  /**
   * Get authorization headers for API requests
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Generate a code metrics proof using RiscZero ZKVM
   * Proves facts about repo metrics without revealing actual code
   */
  async generateCodeMetricsProof(privateRepoData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/proofs/riscZero/generate`,
        {
          claim_type: 'github_metrics',
          public_inputs: {
            total_repos: privateRepoData.totalRepos,
            private_repos: privateRepoData.totalPrivateRepos,
            timestamp: Math.floor(Date.now() / 1000)
          },
          private_inputs: {
            repo_details: privateRepoData.repoDetails,
            access_token: privateRepoData.accessToken
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        proofType: 'riscZero',
        proofId: response.data.proof_id,
        proof: response.data.proof,
        publicInputs: response.data.public_inputs
      };
    } catch (error) {
      console.error('Error generating RiscZero code metrics proof:', error);
      throw new Error('Failed to generate code metrics proof');
    }
  }

  /**
   * Generate a contribution activity proof using Noir Hyperplonk
   * Proves frequency and consistency of commits without revealing details
   */
  async generateActivityProof(activityData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/proofs/noir/generate`,
        {
          claim_type: 'github_activity',
          public_inputs: {
            contribution_count: activityData.contributionCount,
            active_days: activityData.activeDays,
            longest_streak: activityData.longestStreak,
            timestamp: Math.floor(Date.now() / 1000)
          },
          private_inputs: {
            activity_timeline: activityData.activityTimeline,
            access_token: activityData.accessToken
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        proofType: 'noir',
        proofId: response.data.proof_id,
        proof: response.data.proof,
        publicInputs: response.data.public_inputs
      };
    } catch (error) {
      console.error('Error generating Noir activity proof:', error);
      throw new Error('Failed to generate activity proof');
    }
  }

  /**
   * Generate a repository ownership proof using Groth16
   * Proves ownership of private repositories without revealing their contents
   */
  async generateOwnershipProof(ownershipData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/proofs/groth16/generate`,
        {
          claim_type: 'github_ownership',
          public_inputs: {
            github_username: ownershipData.username,
            repo_count: ownershipData.repoCount,
            wallet_address: ownershipData.walletAddress,
            timestamp: Math.floor(Date.now() / 1000)
          },
          private_inputs: {
            repository_ids: ownershipData.repositoryIds,
            access_token: ownershipData.accessToken
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        proofType: 'groth16',
        proofId: response.data.proof_id,
        proof: response.data.proof,
        publicInputs: response.data.public_inputs
      };
    } catch (error) {
      console.error('Error generating Groth16 ownership proof:', error);
      throw new Error('Failed to generate ownership proof');
    }
  }

  /**
   * Generate language proficiency proof using Polygon FFlonk
   * Proves language usage across repositories without revealing code
   */
  async generateLanguageProof(languageData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/proofs/fflonk/generate`,
        {
          claim_type: 'github_languages',
          public_inputs: {
            language_count: Object.keys(languageData.languages).length,
            primary_language: languageData.primaryLanguage,
            timestamp: Math.floor(Date.now() / 1000)
          },
          private_inputs: {
            language_details: languageData.languageDetails,
            access_token: languageData.accessToken
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        proofType: 'fflonk',
        proofId: response.data.proof_id,
        proof: response.data.proof,
        publicInputs: response.data.public_inputs
      };
    } catch (error) {
      console.error('Error generating FFlonk language proof:', error);
      throw new Error('Failed to generate language proof');
    }
  }

  /**
   * Verify multiple proofs on zkVerify blockchain
   */
  async verifyProofs(proofs) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/verify/batch`,
        {
          proofs: proofs.map(p => ({
            proof_type: p.proofType,
            proof_id: p.proofId,
            proof: p.proof,
            public_inputs: p.publicInputs
          }))
        },
        { headers: this.getHeaders() }
      );

      return {
        verificationId: response.data.verification_id,
        results: response.data.results,
        txHash: response.data.transaction_hash,
        blockNumber: response.data.block_number,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Error verifying proofs on zkVerify:', error);
      throw new Error('Failed to verify proofs');
    }
  }

  /**
   * Get verification status of previously submitted proofs
   */
  async getVerificationStatus(verificationId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/verify/status/${verificationId}`,
        { headers: this.getHeaders() }
      );

      return {
        status: response.data.status,
        results: response.data.results,
        txHash: response.data.transaction_hash,
        blockNumber: response.data.block_number
      };
    } catch (error) {
      console.error('Error getting verification status:', error);
      throw new Error('Failed to get verification status');
    }
  }
}

export default new ZkProvider();