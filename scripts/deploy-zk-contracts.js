const hre = require("hardhat");

async function main() {
  console.log("Deploying GitHub Profile Score ZK contracts...");

  // Deploy ZKVerifyBridge first
  const ZKVerifyBridge = await hre.ethers.getContractFactory("ZKVerifyBridge");
  
  // Deploy with a temporary address that will be updated after GitHubProfileScoreZK is deployed
  const temporaryAddress = "0x0000000000000000000000000000000000000001";
  const bridge = await ZKVerifyBridge.deploy(temporaryAddress);

  // Wait for the bridge to be deployed
  await bridge.deployed();
  console.log(`ZKVerifyBridge deployed to: ${bridge.address}`);
  
  // Now deploy GitHubProfileScoreZK with the bridge address
  const GitHubProfileScoreZK = await hre.ethers.getContractFactory("GitHubProfileScoreZK");
  const profileScore = await GitHubProfileScoreZK.deploy(bridge.address);
  
  // Wait for the profile score contract to be deployed
  await profileScore.deployed();
  console.log(`GitHubProfileScoreZK deployed to: ${profileScore.address}`);
  
  // Update the bridge's profile score contract address
  console.log("Updating ZKVerifyBridge with the correct profile score contract address...");
  const updateTx = await bridge.updateProfileContract(profileScore.address);
  await updateTx.wait();
  console.log("ZKVerifyBridge updated successfully!");
  
  // Wait for 5 block confirmations for both contracts
  console.log("Wait for 5 block confirmations...");
  await bridge.deployTransaction.wait(5);
  await profileScore.deployTransaction.wait(5);
  console.log("Contract deployments confirmed!");
  
  // Verify the contracts on Basescan (if API key is set)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contracts on Basescan...");
    
    try {
      // Verify ZKVerifyBridge
      await hre.run("verify:verify", {
        address: bridge.address,
        constructorArguments: [temporaryAddress],
      });
      console.log("ZKVerifyBridge verified on Basescan!");
      
      // Verify GitHubProfileScoreZK
      await hre.run("verify:verify", {
        address: profileScore.address,
        constructorArguments: [bridge.address],
      });
      console.log("GitHubProfileScoreZK verified on Basescan!");
    } catch (e) {
      console.log("Verification error:", e);
    }
  }

  // Save the contract addresses to a file for frontend use
  const fs = require("fs");
  fs.writeFileSync(
    "./.env.local",
    `REACT_APP_ZK_CONTRACT_ADDRESS=${profileScore.address}\n` +
    `REACT_APP_ZK_BRIDGE_ADDRESS=${bridge.address}\n`,
    { flag: "a" }
  );
  
  console.log("Contract addresses saved to .env.local file!");
  
  // Log summary
  console.log("\nDeployment Summary:");
  console.log("-----------------");
  console.log(`ZKVerifyBridge: ${bridge.address}`);
  console.log(`GitHubProfileScoreZK: ${profileScore.address}`);
  console.log("\nDon't forget to update your frontend configuration with these addresses.");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });