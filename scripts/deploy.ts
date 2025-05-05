const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying as:", deployer.address);

  const CrossPay = await ethers.getContractFactory("CrossPay");
  const instance = await upgrades.deployProxy(
    CrossPay,
    [deployer.address],            // initialize(admin)
    { initializer: "initialize", kind: "uups" }
  );
  await instance.deployed();
  console.log("CrossPay proxy at:", instance.address);
}

main().catch(console.error);
