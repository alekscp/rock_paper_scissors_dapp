const RockPaperScissors = artifacts.require("RockPaperScissors");

const { expectRevert } = require("@openzeppelin/test-helpers");

contract("RockPaperScissors", (accounts) => {
  let contract;
  const [player1, player2] = accounts;

  const stateMappings = {
    created: 0,
    joined: 1,
    commited: 2,
    revealed: 3
  }

  beforeEach(async () => {
    contract = await RockPaperScissors.new();
  });

  describe("createGame", () => {
    it("Creates a game", async () => {
      await contract.createGame(player2, { from: player1, value: 100 });
      const game = await contract.games(0);

      assert.equal(game.id.toNumber(), 0);
      assert.equal(game.bet.toNumber(), 100);
      assert.equal(game.state.toNumber(), stateMappings.created);
    });

    it("Fails when called without a value", async () => {
      await expectRevert(
        contract.createGame(player2, { from: player1 }),
        "You have to send some ether"
      );
    });
  });

  describe("joinGame", () => {
    it("Joins sender to game as player 2", async () => {
      await contract.createGame(player2, { from: player1, value: 100 });
      await contract.joinGame(0, { from: player2, value: 100 });

      const game = await contract.games(0);

      assert.equal(game.state.toNumber(), stateMappings.joined)
    })

    it("Fails if sender is not the second player", async () => {
      await contract.createGame(player2, { from: player1, value: 100 })

      await expectRevert(
        contract.joinGame(0, { from: player1, value: 100 }),
        "Sender must be second player"
      )
    })

    it("Fails if value sent is not sufficient", async () => {
      await contract.createGame(player2, { from: player1, value: 100 })

      await expectRevert(
        contract.joinGame(0, { from: player2, value: 50 }),
        "More ether needs to be sent in order to join"
      )
    })

    it("Fails if the game is not in Created state", async () => {
      await contract.createGame(player2, { from: player1, value: 100 })
      await contract.joinGame(0, { from: player2, value: 100 }),

      await expectRevert(
        contract.joinGame(0, { from: player2, value: 100 }),
        "Game must be in Created state"
      )
    })
  })
});
