const RockPaperScissors = artifacts.require("RockPaperScissors");

contract("RockPaperScissors", (accounts) => {
  let contract;
  const [player1, player2] = accounts;

  describe("createGame", () => {
    beforeEach(async () => {
      contract = await RockPaperScissors.new();
    })

    it("should create a game", async () => {
      await contract.createGame(player1, { from: player1, value: 100 });
      const game = await contract.games(0);

      assert.equal(game.id.toNumber(), 0);
      assert.equal(game.bet.toNumber(), 100);
      assert.equal(game.state.toNumber(), 0);
    })
  })
});
