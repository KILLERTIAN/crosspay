require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");

module.exports = {
  solidity: "0.8.20",
  networks: {
    pharosDevnet: {
      url: "https://devnet.dplabs-internal.com",           // Get from Pharos Docs :contentReference[oaicite:9]{index=9}
      chainId: 50002,                              // Replace with actual Pharos chain ID
      accounts: ["79dab6b62e12a25fe6423489b3d8d350056306a0962677e5a47f005dfe8b3190"],       // Your deployer key
    },
  },
};
