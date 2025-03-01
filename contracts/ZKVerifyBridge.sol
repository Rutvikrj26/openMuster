// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IGitHubProfileScoreZK {
    function addZKProofVerification(
        string memory username,
        string memory proofType,
        string memory verificationId,
        string memory txHash
    ) external;
}

/**
 * @title ZKVerifyBridge
 * @dev Bridge between zkVerify blockchain and our application's smart contract
 * Allows verified zkVerify proofs to be recorded in our contract
 * Implements case-insensitive username handling
 */
contract ZKVerifyBridge is Ownable, Pausable {
    // Address of the GitHub Profile Score contract
    address public profileScoreContract;
    
    // Mapping of trusted zkVerify oracle addresses
    mapping(address => bool) public trustedOracles;
    
    // Events
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event ProfileContractUpdated(address indexed oldContract, address indexed newContract);
    event ProofVerificationBridged(
        string username,
        string proofType,
        string verificationId,
        string txHash,
        address oracle
    );
    
    constructor(address _profileScoreContract) {
        profileScoreContract = _profileScoreContract;
        _addOracle(msg.sender); // Add deployer as initial oracle
    }
    
    /**
     * @dev Modifier to check if sender is a trusted oracle
     */
    modifier onlyOracle() {
        require(trustedOracles[msg.sender], "Caller is not a trusted oracle");
        _;
    }
    
    /**
     * @dev Helper function to convert a string to lowercase for case-insensitive handling
     * @param str String to convert to lowercase
     * @return string Lowercase version of the string
     */
    function toLowercase(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        
        for (uint i = 0; i < bStr.length; i++) {
            // ASCII uppercase letters are in range 65-90
            if (uint8(bStr[i]) >= 65 && uint8(bStr[i]) <= 90) {
                // Convert uppercase to lowercase by adding 32
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        
        return string(bLower);
    }
    
    /**
     * @dev Add a trusted oracle address
     * @param oracle Address to add as a trusted oracle
     */
    function addOracle(address oracle) external onlyOwner {
        _addOracle(oracle);
    }
    
    /**
     * @dev Internal function to add an oracle
     */
    function _addOracle(address oracle) internal {
        require(oracle != address(0), "Invalid oracle address");
        require(!trustedOracles[oracle], "Oracle already trusted");
        trustedOracles[oracle] = true;
        emit OracleAdded(oracle);
    }
    
    /**
     * @dev Remove a trusted oracle address
     * @param oracle Address to remove from trusted oracles
     */
    function removeOracle(address oracle) external onlyOwner {
        require(trustedOracles[oracle], "Oracle is not trusted");
        trustedOracles[oracle] = false;
        emit OracleRemoved(oracle);
    }
    
    /**
     * @dev Update the profile score contract address
     * @param newContract New contract address
     */
    function updateProfileContract(address newContract) external onlyOwner {
        require(newContract != address(0), "Invalid contract address");
        address oldContract = profileScoreContract;
        profileScoreContract = newContract;
        emit ProfileContractUpdated(oldContract, newContract);
    }
    
    /**
     * @dev Pause the bridge 
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the bridge
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Bridge a zkVerify proof to our application
     * @param username GitHub username (will be normalized for case-insensitive handling)
     * @param proofType Type of proof (riscZero, noir, groth16, fflonk)
     * @param verificationId ID from zkVerify
     * @param txHash Transaction hash on zkVerify blockchain
     * @param signature Signature from zkVerify oracle (Not implemented in this version)
     */
    function bridgeProofVerification(
        string calldata username,
        string calldata proofType,
        string calldata verificationId,
        string calldata txHash,
        bytes calldata signature
    ) external onlyOracle whenNotPaused {
        // In a production version, we would verify the signature
        // For now, we simply trust the oracle based on their address
        
        // We keep the original username for display purposes in events
        // but normalize it when passing to the contract
        // The profile contract already handles normalization internally,
        // but we normalize here as well for consistency
                
        // Call the profile score contract to add the verification
        IGitHubProfileScoreZK(profileScoreContract).addZKProofVerification(
            username, // Send original username; contract handles normalization
            proofType,
            verificationId,
            txHash
        );
        
        emit ProofVerificationBridged(
            username,
            proofType,
            verificationId,
            txHash,
            msg.sender
        );
    }
    
    /**
     * @dev Normalize a GitHub username to lowercase for verification
     * @param username GitHub username to normalize
     * @return Normalized lowercase username
     */
    function normalizeUsername(string calldata username) external pure returns (string memory) {
        return toLowercase(username);
    }
    
    /**
     * @dev Compare two GitHub usernames in a case-insensitive manner
     * @param username1 First username to compare
     * @param username2 Second username to compare
     * @return Whether the usernames are equal (case-insensitive)
     */
    function compareUsernames(string calldata username1, string calldata username2) external pure returns (bool) {
        return keccak256(abi.encodePacked(toLowercase(username1))) == 
               keccak256(abi.encodePacked(toLowercase(username2)));
    }
}