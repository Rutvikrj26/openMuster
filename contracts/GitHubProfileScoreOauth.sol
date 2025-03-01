// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GitHubProfileScoreOAuth
 * @dev Store and retrieve GitHub profile analysis scores with OAuth verification
 * @notice This version includes case-insensitive username handling
 */
contract GitHubProfileScoreOAuth {
    address public owner;
    address public verifierServer;
    
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
        bool includesPrivateRepos;
    }
    
    // Struct to store wallet-GitHub username association
    struct WalletGitHubAssociation {
        string username;
        bool verified;
        uint256 verificationTimestamp;
        bytes32 verificationHash;
    }
    
    // Mapping from GitHub username (hashed) to profile data
    mapping(bytes32 => ProfileData) public profileScores;
    
    // Array to store all analyzed usernames for enumeration
    bytes32[] public analyzedProfiles;
    
    // Mapping from wallet address to GitHub username association
    mapping(address => WalletGitHubAssociation) public userWallets;
    
    // Array to store all registered wallet addresses
    address[] public registeredWallets;
    
    // Events
    event ProfileScoreAdded(string username, uint8 score, address analyzedBy, bool includesPrivateRepos);
    event ProfileScoreUpdated(string username, uint8 oldScore, uint8 newScore);
    event WalletRegistered(address wallet, string username, bool verified);
    event VerifierServerChanged(address oldServer, address newServer);
    
    constructor() {
        owner = msg.sender;
        verifierServer = msg.sender; // Initially set to owner, can be changed
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyVerifier() {
        require(msg.sender == verifierServer, "Only authorized verifier can call this function");
        _;
    }
    
    /**
     * @dev Helper function to convert a string to lowercase for case-insensitive comparisons
     * @param str String to convert to lowercase
     * @return bytes Lowercase version of the string as bytes
     */
    function toLowercase(string memory str) internal pure returns (bytes memory) {
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
        
        return bLower;
    }
    
    /**
     * @dev Get a normalized hash for a username (case-insensitive)
     * @param username Username to hash
     * @return bytes32 Hash of the lowercase version of the username
     */
    function getNormalizedUsernameHash(string memory username) internal pure returns (bytes32) {
        return keccak256(toLowercase(username));
    }
    
    /**
     * @dev Set the address of the verifier server
     * @param _verifierServer Address allowed to verify GitHub associations
     */
    function setVerifierServer(address _verifierServer) external onlyOwner {
        address oldServer = verifierServer;
        verifierServer = _verifierServer;
        emit VerifierServerChanged(oldServer, _verifierServer);
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
     * @param includesPrivateRepos Whether the analysis includes private repositories
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
        bool includesPrivateRepos
    ) public {
        // If including private repos, the association must be verified
        if (includesPrivateRepos) {
            require(
                userWallets[msg.sender].verified && 
                getNormalizedUsernameHash(userWallets[msg.sender].username) == getNormalizedUsernameHash(username),
                "To include private repos, wallet must be verified for this GitHub account"
            );
        }
        
        bytes32 usernameHash = getNormalizedUsernameHash(username);
        
        ProfileData storage profile = profileScores[usernameHash];
        
        if (!profile.exists) {
            // New profile
            profile.username = username; // Store the original case for display purposes
            profile.exists = true;
            analyzedProfiles.push(usernameHash);
            
            emit ProfileScoreAdded(username, overallScore, msg.sender, includesPrivateRepos);
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
        profile.includesPrivateRepos = includesPrivateRepos;
    }
    
    /**
     * @dev Register a wallet-GitHub association (unverified)
     * @param username GitHub username to associate with the sender's wallet
     */
    function registerUserWallet(string memory username) public {
        // Check if this wallet is already registered
        WalletGitHubAssociation storage association = userWallets[msg.sender];
        
        if (bytes(association.username).length == 0) {
            // New wallet registration
            registeredWallets.push(msg.sender);
        }
        
        // Update the username for this wallet (but preserve verification if username is the same)
        bool wasVerified = association.verified;
        bool sameUsername = getNormalizedUsernameHash(association.username) == getNormalizedUsernameHash(username);
        
        // If changing username, lose verification status
        if (!sameUsername) {
            association.verified = false;
            association.verificationTimestamp = 0;
            association.verificationHash = bytes32(0);
        }
        
        association.username = username;
        
        emit WalletRegistered(msg.sender, username, association.verified);
    }
    
    /**
     * @dev Verify a wallet-GitHub association (only callable by verifier server)
     * @param wallet Wallet address to verify
     * @param username GitHub username to verify
     * @param verificationHash Hash of verification data
     */
    function verifyUserWallet(address wallet, string memory username, bytes32 verificationHash) public onlyVerifier {
        WalletGitHubAssociation storage association = userWallets[wallet];
        
        // Update or create association
        if (bytes(association.username).length == 0) {
            registeredWallets.push(wallet);
        }        
        association.username = username; // Store original case for display
        association.verified = true;
        association.verificationTimestamp = block.timestamp;
        association.verificationHash = verificationHash;
        
        emit WalletRegistered(wallet, username, true);
    }
    
    /**
     * @dev Revoke verification status of a wallet (only callable by verifier server)
     * @param wallet Wallet address to revoke verification for
     */
    function revokeVerification(address wallet) public onlyVerifier {
        WalletGitHubAssociation storage association = userWallets[wallet];
        
        // Only update if the wallet has a username
        if (bytes(association.username).length > 0) {
            association.verified = false;
            
            emit WalletRegistered(wallet, association.username, false);
        }
    }

    // Update the function documentation for getWalletGitHubInfo

    /**
     * @dev Get GitHub info for a wallet
     * @param wallet Wallet address to check
     * @return username The GitHub username associated with this wallet
     * @return verified Whether the wallet is verified for this username
     * @return verificationTimestamp When the verification occurred
     */
    function getWalletGitHubInfo(address wallet) public view returns (
        string memory username, 
        bool verified, 
        uint256 verificationTimestamp
    ) {
        WalletGitHubAssociation storage association = userWallets[wallet];
        return (
            association.username, 
            association.verified, 
            association.verificationTimestamp
        );
    }    
    /**
     * @dev Check if a wallet has a verified GitHub username
     * @param wallet Wallet address to check
     * @return bool Whether the wallet has a verified username
     */
    function hasVerifiedUsername(address wallet) public view returns (bool) {
        return userWallets[wallet].verified;
    }
    
    /**
     * @dev Check if a wallet is verified for a specific GitHub username
     * @param wallet Wallet address to check
     * @param username GitHub username to verify against
     * @return bool Whether the wallet is verified for this username
     */
    function isVerifiedForUsername(address wallet, string memory username) public view returns (bool) {
        WalletGitHubAssociation storage association = userWallets[wallet];
        return association.verified && 
            getNormalizedUsernameHash(association.username) == getNormalizedUsernameHash(username);
    }
    
    /**
     * @dev Get a GitHub profile score by username
     * @param username GitHub username
     * @return Profile data if exists, or empty profile with exists=false if not
     */
    function getProfileScore(string memory username) public view returns (ProfileData memory) {
        bytes32 usernameHash = getNormalizedUsernameHash(username);
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