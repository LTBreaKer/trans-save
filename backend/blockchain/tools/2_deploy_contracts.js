const TournamentContract = artifacts.require("TournamentContract");

module.exports = function(deployer) {
  deployer.deploy(TournamentContract);
};