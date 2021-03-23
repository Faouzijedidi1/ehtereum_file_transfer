var File = artifacts.require("./contracts/File.sol");

module.exports = function(deployer) {
  deployer.deploy(File);
};
