// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GitHubProfileScore
 * @dev Store and retrieve GitHub profile analysis scores on-chain
 */
contract GitHubProfileScore {
    address public owner;
    
    // Struct to store GitHub profile scores and essential metadata
    struct ProfileData {
        string username;
        uint256 timestamp;
        uint8 overallScore;
        uint8 profileCompleteness;
        uint16 followers;
        uint8 repoCount;
        uint16 totalStars;
        uint8 languageDiversity;
        bool hasPopularRepos;
        uint8 recentActivity;
        address analyzedBy;
        bool exists;
    }
    
    // Mapping from GitHub username (hashed) to profile data
    mapping(bytes32 => ProfileData) public profileScores;
    
    // Array to store all analyzed usernames for enumeration
    bytes32[] public analyzedProfiles;
    
    // NEW: Mapping from wallet address to GitHub username
    mapping(address => string) public userWallets;
    
    // NEW: Array to store all registered wallet addresses
    address[] public registeredWallets;
    
    // Events
    event ProfileScoreAdded(string username, uint8 score, address analyzedBy);
    event ProfileScoreUpdated(string username, uint8 oldScore, uint8 newScore);
    
    // NEW: Event for wallet registration
    event WalletRegistered(address wallet, string username);
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Add or update a GitHub profile score
     * @param username GitHub username
     * @param overallScore Overall score from 0-100
     * @param profileCompleteness Profile completeness score 0-100
     * @param followers Number of followers (max 65535)
     * @param repoCount Number of repositories (max 255)
     * @param totalStars Total stars across repositories (max 65535)
     * @param languageDiversity Number of languages used (max 255)
     * @param hasPopularRepos Whether user has popular repos
     * @param recentActivity Recent activity score 0-100
     * @param registerWallet Whether to register this wallet with the username
     */
    function addProfileScore(
        string memory username,
        uint8 overallScore,
        uint8 profileCompleteness,
        uint16 followers,
        uint8 repoCount,
        uint16 totalStars,
        uint8 languageDiversity,
        bool hasPopularRepos,
        uint8 recentActivity,
        bool registerWallet
    ) public {
        bytes32 usernameHash = keccak256(abi.encodePacked(username));
        
        ProfileData storage profile = profileScores[usernameHash];
        
        if (!profile.exists) {
            // New profile
            profile.username = username;
            profile.exists = true;
            analyzedProfiles.push(usernameHash);
            
            emit ProfileScoreAdded(username, overallScore, msg.sender);
        } else {
            // Update existing profile
            emit ProfileScoreUpdated(username, profile.overallScore, overallScore);
        }
        
        // Update profile data
        profile.timestamp = block.timestamp;
        profile.overallScore = overallScore;
        profile.profileCompleteness = profileCompleteness;
        profile.followers = followers;
        profile.repoCount = repoCount;
        profile.totalStars = totalStars;
        profile.languageDiversity = languageDiversity;
        profile.hasPopularRepos = hasPopularRepos;
        profile.recentActivity = recentActivity;
        profile.analyzedBy = msg.sender;
        
        // Register wallet if requested
        if (registerWallet) {
            registerUserWallet(username);
        }
    }
    
    /**
     * @dev Register a wallet address with a GitHub username
     * @param username GitHub username to associate with the sender's wallet
     */
    function registerUserWallet(string memory username) public {
        // Check if this wallet is already registered
        bytes memory currentUsername = bytes(userWallets[msg.sender]);
        
        if (currentUsername.length == 0) {
            // New wallet registration
            registeredWallets.push(msg.sender);
        }
        
        // Update the username for this wallet
        userWallets[msg.sender] = username;
        
        emit WalletRegistered(msg.sender, username);
    }
    
    /**
     * @dev Get the GitHub username associated with a wallet
     * @param wallet Wallet address to look up
     * @return GitHub username associated with the wallet, or empty string if none
     */
    function getWalletUsername(address wallet) public view returns (string memory) {
        return userWallets[wallet];
    }
    
    /**
     * @dev Check if a wallet has a registered GitHub username
     * @param wallet Wallet address to check
     * @return bool Whether the wallet has a registered username
     */
    function hasRegisteredUsername(address wallet) public view returns (bool) {
        return bytes(userWallets[wallet]).length > 0;
    }
    
    /**
     * @dev Get a GitHub profile score by username
     * @param username GitHub username
     * @return Profile data if exists, or empty profile with exists=false if not
     */
    function getProfileScore(string memory username) public view returns (ProfileData memory) {
        bytes32 usernameHash = keccak256(abi.encodePacked(username));
        return profileScores[usernameHash];
    }
    
    /**
     * @dev Get the count of analyzed profiles
     * @return Number of profiles analyzed
     */
    function getProfileCount() public view returns (uint256) {
        return analyzedProfiles.length;
    }
    
    /**
     * @dev Get the count of registered wallets
     * @return Number of wallets registered
     */
    function getRegisteredWalletCount() public view returns (uint256) {
        return registeredWallets.length;
    }
    
    /**
     * @dev Get a batch of profile data (for pagination)
     * @param startIndex Start index in the analyzedProfiles array
     * @param count Number of profiles to return
     * @return Array of ProfileData structs
     */
    function getProfiles(uint256 startIndex, uint256 count) public view returns (ProfileData[] memory) {
        // Make sure we don't exceed array bounds
        uint256 endIndex = startIndex + count;
        if (endIndex > analyzedProfiles.length) {
            endIndex = analyzedProfiles.length;
        }
        
        // Calculate actual count after bounds check
        uint256 actualCount = endIndex - startIndex;
        
        ProfileData[] memory result = new ProfileData[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            bytes32 usernameHash = analyzedProfiles[startIndex + i];
            result[i] = profileScores[usernameHash];
        }
        
        return result;
    }
}