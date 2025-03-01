const hre = require("hardhat");

async function main() {
  console.log("Deploying GitHubProfileScore contract...");

  // Get the contract factory
  const GitHubProfileScore = await hre.ethers.getContractFactory("GitHubProfileScore");
  
  // Deploy the contract
  const profileScore = await GitHubProfileScore.deploy();

  // Wait for the contract to be deployed
  await profileScore.deployed();

  console.log(`GitHubProfileScore deployed to: ${profileScore.address}`);
  console.log("Transaction hash:", profileScore.deployTransaction.hash);
  
  // For verification later
  console.log("Wait for 5 block confirmations...");
  await profileScore.deployTransaction.wait(5);
  console.log("Contract deployment confirmed!");
  
  // Verify the contract on Basescan (if API key is set)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: profileScore.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Basescan!");
    } catch (e) {
      console.log("Verification error:", e);
    }
  }

  // Save the contract address to a file for frontend use
  const fs = require("fs");
  fs.writeFileSync(
    "./.env.local",
    `REACT_APP_CONTRACT_ADDRESS=${profileScore.address}\n`,
    { flag: "a" }
  );
  
  console.log("Contract address saved to .env.local file!");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });