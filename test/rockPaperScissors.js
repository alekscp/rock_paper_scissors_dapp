const RockPaperScissors = artifacts.require("RockPaperScissors");

const { expectRevert } = require("@openzeppelin/test-helpers");

contract("RockPaperScissors", (accounts) => {
  let contract;
  const [player1, player2] = accounts;

  describe("createGame", () => {
    beforeEach(async () => {
      contract = await RockPaperScissors.new();
    });

    it("Creates a game", async () => {
      await contract.createGame(player1, { from: player1, value: 100 });
      const game = await contract.games(0);

      assert.equal(game.id.toNumber(), 0);
      assert.equal(game.bet.toNumber(), 100);
      assert.equal(game.state.toNumber(), 0);
    });

    it("Fails when called without a value", async () => {
      await expectRevert(
        contract.createGame(player1, { from: player1 }),
        "You have to send some ether"
      );
    });
  });
});
