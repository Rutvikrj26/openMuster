import { ethers } from 'ethers';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { CONTRACT_ABI } from '../constants/contractAbi';

/**
 * Service for handling wallet connections and interactions
 * Supports multiple wallet types (Ethereum, Polkadot, etc.)
 */
class WalletService {
  constructor() {
    this.account = null;
    this.walletType = null;
    this.provider = null;
    this.signer = null;
    this.contract = null;
    
    // Config (should come from environment)
    this.ethereumContractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    this.polkadotEndpoint = process.env.REACT_APP_POLKADOT_ENDPOINT || 'wss://rpc.polkadot.io';
    this.polkadotContractAddress = process.env.REACT_APP_POLKADOT_CONTRACT_ADDRESS;
    
    // App name for wallet connections
    this.appName = 'GitHub Profile Score';
  }
  
  /**
   * Initialize the wallet service with saved data
   */
  async init() {
    // Check for saved wallet connection
    const savedAccount = localStorage.getItem('connectedAccount');
    const savedWalletType = localStorage.getItem('walletType');
    
    if (savedAccount && savedWalletType) {
      try {
        await this.reconnect(savedAccount, savedWalletType);
        return true;
      } catch (error) {
        console.error("Failed to reconnect wallet:", error);
        // Clear saved data if reconnection fails
        this.clearConnectionData();
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Reconnect to a previously connected wallet
   */
  async reconnect(savedAccount, savedWalletType) {
    if (savedWalletType === 'ethereum') {
      return await this.reconnectEthereum(savedAccount);
    } else if (savedWalletType === 'polkadot') {
      return await this.reconnectPolkadot(savedAccount);
    }
    return false;
  }
  
  /**
   * Reconnect to Ethereum wallet
   */
  async reconnectEthereum(savedAccount) {
    if (!window.ethereum) return false;
    
    // Create ethers provider
    const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get accounts
    const accounts = await ethProvider.listAccounts();
    
    if (accounts.length > 0 && accounts[0].toLowerCase() === savedAccount.toLowerCase()) {
      this.account = accounts[0];
      this.walletType = 'ethereum';
      this.provider = ethProvider;
      
      const ethSigner = ethProvider.getSigner();
      this.signer = ethSigner;
      
      // Initialize contract
      if (this.ethereumContractAddress) {
        this.contract = new ethers.Contract(
          this.ethereumContractAddress,
          CONTRACT_ABI,
          ethSigner
        );
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Reconnect to Polkadot wallet
   */
  async reconnectPolkadot(savedAccount) {
    // Initialize Polkadot connection
    const extensions = await web3Enable(this.appName);
    
    if (extensions.length > 0) {
      // Get accounts from the extension
      const allAccounts = await web3Accounts();
      const account = allAccounts.find(acc => acc.address === savedAccount);
      
      if (account) {
        // Initialize Polkadot API
        const wsProvider = new WsProvider(this.polkadotEndpoint);
        const api = await ApiPromise.create({ provider: wsProvider });
        
        this.account = account.address;
        this.walletType = 'polkadot';
        this.provider = api;
        
        // Initialize contract (will need custom logic for Polkadot contracts)
        if (this.polkadotContractAddress) {
          // This is where you would initialize your Polkadot contract
          // For now, we'll leave it as null
          // this.contract = ...;
        }
        
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Connect to an Ethereum wallet
   */
  async connectEthereum(provider) {
    try {
      // Request account access
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const ethProvider = new ethers.providers.Web3Provider(provider);
      this.provider = ethProvider;
      this.account = accounts[0];
      this.walletType = 'ethereum';
      
      // Get signer
      const ethSigner = ethProvider.getSigner();
      this.signer = ethSigner;
      
      // Initialize contract
      if (this.ethereumContractAddress) {
        this.contract = new ethers.Contract(
          this.ethereumContractAddress,
          CONTRACT_ABI,
          ethSigner
        );
      }
      
      // Save connection info
      this.saveConnectionData();
      
      return {
        account: this.account,
        walletType: this.walletType,
        provider: this.provider,
        signer: this.signer,
        contract: this.contract
      };
    } catch (error) {
      console.error('Error connecting to Ethereum wallet:', error);
      throw error;
    }
  }
  
  /**
   * Connect to a Polkadot wallet
   */
  async connectPolkadot(extension) {
    try {
      // Enable the extension
      const polkadotExtension = await extension.enable(this.appName);
      
      // Get accounts
      const accounts = await polkadotExtension.accounts.get();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No Polkadot accounts found');
      }
      
      // Use the first account
      const selectedAccount = accounts[0];
      
      // Initialize Polkadot API
      const wsProvider = new WsProvider(this.polkadotEndpoint);
      const api = await ApiPromise.create({ provider: wsProvider });
      
      this.account = selectedAccount.address;
      this.walletType = 'polkadot';
      this.provider = api;
      this.signer = polkadotExtension;
      
      // Initialize contract (will need custom logic for Polkadot contracts)
      if (this.polkadotContractAddress) {
        // This is where you would initialize your Polkadot contract
        // For now, we'll leave it as null
        // this.contract = ...;
      }
      
      // Save connection info
      this.saveConnectionData();
      
      return {
        account: this.account,
        walletType: this.walletType,
        provider: this.provider,
        signer: this.signer,
        contract: this.contract
      };
    } catch (error) {
      console.error('Error connecting to Polkadot wallet:', error);
      throw error;
    }
  }
  
  /**
   * Disconnect the current wallet
   */
  disconnect() {
    this.account = null;
    this.walletType = null;
    this.provider = null;
    this.signer = null;
    this.contract = null;
    
    this.clearConnectionData();
  }
  
  /**
   * Save wallet connection data to localStorage
   */
  saveConnectionData() {
    if (this.account && this.walletType) {
      localStorage.setItem('connectedAccount', this.account);
      localStorage.setItem('walletType', this.walletType);
    }
  }
  
  /**
   * Clear saved wallet connection data
   */
  clearConnectionData() {
    localStorage.removeItem('connectedAccount');
    localStorage.removeItem('walletType');
  }
  
  /**
   * Get current connection details
   */
  getConnectionDetails() {
    return {
      account: this.account,
      walletType: this.walletType,
      provider: this.provider,
      signer: this.signer,
      contract: this.contract,
      isConnected: !!this.account
    };
  }
  
  /**
   * Check if a wallet is connected
   */
  isConnected() {
    return !!this.account;
  }
  
  /**
   * Get the current account
   */
  getAccount() {
    return this.account;
  }
  
  /**
   * Get the wallet type
   */
  getWalletType() {
    return this.walletType;
  }
  
  /**
   * Get the contract instance
   */
  getContract() {
    return this.contract;
  }
}

// Export a singleton instance
export default new WalletService();