// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BountyEscrow is Ownable {
    IERC20 public usdcToken;
    
    struct Bounty {
        address creator;
        uint256 prize;
        bool isDynamicPricing;
        bool isActive;
        bool isPaid;
    }
    
    mapping(uint256 => Bounty) public bounties;
    uint256 public nextBountyId;
    
    event BountyCreated(uint256 indexed bountyId, address indexed creator, uint256 prize, bool isDynamicPricing);
    event BountyPaid(uint256 indexed bountyId, address indexed recipient, uint256 amount);
    
    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
    }
    
    function createBounty(uint256 _prize, bool _isDynamicPricing) external returns (uint256) {
        uint256 stakeAmount = _isDynamicPricing ? (_prize * 125) / 100 : _prize;
        
        // Transfer USDC from creator to contract
        require(usdcToken.transferFrom(msg.sender, address(this), stakeAmount), "USDC transfer failed");
        
        uint256 bountyId = nextBountyId;
        bounties[bountyId] = Bounty({
            creator: msg.sender,
            prize: _prize,
            isDynamicPricing: _isDynamicPricing,
            isActive: true,
            isPaid: false
        });
        
        nextBountyId++;
        
        emit BountyCreated(bountyId, msg.sender, _prize, _isDynamicPricing);
        
        return bountyId;
    }
    
    function payout(uint256 _bountyId, address _recipient) external {
        Bounty storage bounty = bounties[_bountyId];
        
        require(bounty.isActive, "Bounty is not active");
        require(!bounty.isPaid, "Bounty already paid");
        require(msg.sender == bounty.creator || msg.sender == owner(), "Not authorized");
        
        bounty.isActive = false;
        bounty.isPaid = true;
        
        // Transfer prize to recipient
        require(usdcToken.transfer(_recipient, bounty.prize), "USDC transfer failed");
        
        // If dynamic pricing, return the extra stake to creator
        if (bounty.isDynamicPricing) {
            uint256 extraStake = (bounty.prize * 25) / 100;
            require(usdcToken.transfer(bounty.creator, extraStake), "USDC transfer failed");
        }
        
        emit BountyPaid(_bountyId, _recipient, bounty.prize);
    }
    
    function cancelBounty(uint256 _bountyId) external {
        Bounty storage bounty = bounties[_bountyId];
        
        require(bounty.isActive, "Bounty is not active");
        require(!bounty.isPaid, "Bounty already paid");
        require(msg.sender == bounty.creator || msg.sender == owner(), "Not authorized");
        
        bounty.isActive = false;
        
        // Return staked amount to creator
        uint256 stakeAmount = bounty.isDynamicPricing ? (bounty.prize * 125) / 100 : bounty.prize;
        require(usdcToken.transfer(bounty.creator, stakeAmount), "USDC transfer failed");
    }
    
    // Emergency function to recover any tokens accidentally sent to the contract
    function recoverToken(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}

