// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

contract RockPaperScissors {
    enum State {
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

    function joinGame(uint _gameID) external payable {
        Game storage g = games[_gameID];

        require(msg.sender == g.players[1], "Sender must be second player");
        require(msg.value >= g.bet, "More ether needs to be sent in order to join");
        require(g.state == State.Created, "Game must be in Created state");

        if (msg.value > g.bet) {
          payable(msg.sender).transfer(msg.value - g.bet); // Sender only pays bet value, refund difference otherwise
        }

        g.state = State.Joined;
    }

    function commitMove(uint _gameID, uint moveID, uint salt) external {
        Game storage g = games[_gameID];

        require(g.state == State.Joined, "Game must be in Joined state");
        require(msg.sender == g.players[0] || msg.sender == g.players[1], "Sender is not one of the game players");
        require(moves[_gameID][msg.sender].hash == 0, "Move already commited");
        require(moveID == 1 || moveID == 2 || moveID == 3, "Move must be one of 1, 2 or 3");

        moves[_gameID][msg.sender].hash = keccak256(abi.encodePacked(moveID, salt));
        moves[_gameID][msg.sender].value = 0;

        // Change state when both players have commited a move
        if (moves[_gameID][g.players[0]].hash != 0 && moves[_gameID][g.players[1]].hash != 0) {
            g.state = State.Commited;
        }
    }
}
