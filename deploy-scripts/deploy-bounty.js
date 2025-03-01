const { ethers, network, run } = require("hardhat");

async function main() {
  // Get network details
  const networkName = network.name;
  console.log(`Deploying to ${networkName} network...`);

  // Contract dependencies
  // These should be replaced with actual addresses or deployed first
  let profileScoreContractAddress = process.env.PROFILE_SCORE_CONTRACT_ADDRESS;
  let paymentTokenAddress = process.env.PAYMENT_TOKEN_ADDRESS;

  // If we're on a development network and no addresses are provided, deploy mock contracts
  if ((networkName === "localhost" || networkName === "hardhat") && 
      (!profileScoreContractAddress || !paymentTokenAddress)) {
    console.log("Deploying mock contracts for local development...");
    
    // Deploy a mock ERC20 token if not provided
    if (!paymentTokenAddress) {
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const mockToken = await MockERC20.deploy("Mock Token", "MOCK", ethers.utils.parseEther("1000000"));
      await mockToken.deployed();
      paymentTokenAddress = mockToken.address;
      console.log(`Mock ERC20 token deployed to: ${paymentTokenAddress}`);
    }
    
    // Deploy a mock profile score contract if not provided
    if (!profileScoreContractAddress) {
      const MockProfileScore = await ethers.getContractFactory("MockGitHubProfileScoreZK");
      const mockProfileScore = await MockProfileScore.deploy();
      await mockProfileScore.deployed();
      profileScoreContractAddress = mockProfileScore.address;
      console.log(`Mock Profile Score contract deployed to: ${profileScoreContractAddress}`);
    }
  }

  // Validate required addresses
  if (!profileScoreContractAddress) {
    throw new Error("Profile Score contract address is required. Set PROFILE_SCORE_CONTRACT_ADDRESS env variable.");
  }
  
  if (!paymentTokenAddress) {
    throw new Error("Payment Token address is required. Set PAYMENT_TOKEN_ADDRESS env variable.");
  }

  // Deploy the OpenSourceBounty contract
  const OpenSourceBounty = await ethers.getContractFactory("OpenSourceBounty");
  
  console.log("Deploying OpenSourceBounty contract...");
  console.log(`- Profile Score Contract: ${profileScoreContractAddress}`);
  console.log(`- Payment Token: ${paymentTokenAddress}`);
  
  const bountyContract = await OpenSourceBounty.deploy(
    profileScoreContractAddress,
    paymentTokenAddress
  );

  await bountyContract.deployed();
  
  console.log(`OpenSourceBounty contract deployed to: ${bountyContract.address}`);

  // Wait for a few block confirmations to ensure the contract is properly deployed
  console.log("Waiting for block confirmations...");
  await bountyContract.deployTransaction.wait(5); // Wait for 5 blocks

  // Verify contract on Etherscan if we're on a supported network
  // Only verify on real networks, not localhost or hardhat
  if (networkName !== "localhost" && networkName !== "hardhat") {
    console.log("Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: bountyContract.address,
        constructorArguments: [
          profileScoreContractAddress,
          paymentTokenAddress,
        ],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }

  // Save the contract addresses to a file for future reference
  const fs = require("fs");
  const deploymentInfo = {
    network: networkName,
    bountyContract: bountyContract.address,
    profileScoreContract: profileScoreContractAddress,
    paymentToken: paymentTokenAddress,
    deploymentTime: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment information saved to deployment-info.json");

  return bountyContract;
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });