// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

contract RockPaperScissors {
    enum State {
        Idle,
        Created,
        Joined,
        Commited,
        Revealed
    }

    struct Game {
        uint id;
        uint bet;
        address payable[] players;
        State state;
    }
    mapping(uint => Game) public games;
    uint public gameID;

    struct Move {
      bytes32 hash;
      uint value;
    }
    mapping(uint => mapping(address => Move)) public moves;

    mapping(uint => uint) public winningCombinations;

    constructor() {
        winningCombinations[1] = 3; // Rock beats scissors
        winningCombinations[2] = 1; // Paper beats rock
        winningCombinations[3] = 2; // Scissors beat paper
    }

    function createGame(address payable contestant) external payable {
        require(msg.value > 0, "You have to send some ether");

        address payable[] memory players = new address payable[](2);

        players[0] = payable(msg.sender);
        players[1] = contestant;

        games[gameID].id = gameID;
        games[gameID].bet = msg.value;
        games[gameID].players = players;
        games[gameID].state = State.Created;

        gameID++;
    }

    function getGamePlayers(uint _gameID) public view returns(address payable[] memory) {
        return games[_gameID].players;
    }

    function joinGame(uint _gameID) external payable {
        Game storage game = games[_gameID];

        require(msg.sender == game.players[1], "Sender must be second player");
        require(msg.value >= game.bet, "More ether needs to be sent in order to join");
        require(game.state == State.Created, "Game must be in Created state");

        if (msg.value > game.bet) {
          payable(msg.sender).transfer(msg.value - game.bet); // Sender only pays bet value, refund difference otherwise
        }

        game.state = State.Joined;
    }

    function commitMove(uint _gameID, uint moveID, uint salt) external {
        Game storage game = games[_gameID];

        require(game.state == State.Joined, "Game must be in Joined state");
        require(msg.sender == game.players[0] || msg.sender == game.players[1], "Sender is not one of the game players");
        require(moves[_gameID][msg.sender].hash == 0, "Move already commited");
        require(moveID == 1 || moveID == 2 || moveID == 3, "Move must be one of 1, 2 or 3");

        moves[_gameID][msg.sender].hash = keccak256(abi.encodePacked(moveID, salt));
        moves[_gameID][msg.sender].value = moveID;

        // Change state when both players have commited a move
        if (moves[_gameID][game.players[0]].hash != 0 && moves[_gameID][game.players[1]].hash != 0) {
            game.state = State.Commited;
        }
    }

    function revealMove(uint _gameID, uint moveID, uint salt) external {
        Game storage game = games[_gameID];
        Move storage moveOne = moves[_gameID][game.players[0]];
        Move storage moveTwo = moves[_gameID][game.players[1]];
        Move storage moveSender = moves[_gameID][msg.sender];

        require(game.state == State.Commited, "Game must be in Commited state");
        require(msg.sender == game.players[0] || msg.sender == game.players[1], "Sender is not one of the game players");
        require(moveSender.hash == keccak256(abi.encodePacked(moveID, salt)), "MoveID does not match commitment");

        moveSender.value = moveID;

        // Conclude game only if both moves have been saved
        if (moveOne.value != 0 && moveTwo.value != 0) {
            if (moveOne.value == moveTwo.value) { // Tie game, refund both players
                game.players[0].transfer(game.bet);
                game.players[1].transfer(game.bet);
                game.state = State.Revealed;
                return;
            }

            address payable winner;
            winner = winningCombinations[moveOne.value] == moveTwo.value ? game.players[0] : game.players[1];
            winner.transfer(2 * game.bet);
            game.state = State.Revealed;
        }
    }
}
