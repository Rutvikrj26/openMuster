// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IGitHubProfileScoreZK {
    function getProfileScore(string memory username) external view returns (
        uint256 timestamp,
        uint8 overallScore,
        uint8 profileCompleteness,
        uint16 followers,
        uint8 repoCount,
        uint16 totalStars,
        uint8 languageDiversity,
        bool hasPopularRepos,
        uint8 recentActivity,
        address analyzedBy,
        bool exists,
        bool includesPrivateRepos,
        bool hasZkVerification
    );
    
    function isVerifiedForUsername(address wallet, string memory username) external view returns (bool);
}

/**
 * @title OpenSourceBounty
 * @dev Manages bounties for GitHub issues tied to open source projects
 */
contract OpenSourceBounty is Ownable, ReentrancyGuard {
    // Profile score contract used for verification and scoring
    IGitHubProfileScoreZK public profileScoreContract;
    
    // Token used for payments
    IERC20 public paymentToken;
    
    // Structs
    struct Project {
        uint256 id;
        address owner;
        string name;
        string description;
        string website;
        string githubUrl;
        string repoName;
        uint256 repoId;
        uint256 timestamp;
        bool exists;
    }
    
    struct Bounty {
        uint256 id;
        uint256 projectId;
        uint256 issueId;
        uint256 issueNumber;
        string issueTitle;
        string issueUrl;
        uint256 amount;
        string difficultyLevel; // "easy", "medium", "hard", "expert"
        address assignee;
        address payoutAddress;
        BountyStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    enum BountyStatus { OPEN, ASSIGNED, SUBMITTED, COMPLETED, CANCELLED }
    
    // Events
    event ProjectRegistered(uint256 indexed projectId, address indexed owner, string name, string repoName);
    event BountyCreated(uint256 indexed bountyId, uint256 indexed projectId, uint256 issueNumber, uint256 amount);
    event BountyAssigned(uint256 indexed bountyId, address indexed assignee, string githubUsername);
    event BountySubmitted(uint256 indexed bountyId, string pullRequestUrl);
    event BountyCompleted(uint256 indexed bountyId, address indexed recipient, uint256 amount);
    event BountyCancelled(uint256 indexed bountyId);
    
    // State variables
    uint256 private nextProjectId = 1;
    uint256 private nextBountyId = 1;
    
    // Mappings
    mapping(uint256 => Project) public projects;
    mapping(address => uint256[]) public projectsByOwner;
    mapping(string => uint256) public projectsByRepoId;
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => uint256[]) public bountiesByProject;
    mapping(address => uint256[]) public bountiesByContributor;
    
    // Submission details
    struct Submission {
        string pullRequestUrl;
        uint256 submittedAt;
        string githubUsername;
    }
    
    mapping(uint256 => Submission) public submissions;
    
    /**
     * @dev Constructor to set the profile score contract and payment token addresses
     */
    constructor(address _profileScoreContract, address _paymentToken) {
        profileScoreContract = IGitHubProfileScoreZK(_profileScoreContract);
        paymentToken = IERC20(_paymentToken);
    }
    
    /**
     * @dev Update the profile score contract address
     * @param _profileScoreContract New contract address
     */
    function setProfileScoreContract(address _profileScoreContract) external onlyOwner {
        require(_profileScoreContract != address(0), "Invalid address");
        profileScoreContract = IGitHubProfileScoreZK(_profileScoreContract);
    }
    
    /**
     * @dev Update the payment token address
     * @param _paymentToken New token address
     */
    function setPaymentToken(address _paymentToken) external onlyOwner {
        require(_paymentToken != address(0), "Invalid address");
        paymentToken = IERC20(_paymentToken);
    }
    
    /**
     * @dev Register a new open source project
     * @param name Project name
     * @param description Project description
     * @param website Project website
     * @param githubUrl GitHub repository URL
     * @param repoName Repository name on GitHub
     * @param repoId Repository ID on GitHub
     * @return Project ID
     */
    function registerProject(
        string calldata name,
        string calldata description,
        string calldata website,
        string calldata githubUrl,
        string calldata repoName,
        uint256 repoId
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name is required");
        require(bytes(githubUrl).length > 0, "GitHub URL is required");
        require(bytes(repoName).length > 0, "Repository name is required");
        require(repoId > 0, "Repository ID is required");
        require(projectsByRepoId[repoName] == 0, "Repository already registered");
        
        uint256 projectId = nextProjectId++;
        
        projects[projectId] = Project({
            id: projectId,
            owner: msg.sender,
            name: name,
            description: description,
            website: website,
            githubUrl: githubUrl,
            repoName: repoName,
            repoId: repoId,
            timestamp: block.timestamp,
            exists: true
        });
        
        projectsByOwner[msg.sender].push(projectId);
        projectsByRepoId[repoName] = projectId;
        
        emit ProjectRegistered(projectId, msg.sender, name, repoName);
        
        return projectId;
    }
    
    /**
     * @dev Create a bounty for a GitHub issue
     * @param projectId Project ID
     * @param issueId Issue ID from GitHub
     * @param issueNumber Issue number on GitHub
     * @param issueTitle Issue title
     * @param issueUrl Issue URL
     * @param amount Bounty amount in tokens
     * @param difficultyLevel Difficulty level: "easy", "medium", "hard", or "expert"
     * @return Bounty ID
     */
    function createBounty(
        uint256 projectId,
        uint256 issueId,
        uint256 issueNumber,
        string calldata issueTitle,
        string calldata issueUrl,
        uint256 amount,
        string calldata difficultyLevel
    ) external returns (uint256) {
        require(projects[projectId].exists, "Project does not exist");
        require(projects[projectId].owner == msg.sender, "Only project owner can create bounties");
        require(amount > 0, "Bounty amount must be greater than 0");
        require(
            keccak256(bytes(difficultyLevel)) == keccak256(bytes("easy")) ||
            keccak256(bytes(difficultyLevel)) == keccak256(bytes("medium")) ||
            keccak256(bytes(difficultyLevel)) == keccak256(bytes("hard")) ||
            keccak256(bytes(difficultyLevel)) == keccak256(bytes("expert")),
            "Invalid difficulty level"
        );

        // Transfer tokens from creator to contract
        // require(
        //     paymentToken.transferFrom(msg.sender, address(this), amount),
        //     "Token transfer failed"
        // );
        
        uint256 bountyId = nextBountyId++;
        
        bounties[bountyId] = Bounty({
            id: bountyId,
            projectId: projectId,
            issueId: issueId,
            issueNumber: issueNumber,
            issueTitle: issueTitle,
            issueUrl: issueUrl,
            amount: amount,
            difficultyLevel: difficultyLevel,
            assignee: address(0),
            payoutAddress: address(0),
            status: BountyStatus.OPEN,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        bountyByProjectAndIssue[projectId][issueId] = bountyId;

        bountiesByProject[projectId].push(bountyId);
        
        emit BountyCreated(bountyId, projectId, issueNumber, amount);
        
        return bountyId;
    }
    
    /**
     * @dev Apply for a bounty
     * @param bountyId Bounty ID
     * @param githubUsername GitHub username of the applicant
     */
    function applyForBounty(uint256 bountyId, string calldata githubUsername) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        
        require(bounty.id > 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.OPEN, "Bounty is not open");
        
        // Verify the user's GitHub username
        require(
            profileScoreContract.isVerifiedForUsername(msg.sender, githubUsername),
            "GitHub username not verified for this wallet"
        );
        
        // Update bounty status
        bounty.status = BountyStatus.ASSIGNED;
        bounty.assignee = msg.sender;
        bounty.payoutAddress = msg.sender;
        bounty.updatedAt = block.timestamp;
        
        // Add to contributor's bounty list
        bountiesByContributor[msg.sender].push(bountyId);
        
        emit BountyAssigned(bountyId, msg.sender, githubUsername);
    }
    
    /**
     * @dev Submit work for a bounty
     * @param bountyId Bounty ID
     * @param pullRequestUrl URL of the pull request
     * @param githubUsername GitHub username of the submitter
     */
    function submitWork(
        uint256 bountyId, 
        string calldata pullRequestUrl, 
        string calldata githubUsername
    ) external {
        Bounty storage bounty = bounties[bountyId];
        
        require(bounty.id > 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.ASSIGNED, "Bounty is not assigned");
        require(bounty.assignee == msg.sender, "Only assignee can submit work");
        
        // Verify the user's GitHub username
        require(
            profileScoreContract.isVerifiedForUsername(msg.sender, githubUsername),
            "GitHub username not verified for this wallet"
        );
        
        // Update bounty status
        bounty.status = BountyStatus.SUBMITTED;
        bounty.updatedAt = block.timestamp;
        
        // Store submission details
        submissions[bountyId] = Submission({
            pullRequestUrl: pullRequestUrl,
            submittedAt: block.timestamp,
            githubUsername: githubUsername
        });
        
        emit BountySubmitted(bountyId, pullRequestUrl);
    }
    
    /**
     * @dev Complete a bounty and pay the contributor
     * @param bountyId Bounty ID
     */
    function completeBounty(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        
        require(bounty.id > 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.SUBMITTED, "Bounty is not submitted");
        require(projects[bounty.projectId].owner == msg.sender, "Only project owner can complete bounties");
        
        Submission memory submission = submissions[bountyId];
        
        // Get the contributor's GitHub profile score
        (uint256 timestamp, uint8 overallScore, , , , , , , , , , , ) = profileScoreContract.getProfileScore(submission.githubUsername);
        
        // Calculate payment based on score
        uint256 paymentAmount = calculatePaymentAmount(bounty.amount, overallScore);
        
        // Update bounty status
        bounty.status = BountyStatus.COMPLETED;
        bounty.updatedAt = block.timestamp;
        
        // Transfer tokens to contributor
        require(
            paymentToken.transfer(bounty.payoutAddress, paymentAmount),
            "Token transfer failed"
        );
        
        // If there's any difference, return it to the project owner
        if (paymentAmount < bounty.amount) {
            uint256 refundAmount = bounty.amount - paymentAmount;
            require(
                paymentToken.transfer(projects[bounty.projectId].owner, refundAmount),
                "Refund transfer failed"
            );
        }
        
        emit BountyCompleted(bountyId, bounty.payoutAddress, paymentAmount);
    }
    
    /**
     * @dev Calculate payment amount based on contributor's profile score
     * @param baseAmount Base bounty amount
     * @param score Contributor's GitHub profile score (0-100)
     * @return Payment amount
     */
    function calculatePaymentAmount(uint256 baseAmount, uint8 score) public pure returns (uint256) {
        if (score >= 80) {
            return baseAmount; // 100%
        } else if (score >= 60) {
            return (baseAmount * 60) / 100; // 60%
        } else if (score >= 40) {
            return (baseAmount * 40) / 100; // 40%
        } else if (score >= 20) {
            return (baseAmount * 20) / 100; // 20%
        } else {
            return (baseAmount * 10) / 100; // 10%
        }
    }
    
    /**
     * @dev Cancel a bounty
     * @param bountyId Bounty ID
     */
    function cancelBounty(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        
        require(bounty.id > 0, "Bounty does not exist");
        require(
            bounty.status == BountyStatus.OPEN || bounty.status == BountyStatus.ASSIGNED,
            "Bounty cannot be cancelled"
        );
        require(projects[bounty.projectId].owner == msg.sender, "Only project owner can cancel bounties");
        
        // Update bounty status
        bounty.status = BountyStatus.CANCELLED;
        bounty.updatedAt = block.timestamp;
        
        // Return tokens to project owner
        require(
            paymentToken.transfer(projects[bounty.projectId].owner, bounty.amount),
            "Token transfer failed"
        );
        
        emit BountyCancelled(bountyId);
    }
    
    /**
     * @dev Get all bounties for a project
     * @param projectId Project ID
     * @return Array of bounty IDs
     */
    function getProjectBounties(uint256 projectId) external view returns (uint256[] memory) {
        return bountiesByProject[projectId];
    }
    
    /**
     * @dev Get all bounties assigned to a contributor
     * @param contributor Contributor address
     * @return Array of bounty IDs
     */
    function getContributorBounties(address contributor) external view returns (uint256[] memory) {
        return bountiesByContributor[contributor];
    }
    
    /**
     * @dev Get all open bounties
     * @return Array of bounty structures
     */
    function getAllOpenBounties() external view returns (Bounty[] memory) {
        uint256 count = 0;
        
        // Count open bounties
        for (uint256 i = 1; i < nextBountyId; i++) {
            if (bounties[i].status == BountyStatus.OPEN) {
                count++;
            }
        }
        
        // Create array of open bounties
        Bounty[] memory openBounties = new Bounty[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextBountyId; i++) {
            if (bounties[i].status == BountyStatus.OPEN) {
                openBounties[index] = bounties[i];
                index++;
            }
        }
        
        return openBounties;
    }
    
    /**
     * @dev Get all projects owned by an address
     * @param owner Project owner address
     * @return Array of project IDs
     */
    function getOwnerProjects(address owner) external view returns (uint256[] memory) {
        return projectsByOwner[owner];
    }
    
    /**
     * @dev Update payout address for a bounty
     * @param bountyId Bounty ID
     * @param payoutAddress New payout address
     */
    function updatePayoutAddress(uint256 bountyId, address payoutAddress) external {
        Bounty storage bounty = bounties[bountyId];
        
        require(bounty.id > 0, "Bounty does not exist");
        require(bounty.assignee == msg.sender, "Only assignee can update payout address");
        require(payoutAddress != address(0), "Invalid payout address");
        
        bounty.payoutAddress = payoutAddress;
    }

    // Add this mapping to lookup bounties by project and issue IDs
    mapping(uint256 => mapping(uint256 => uint256)) private bountyByProjectAndIssue; // projectId => issueId => bountyId

    function getBountyByProjectAndIssue(uint256 projectId, uint256 issueId) external view returns (
        uint256 id,
        uint256 bountyProjectId,
        uint256 bountyIssueId,
        uint256 issueNumber,
        string memory issueTitle,
        string memory issueUrl,
        uint256 amount,
        string memory difficultyLevel,
        address assignee,
        address payoutAddress,
        BountyStatus status,
        uint256 createdAt,
        uint256 updatedAt,
        bool exists
    ) {
        uint256 bountyId = bountyByProjectAndIssue[projectId][issueId];
        Bounty storage bounty = bounties[bountyId];
        
        return (
            bounty.id,
            bounty.projectId,
            bounty.issueId,
            bounty.issueNumber,
            bounty.issueTitle,
            bounty.issueUrl,
            bounty.amount,
            bounty.difficultyLevel,
            bounty.assignee,
            bounty.payoutAddress,
            bounty.status,
            bounty.createdAt,
            bounty.updatedAt,
            bounty.id > 0
        );
    }

    function getProject(uint256 projectId) external view returns (
        uint256 id,
        address owner,
        string memory name,
        string memory description,
        string memory website,
        string memory githubUrl,
        string memory repoName,
        uint256 repoId,
        uint256 timestamp,
        bool exists
    ) {
        Project storage project = projects[projectId];
        
        return (
            project.id,
            project.owner,
            project.name,
            project.description,
            project.website,
            project.githubUrl,
            project.repoName,
            project.repoId,
            project.timestamp,
            project.exists
        );
    }

    /**
     * @dev Get active bounties for a contributor
     * @param contributor Contributor address
     * @return Array of active bounties
     */
    function getContributorActiveBounties(address contributor) external view returns (Bounty[] memory) {
        uint256[] memory contributorBountyIds = bountiesByContributor[contributor];
        uint256 activeCount = 0;
        
        // Count active bounties
        for (uint256 i = 0; i < contributorBountyIds.length; i++) {
            Bounty storage bounty = bounties[contributorBountyIds[i]];
            if (bounty.status == BountyStatus.ASSIGNED) {
                activeCount++;
            }
        }
        
        // Create and populate array
        Bounty[] memory activeBounties = new Bounty[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < contributorBountyIds.length; i++) {
            Bounty storage bounty = bounties[contributorBountyIds[i]];
            if (bounty.status == BountyStatus.ASSIGNED) {
                activeBounties[index] = bounty;
                index++;
            }
        }
        
        return activeBounties;
    }

    /**
     * @dev Get completed bounties for a contributor
     * @param contributor Contributor address
     * @return Array of completed bounties
     */
    function getContributorCompletedBounties(address contributor) external view returns (Bounty[] memory) {
        uint256[] memory contributorBountyIds = bountiesByContributor[contributor];
        uint256 completedCount = 0;
        
        // Count completed bounties
        for (uint256 i = 0; i < contributorBountyIds.length; i++) {
            Bounty storage bounty = bounties[contributorBountyIds[i]];
            if (bounty.status == BountyStatus.COMPLETED) {
                completedCount++;
            }
        }
        
        // Create and populate array
        Bounty[] memory completedBounties = new Bounty[](completedCount);
        uint256 index = 0;
        for (uint256 i = 0; i < contributorBountyIds.length; i++) {
            Bounty storage bounty = bounties[contributorBountyIds[i]];
            if (bounty.status == BountyStatus.COMPLETED) {
                completedBounties[index] = bounty;
                index++;
            }
        }
        
        return completedBounties;
    }    
}