// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GitHubProfileScoreZK
 * @dev Store GitHub profile analysis scores with zkVerify proof verification
 */
contract GitHubProfileScoreZK {
    address public owner;
    address public verifierServer;
    address public zkVerifyBridge;
    
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
        // ZK proof fields
        bool hasZkVerification;
        mapping(string => ProofVerification) zkProofs;
    }
    
    // Struct to store ZK proof verification data
    struct ProofVerification {
        bool verified;
        string proofType;      // Type of proof (riscZero, noir, groth16, fflonk)
        uint256 verifiedAt;    // Timestamp of verification
        string verificationId; // ID from zkVerify
        string txHash;         // Transaction hash on zkVerify blockchain
    }
    
    // Public ProofVerification for returning in view functions
    struct PublicProofVerification {
        bool verified;
        string proofType;
        uint256 verifiedAt;
        string verificationId;
        string txHash;
    }
    
    // Struct for profile data returned to clients (without mappings)
    struct ProfileDataView {
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
        bool hasZkVerification;
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
    
    // Valid proof types
    string[] public validProofTypes = ["riscZero", "noir", "groth16", "fflonk"];
    
    // Events
    event ProfileScoreAdded(string username, uint8 score, address analyzedBy, bool includesPrivateRepos);
    event ProfileScoreUpdated(string username, uint8 oldScore, uint8 newScore);
    event WalletRegistered(address wallet, string username, bool verified);
    event VerifierServerChanged(address oldServer, address newServer);
    event ZKBridgeChanged(address oldBridge, address newBridge);
    event ZKProofVerified(string username, string proofType, string verificationId);
    
    constructor(address _zkVerifyBridge) {
        owner = msg.sender;
        verifierServer = msg.sender; // Initially set to owner, can be changed
        zkVerifyBridge = _zkVerifyBridge;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyVerifier() {
        require(msg.sender == verifierServer || msg.sender == zkVerifyBridge, 
                "Only authorized verifier can call this function");
        _;
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
     * @dev Set the address of the zkVerify bridge
     * @param _zkVerifyBridge Address of zkVerify bridge contract
     */
    function setZKVerifyBridge(address _zkVerifyBridge) external onlyOwner {
        address oldBridge = zkVerifyBridge;
        zkVerifyBridge = _zkVerifyBridge;
        emit ZKBridgeChanged(oldBridge, _zkVerifyBridge);
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
        // If including private repos, the association must be verified or have ZK proof
        if (includesPrivateRepos) {
            bytes32 usernameHash = keccak256(abi.encodePacked(username));
            bool isVerified = userWallets[msg.sender].verified && 
                              keccak256(abi.encodePacked(userWallets[msg.sender].username)) == 
                              keccak256(abi.encodePacked(username));
            
            bool hasZkProof = false;
            if (profileScores[usernameHash].exists) {
                hasZkProof = profileScores[usernameHash].hasZkVerification;
            }
            
            require(isVerified || hasZkProof, 
                    "To include private repos, wallet must be verified or have ZK proof");
        }
        
        bytes32 usernameHash = keccak256(abi.encodePacked(username));
        ProfileData storage profile = profileScores[usernameHash];
        
        if (!profile.exists) {
            // New profile
            profile.username = username;
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
     * @dev Add ZK proof verification to a profile
     * @param username GitHub username
     * @param proofType Type of proof (riscZero, noir, groth16, fflonk)
     * @param verificationId ID from zkVerify
     * @param txHash Transaction hash on zkVerify blockchain
     */
    function addZKProofVerification(
        string memory username,
        string memory proofType,
        string memory verificationId,
        string memory txHash
    ) external onlyVerifier {
        // Validate proof type
        bool isValidProofType = false;
        for (uint i = 0; i < validProofTypes.length; i++) {
            if (keccak256(abi.encodePacked(validProofTypes[i])) == 
                keccak256(abi.encodePacked(proofType))) {
                isValidProofType = true;
                break;
            }
        }
        require(isValidProofType, "Invalid proof type");
        
        bytes32 usernameHash = keccak256(abi.encodePacked(username));
        ProfileData storage profile = profileScores[usernameHash];
        
        require(profile.exists, "Profile does not exist");
        
        // Update proof verification data
        profile.zkProofs[proofType] = ProofVerification({
            verified: true,
            proofType: proofType,
            verifiedAt: block.timestamp,
            verificationId: verificationId,
            txHash: txHash
        });
        
        // Mark profile as having ZK verification
        profile.hasZkVerification = true;
        
        emit ZKProofVerified(username, proofType, verificationId);
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
        bool sameUsername = keccak256(abi.encodePacked(association.username)) == 
                           keccak256(abi.encodePacked(username));
        
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
    function verifyUserWallet(
        address wallet, 
        string memory username, 
        bytes32 verificationHash
    ) public onlyVerifier {
        WalletGitHubAssociation storage association = userWallets[wallet];
        
        // Update or create association
        if (bytes(association.username).length == 0) {
            registeredWallets.push(wallet);
        }
        
        association.username = username;
        association.verified = true;
        association.verificationTimestamp = block.timestamp;
        association.verificationHash = verificationHash;
        
        emit WalletRegistered(wallet, username, true);
    }
    
    /**
     * @dev Get a GitHub profile score by username
     * @param username GitHub username
     * @return Profile data if exists, or empty profile with exists=false if not
     */
    function getProfileScore(string memory username) public view returns (ProfileDataView memory) {
        bytes32 usernameHash = keccak256(abi.encodePacked(username));
        ProfileData storage profile = profileScores[usernameHash];
        
        return ProfileDataView({
            username: profile.username,
            timestamp: profile.timestamp,
            overallScore: profile.overallScore,
            profileCompleteness: profile.profileCompleteness,
            followers: profile.followers,
            repoCount: profile.repoCount,
            totalStars: profile.totalStars,
            languageDiversity: profile.languageDiversity,
            hasPopularRepos: profile.hasPopularRepos,
            recentActivity: profile.recentActivity,
            analyzedBy: profile.analyzedBy,
            exists: profile.exists,
            includesPrivateRepos: profile.includesPrivateRepos,
            hasZkVerification: profile.hasZkVerification
        });
    }
    
    /**
     * @dev Get ZK proof verification status for a specific proof type
     * @param username GitHub username
     * @param proofType Type of proof (riscZero, noir, groth16, fflonk)
     * @return Proof verification data if exists
     */
    function getZkProofVerification(
        string memory username,
        string memory proofType
    ) public view returns (PublicProofVerification memory) {
        bytes32 usernameHash = keccak256(abi.encodePacked(username));
        ProfileData storage profile = profileScores[usernameHash];
        
        require(profile.exists, "Profile does not exist");
        
        ProofVerification storage proof = profile.zkProofs[proofType];
        
        return PublicProofVerification({
            verified: proof.verified,
            proofType: proof.proofType,
            verifiedAt: proof.verifiedAt,
            verificationId: proof.verificationId,
            txHash: proof.txHash
        });
    }
    
    /**
     * @dev Get all ZK proof verifications for a profile
     * @param username GitHub username
     * @return Array of proof verifications
     */
    function getAllZkProofVerifications(
        string memory username
    ) public view returns (PublicProofVerification[] memory) {
        bytes32 usernameHash = keccak256(abi.encodePacked(username));
        ProfileData storage profile = profileScores[usernameHash];
        
        require(profile.exists, "Profile does not exist");
        require(profile.hasZkVerification, "Profile has no ZK verifications");
        
        // Count verified proofs
        uint count = 0;
        for (uint i = 0; i < validProofTypes.length; i++) {
            if (profile.zkProofs[validProofTypes[i]].verified) {
                count++;
            }
        }
        
        // Create array of verified proofs
        PublicProofVerification[] memory verifications = new PublicProofVerification[](count);
        uint index = 0;
        
        for (uint i = 0; i < validProofTypes.length; i++) {
            string memory proofType = validProofTypes[i];
            ProofVerification storage proof = profile.zkProofs[proofType];
            
            if (proof.verified) {
                verifications[index] = PublicProofVerification({
                    verified: proof.verified,
                    proofType: proof.proofType,
                    verifiedAt: proof.verifiedAt,
                    verificationId: proof.verificationId,
                    txHash: proof.txHash
                });
                index++;
            }
        }
        
        return verifications;
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
     * @dev Get the GitHub username associated with a wallet
     * @param wallet Wallet address to look up
     * @return GitHub username and verification status
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
     * @dev Get a batch of profile data (for pagination)
     * @param startIndex Start index in the analyzedProfiles array
     * @param count Number of profiles to return
     * @return Array of ProfileDataView structs
     */
    function getProfiles(
        uint256 startIndex, 
        uint256 count
    ) public view returns (ProfileDataView[] memory) {
        // Make sure we don't exceed array bounds
        uint256 endIndex = startIndex + count;
        if (endIndex > analyzedProfiles.length) {
            endIndex = analyzedProfiles.length;
        }
        
        // Calculate actual count after bounds check
        uint256 actualCount = endIndex - startIndex;
        
        ProfileDataView[] memory result = new ProfileDataView[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            bytes32 usernameHash = analyzedProfiles[startIndex + i];
            ProfileData storage profile = profileScores[usernameHash];
            
            result[i] = ProfileDataView({
                username: profile.username,
                timestamp: profile.timestamp,
                overallScore: profile.overallScore,
                profileCompleteness: profile.profileCompleteness,
                followers: profile.followers,
                repoCount: profile.repoCount,
                totalStars: profile.totalStars,
                languageDiversity: profile.languageDiversity,
                hasPopularRepos: profile.hasPopularRepos,
                recentActivity: profile.recentActivity,
                analyzedBy: profile.analyzedBy,
                exists: profile.exists,
                includesPrivateRepos: profile.includesPrivateRepos,
                hasZkVerification: profile.hasZkVerification
            });
        }
        
        return result;
    }
}