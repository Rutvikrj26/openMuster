// ABI for the GitHubProfileScore contract with wallet registration support
export const CONTRACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "username",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "score",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "analyzedBy",
          "type": "address"
        }
      ],
      "name": "ProfileScoreAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "username",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "oldScore",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "newScore",
          "type": "uint8"
        }
      ],
      "name": "ProfileScoreUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "username",
          "type": "string"
        }
      ],
      "name": "WalletRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "username",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "overallScore",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "profileCompleteness",
          "type": "uint8"
        },
        {
          "internalType": "uint16",
          "name": "followers",
          "type": "uint16"
        },
        {
          "internalType": "uint8",
          "name": "repoCount",
          "type": "uint8"
        },
        {
          "internalType": "uint16",
          "name": "totalStars",
          "type": "uint16"
        },
        {
          "internalType": "uint8",
          "name": "languageDiversity",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "hasPopularRepos",
          "type": "bool"
        },
        {
          "internalType": "uint8",
          "name": "recentActivity",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "registerWallet",
          "type": "bool"
        }
      ],
      "name": "addProfileScore",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "analyzedProfiles",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getProfileCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "username",
          "type": "string"
        }
      ],
      "name": "getProfileScore",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "username",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "overallScore",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "profileCompleteness",
              "type": "uint8"
            },
            {
              "internalType": "uint16",
              "name": "followers",
              "type": "uint16"
            },
            {
              "internalType": "uint8",
              "name": "repoCount",
              "type": "uint8"
            },
            {
              "internalType": "uint16",
              "name": "totalStars",
              "type": "uint16"
            },
            {
              "internalType": "uint8",
              "name": "languageDiversity",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "hasPopularRepos",
              "type": "bool"
            },
            {
              "internalType": "uint8",
              "name": "recentActivity",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "analyzedBy",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "exists",
              "type": "bool"
            }
          ],
          "internalType": "struct GitHubProfileScore.ProfileData",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "startIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "name": "getProfiles",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "username",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "overallScore",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "profileCompleteness",
              "type": "uint8"
            },
            {
              "internalType": "uint16",
              "name": "followers",
              "type": "uint16"
            },
            {
              "internalType": "uint8",
              "name": "repoCount",
              "type": "uint8"
            },
            {
              "internalType": "uint16",
              "name": "totalStars",
              "type": "uint16"
            },
            {
              "internalType": "uint8",
              "name": "languageDiversity",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "hasPopularRepos",
              "type": "bool"
            },
            {
              "internalType": "uint8",
              "name": "recentActivity",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "analyzedBy",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "exists",
              "type": "bool"
            }
          ],
          "internalType": "struct GitHubProfileScore.ProfileData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRegisteredWalletCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        }
      ],
      "name": "getWalletUsername",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        }
      ],
      "name": "hasRegisteredUsername",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "profileScores",
      "outputs": [
        {
          "internalType": "string",
          "name": "username",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "overallScore",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "profileCompleteness",
          "type": "uint8"
        },
        {
          "internalType": "uint16",
          "name": "followers",
          "type": "uint16"
        },
        {
          "internalType": "uint8",
          "name": "repoCount",
          "type": "uint8"
        },
        {
          "internalType": "uint16",
          "name": "totalStars",
          "type": "uint16"
        },
        {
          "internalType": "uint8",
          "name": "languageDiversity",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "hasPopularRepos",
          "type": "bool"
        },
        {
          "internalType": "uint8",
          "name": "recentActivity",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "analyzedBy",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "registeredWallets",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "username",
          "type": "string"
        }
      ],
      "name": "registerUserWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "userWallets",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];