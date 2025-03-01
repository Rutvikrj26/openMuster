import { zkVerifySession, ZkVerifyEvents, Library, CurveType } from 'zkverifyjs';

/**
 * ZKVerifySubmissionService handles the submission and verification of zero-knowledge proofs
 * using the zkVerify infrastructure
 */
export class ZKVerifySubmissionService {
  private session: any;
  private apiKey?: string;

  /**
   * Create a new ZKVerifySubmissionService
   * @param apiKey Optional API key for any additional services
   */
  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  /**
   * Initialize a zkVerify session
   * @param options Configuration options for the session
   */
  async initializeSession(options: {
    network?: 'testnet' | 'mainnet' | 'custom',
    customWebSocket?: string,
    seedPhrase?: string,
    wallet?: {
      source: any,
      accountAddress: string
    },
    readOnly?: boolean
  } = {}) {
    try {
      const session = await zkVerifySession.start();

      // Configure network
      if (options.network === 'custom' && options.customWebSocket) {
        session.Custom(options.customWebSocket);
      } else if (options.network === 'testnet') {
        session.Testnet();
      } else {
        session.Mainnet();
      }

      // Configure authentication
      if (options.seedPhrase) {
        session.withAccount(options.seedPhrase);
      } else if (options.wallet) {
        session.withWallet({
          source: options.wallet.source,
          accountAddress: options.wallet.accountAddress
        });
      }
      
      // Set read-only mode if specified
      if (options.readOnly) {
        session.readOnly();
      }

      this.session = session;
      return session;
    } catch (error) {
      console.error('Failed to initialize zkVerify session:', error);
      throw error;
    }
  }

  /**
   * Submit and verify a proof on zkVerify
   * @param proofData Proof data to submit
   * @param proofType Type of proof
   * @param options Additional verification options
   */
  async verifyProof(
    proofData: {
      vk: string,
      proof: string,
      publicSignals: string[],
      version?: string // Required for RISC0
    },
    proofType: 'risc0' | 'groth16' | 'fflonk' | 'noir',
    options: {
      waitForAttestation?: boolean,
      registeredVk?: boolean,
      nonce?: number,
      library?: 'gnark' | 'snarkjs',
      curveType?: 'bn128' | 'bn254' | 'bls12381'
    } = {}
  ) {
    if (!this.session) {
      throw new Error('Session not initialized. Call initializeSession first.');
    }

    try {
      // Configure verification based on proof type
      let verification;
      
      switch(proofType) {
        case 'groth16':
          if (!options.library || !options.curveType) {
            throw new Error('Library and CurveType are required for Groth16 proofs');
          }
          const libraryType = options.library === 'gnark' ? Library.gnark : Library.snarkjs;
          const curve = options.curveType === 'bn128' ? CurveType.bn128 : 
                        options.curveType === 'bn254' ? CurveType.bn254 : 
                        CurveType.bls12381;
                        
          verification = this.session.verify().groth16(libraryType, curve);
          break;
          
        case 'risc0':
          verification = this.session.verify().risc0();
          // Ensure version is included in proofData for RISC0
          if (!proofData.version) {
            console.warn('No version specified for RISC0 proof, using V1_2 as default');
            proofData.version = 'V1_2';
          }
          break;
          
        default:
          verification = this.session.verify()[proofType]();
      }

      // Optional: Wait for attestation
      if (options.waitForAttestation) {
        verification.waitForPublishedAttestation();
      }

      // Optional: Use registered verification key
      if (options.registeredVk) {
        verification.withRegisteredVk();
      }

      // Optional: Set nonce
      if (options.nonce) {
        verification.nonce(options.nonce);
      }

      // Execute verification
      const { events, transactionResult } = await verification.execute({ proofData });

      // Set up event listeners and collect results
      return new Promise((resolve, reject) => {
        const eventResults: any = {};
        let isResolved = false;
        
        const finalizeResult = async () => {
          if (isResolved) return;
          isResolved = true;
          
          try {
            // Wait for final transaction result
            const result = await transactionResult;
            resolve({
              transactionResult: result,
              events: eventResults
            });
          } catch (error) {
            reject(error);
          }
        };

        // Transaction included in block
        events.on(ZkVerifyEvents.IncludedInBlock, (eventData) => {
          console.log('Transaction included in block:', eventData);
          eventResults.includedInBlock = eventData;
        });

        // Transaction finalized
        events.on(ZkVerifyEvents.Finalized, (eventData) => {
          console.log('Transaction finalized:', eventData);
          eventResults.finalized = eventData;
          
          // If not waiting for attestation, resolve after finalization
          if (!options.waitForAttestation) {
            finalizeResult();
          }
        });

        // Attestation confirmed
        events.on(ZkVerifyEvents.AttestationConfirmed, (eventData) => {
          console.log('Attestation confirmed:', eventData);
          eventResults.attestationConfirmed = eventData;
          
          // If waiting for attestation, resolve after attestation is confirmed
          if (options.waitForAttestation) {
            finalizeResult();
          }
        });

        // Handle errors
        events.on('error', (error) => {
          console.error('Verification error:', error);
          eventResults.error = error;
          reject(error);
        });

        // Set a timeout to prevent hanging indefinitely
        setTimeout(() => {
          if (!isResolved) {
            console.warn('Verification timeout - resolving with current state');
            finalizeResult();
          }
        }, options.waitForAttestation ? 180000 : 60000); // 3 minutes for attestation, 1 minute otherwise
      });
    } catch (error) {
      console.error('Proof verification failed:', error);
      throw error;
    }
  }

  /**
   * Close the zkVerify session when done
   */
  async closeSession() {
    if (this.session) {
      try {
        await this.session.close();
        console.log('zkVerify session closed successfully');
      } catch (error) {
        console.error('Error closing zkVerify session:', error);
      } finally {
        this.session = null;
      }
    }
  }
}