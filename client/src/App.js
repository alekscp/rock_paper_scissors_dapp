import { useState, useEffect } from 'react';
import RockPaperScissors from './contracts/RockPaperScissors.json';
import { getWeb3 } from './utils.js';

const STATES = ['Idle', 'Created', 'Joined', 'Commited', 'Revealed'];

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [game, setGame] = useState({ state: '0' });
  const [move, setMove] = useState();

  useEffect(() => {
    const initApp = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkID = await web3.eth.net.getId();
      const deployedNetwork = RockPaperScissors.networks[networkID];
      const contract = new web3.eth.Contract(RockPaperScissors.abi, deployedNetwork && deployedNetwork.address);

      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
    };

    initApp();

    window.ethereum.on('accountsChanged', (accounts) => {
      setAccounts(accounts);
    });
  }, []);

  const isReady = () => {
    return typeof contract !== 'undefined' && typeof web3 !== 'undefined' && typeof accounts !== 'undefined';
  };

  useEffect(() => {
    if (isReady()) {
      updateGame();
    }
  }, [accounts, contract, web3]);

  async function updateGame(e) {
    let gameID = parseInt(await contract.methods.gameID().call());
    gameID = gameID > 0 ? gameID - 1 : gameID;

    const game = await contract.methods.games(gameID).call();
    setGame({ id: game[0], bet: game[1], players: game[2], state: game[3] });
  }

  async function createGame(e) {
    e.preventDefault();

    const participants = e.target.elements[0].value;
    const bet = e.target.elements[1].value;
  }

  async function joingame() {}
  async function commitMove() {}
  async function revealMove() {}

  return (
    <div className="container">
      <h1 className="text-center">Rock Paper Scissors</h1>

      <p>State: {STATES[game.state]}</p>
      {game.state === '1' ? (
        <div>
          <p>Bet: {game.bet}</p>
          <div>
            <h2>Players</h2>
            <ul>
              {game.players.map((player) => (
                <li key={player}>{player}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {game.state === '0' ? (
        <div className="row">
          <div className="col-sm-12">
            <h2>Create Game</h2>
            <form onSubmit={(e) => createGame(e)}>
              <div className="form-group">
                <label htmlFor="participant">Participant</label>
                <input type="text" className="form-control" id="participant" />
              </div>
              <div className="form-group">
                <label htmlFor="bet">Bet</label>
                <input type="text" className="form-control" id="bet" />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>
        </div>
      ) : null}

        {game.state === '1'
            && game.players[1].toLowerCase() === accounts[0].toLowerCase() ? (
              <div className="row">
                <div className="col-sm-12">
                  <h2>Bet</h2>
                  <button onClick={e => joinGame()} type="submit" className="btn btn-primary">Submit</button>
                </div>
              </div>
            ) : null}

        {game.state === '2' ? (
          <div className="row">
            <div className="col-sm-12">
              <h2>Commit Move</h2>
              <form onSubmit={() => commmitMove(e)}>
                <div className="form-group">
                  <label htmlFor="move">Move</label>
                  <select className="form-control" id="move">
                    <option value="1">Rock</option>
                    <option value="2">Paper</option>
                    <option value="3">Scissors</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
              </form>
            </div>
          </div>
        ) : null}

          {game.state === '3' ? (
            <div className="row">
              <div className="col-sm-12">
                <h2>Reveal Move</h2>
                <button onClick={() => revealMove()} type="submit" className="btn btn-primary">Submit</button>
              </div>
            </div>
          ) : null}
    </div>
  );
}

export default App;
