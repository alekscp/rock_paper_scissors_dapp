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
}
