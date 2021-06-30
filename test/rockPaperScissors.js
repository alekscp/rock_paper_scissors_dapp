const RockPaperScissors = artifacts.require("RockPaperScissors");

const { expectRevert } = require("@openzeppelin/test-helpers");

contract("RockPaperScissors", (accounts) => {
  let contract;
  const [player, contestant, otherPlayer] = accounts;
  const [rock, paper, scissors] = [1, 2, 3];
  const [saltOne, saltTwo] = [10, 20];

  const stateMappings = {
    created: 0,
    joined: 1,
    commited: 2,
    revealed: 3
  };

  beforeEach(async () => {
    contract = await RockPaperScissors.new();
  });

  describe("createGame", () => {
    it("Creates a game", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      const game = await contract.games(0);

      assert.equal(game.id.toNumber(), 0);
      assert.equal(game.bet.toNumber(), 100);
      assert.equal(game.state.toNumber(), stateMappings.created);
    });

    it("Fails when called without a value", async () => {
      await expectRevert(contract.createGame(contestant, { from: player }), "You have to send some ether");
    });
  });

  describe("joinGame", () => {
    it("Joins sender to game as player 2", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      await contract.joinGame(0, { from: contestant, value: 100 });

      const game = await contract.games(0);

      assert.equal(game.state.toNumber(), stateMappings.joined);
    });

    it("Fails if sender is not the second player", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });

      await expectRevert(contract.joinGame(0, { from: player, value: 100 }), "Sender must be second player");
    });

    it("Fails if value sent is not sufficient", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });

      await expectRevert(
        contract.joinGame(0, { from: contestant, value: 50 }),
        "More ether needs to be sent in order to join"
      );
    });

    it("Fails if the game is not in Created state", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      await contract.joinGame(0, { from: contestant, value: 100 }),
        await expectRevert(contract.joinGame(0, { from: contestant, value: 100 }), "Game must be in Created state");
    });
  });

  describe("commitMove", () => {
    it("Commits sender's move to the game", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      await contract.joinGame(0, { from: contestant, value: 100 });
      await contract.commitMove(0, rock, saltOne, { from: player });
      await contract.commitMove(0, paper, saltTwo, { from: contestant });

      const game = await contract.games(0);

      assert.equal(game.state.toNumber(), stateMappings.commited);
    });

    it("Fails if the game is not in Joined state", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });

      await expectRevert(contract.commitMove(0, rock, saltOne, { from: player }), "Game must be in Joined state");
    });

    it("Fails if the sender is not one of the players taking part in the game", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      await contract.joinGame(0, { from: contestant, value: 100 });

      await expectRevert(
        contract.commitMove(0, scissors, saltOne, { from: otherPlayer }),
        "Sender is not one of the game players"
      );
    });

    it("Fails if the move was already commited", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      await contract.joinGame(0, { from: contestant, value: 100 });
      await contract.commitMove(0, rock, saltOne, { from: player });

      await expectRevert(contract.commitMove(0, rock, saltOne, { from: player }), "Move already commited");
    });

    it("Fails if move is not one of 1, 2 or 3", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      await contract.joinGame(0, { from: contestant, value: 100 });

      const otherMove = 4;

      await expectRevert(contract.commitMove(0, otherMove, saltOne, { from: player }), "Move must be one of 1, 2 or 3");
    });
  });

  describe("revealMove", () => {
    it("Reveals the moves", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      await contract.joinGame(0, { from: contestant, value: 100 });
      await contract.commitMove(0, rock, saltOne, { from: player });
      await contract.commitMove(0, paper, saltTwo, { from: contestant });
      await contract.revealMove(0, rock, saltOne, { from: player });
      await contract.revealMove(0, paper, saltTwo, { from: contestant });

      const game = await contract.games(0);

      assert.equal(game.state.toNumber(), stateMappings.revealed);
    });

    it("Sends bet value back to both player in case of a tie game", async () => {
      const oneEther = web3.utils.toBN(web3.utils.toWei("1", "ether"));

      await contract.createGame(contestant, { from: player, value: oneEther });
      await contract.joinGame(0, { from: contestant, value: oneEther });
      await contract.commitMove(0, rock, saltOne, { from: player });
      await contract.commitMove(0, rock, saltTwo, { from: contestant });

      const playerBalanceBeforeReveal = web3.utils.toBN(await web3.eth.getBalance(player));
      const contestantBalanceBeforeReveal = web3.utils.toBN(await web3.eth.getBalance(contestant));

      const receiptPlayer = await contract.revealMove(0, rock, saltOne, { from: player });
      const gasUsedPlayer = web3.utils.toBN(receiptPlayer.receipt.gasUsed);
      const txPlayer = await web3.eth.getTransaction(receiptPlayer.tx);
      const gasPricePlayer = web3.utils.toBN(txPlayer.gasPrice);

      const receiptContestant = await contract.revealMove(0, rock, saltTwo, { from: contestant });
      const gasUsedContestant = web3.utils.toBN(receiptContestant.receipt.gasUsed);
      const txContestant = await web3.eth.getTransaction(receiptContestant.tx);
      const gasPriceContestant = web3.utils.toBN(txContestant.gasPrice);

      const playerBalanceAfterReveal = web3.utils.toBN(await web3.eth.getBalance(player));
      const contestantBalanceAfterReveal = web3.utils.toBN(await web3.eth.getBalance(contestant));

      const playerBalanceDifference =
        playerBalanceAfterReveal.add(gasPricePlayer.mul(gasUsedPlayer)) - playerBalanceBeforeReveal;
      const contestantBalanceDifference =
        contestantBalanceAfterReveal.add(gasPriceContestant.mul(gasUsedContestant)) - contestantBalanceBeforeReveal;

      assert.equal(playerBalanceDifference.toString(), oneEther.toString(), "Must be equal to exactly 1 Ether");
      assert.equal(contestantBalanceDifference.toString(), oneEther.toString(), "Must be equal to exactly 1 Ether");
    });

    it("Sends bet value to winning player", async () => {
      const oneEther = web3.utils.toBN(web3.utils.toWei("1", "ether"));

      await contract.createGame(contestant, { from: player, value: oneEther });
      await contract.joinGame(0, { from: contestant, value: oneEther });
      await contract.commitMove(0, rock, saltOne, { from: player });
      await contract.commitMove(0, scissors, saltTwo, { from: contestant });

      const playerBalanceBeforeReveal = web3.utils.toBN(await web3.eth.getBalance(player));
      const contestantBalanceBeforeReveal = web3.utils.toBN(await web3.eth.getBalance(contestant));

      const receiptPlayer = await contract.revealMove(0, rock, saltOne, { from: player });
      const gasUsedPlayer = web3.utils.toBN(receiptPlayer.receipt.gasUsed);
      const txPlayer = await web3.eth.getTransaction(receiptPlayer.tx);
      const gasPricePlayer = web3.utils.toBN(txPlayer.gasPrice);

      const receiptContestant = await contract.revealMove(0, scissors, saltTwo, { from: contestant });
      const gasUsedContestant = web3.utils.toBN(receiptContestant.receipt.gasUsed);
      const txContestant = await web3.eth.getTransaction(receiptContestant.tx);
      const gasPriceContestant = web3.utils.toBN(txContestant.gasPrice);

      const playerBalanceAfterReveal = web3.utils.toBN(await web3.eth.getBalance(player));
      const contestantBalanceAfterReveal = web3.utils.toBN(await web3.eth.getBalance(contestant));

      const playerBalanceDifference =
        playerBalanceAfterReveal.add(gasPricePlayer.mul(gasUsedPlayer)) - playerBalanceBeforeReveal;
      const contestantBalanceDifference =
        contestantBalanceAfterReveal.add(gasPriceContestant.mul(gasUsedContestant)) - contestantBalanceBeforeReveal;

      assert.equal(playerBalanceDifference.toString(), (oneEther * 2).toString(), "Must be equal to exactly 2 Ether");
      assert.equal(
        contestantBalanceDifference.toString(),
        (oneEther - oneEther).toString(),
        "Must be equal to exactly 0 Ether"
      );
    });

    it("Fails if the game is not in the Commited state", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      await contract.joinGame(0, { from: contestant, value: 100 });
      await contract.commitMove(0, rock, saltOne, { from: player });

      await expectRevert(contract.revealMove(0, rock, saltOne, { from: player }), "Game must be in Commited state");
    });

    it("Fails if the sender is not one of the players taking part in the game", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      await contract.joinGame(0, { from: contestant, value: 100 });
      await contract.commitMove(0, rock, saltOne, { from: player });
      await contract.commitMove(0, scissors, saltTwo, { from: contestant });

      await expectRevert(
        contract.revealMove(0, rock, saltOne, { from: otherPlayer }),
        "Sender is not one of the game players"
      );
    });

    it("Fails if modeID does not match the commitment", async () => {
      await contract.createGame(contestant, { from: player, value: 100 });
      await contract.joinGame(0, { from: contestant, value: 100 });
      await contract.commitMove(0, rock, saltOne, { from: player });
      await contract.commitMove(0, scissors, saltTwo, { from: contestant });

      await expectRevert(contract.revealMove(0, paper, saltOne, { from: player }), "MoveID does not match commitment");
    });
  });
});
