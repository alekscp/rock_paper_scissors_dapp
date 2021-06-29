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
    uint public gameId;

    function createGame(address payable contestant) external payable {
        require(msg.value > 0, "You have to send some ether");

        address payable[] memory players = new address payable[](2);

        players[0] = payable(msg.sender);
        players[1] = contestant;

        games[gameId].id = gameId;
        games[gameId].bet = msg.value;
        games[gameId].players = players;
        games[gameId].state = State.Created;

        gameId++;
    }

    function joinGame(uint _gameId) external payable {
        Game storage g = games[_gameId];

        require(msg.sender == g.players[1], "Sender must be second player");
        require(msg.value >= g.bet, "More ether needs to be sent in order to join");
        require(g.state == State.Created, "Game must be in Created state");

        if (msg.value > g.bet) {
          payable(msg.sender).transfer(msg.value - g.bet); // Sender only pays bet value, refund difference otherwise
        }

        g.state = State.Joined;
    }
}
