import React from 'react';

const ConnectWallet = ({ onConnect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          <svg 
            className="h-16 w-16 mx-auto text-blue-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h1>
        
        <p className="text-gray-600 mb-6">
          Connect your Ethereum wallet to analyze GitHub profiles and store results on the blockchain.
        </p>
        
        <button 
          onClick={onConnect}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300"
        >
          Connect Wallet
        </button>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Supported wallets:</p>
          <div className="flex justify-center mt-2 space-x-4">
            <div className="flex items-center">
              <img 
                src="https://metamask.io/images/metamask-fox.svg" 
                alt="MetaMask" 
                className="h-5 w-5 mr-1"
              />
              <span>MetaMask</span>
            </div>
            <div className="flex items-center">
              <img 
                src="https://www.coinbase.com/assets/press/coinbase-mark-36d47a54b4d3940e05f3c0dc2383944c05c1ae157217bf19cb9044cdef14d322.svg" 
                alt="Coinbase Wallet" 
                className="h-5 w-5 mr-1"
              />
              <span>Coinbase</span>
            </div>
            <div className="flex items-center">
              <img 
                src="https://walletconnect.com/walletconnect-logo.svg" 
                alt="WalletConnect" 
                className="h-5 w-5 mr-1"
              />
              <span>WalletConnect</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-600 max-w-md">
        <h2 className="font-semibold text-lg mb-2">Why Connect a Wallet?</h2>
        <p>
          Your wallet allows you to interact with the Ethereum blockchain to store and retrieve
          GitHub profile analysis data in a decentralized way. Your wallet address serves as your
          identity in this web3 application.
        </p>
      </div>
    </div>
  );
};

export default ConnectWallet;