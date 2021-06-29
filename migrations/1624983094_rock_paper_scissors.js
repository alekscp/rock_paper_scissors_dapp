const rockPaperScissors = artifacts.require('rockPaperScissors');

module.exports = function(_deployer) {
  _deployer.deploy(rockPaperScissors);
};
