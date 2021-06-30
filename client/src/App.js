import { useState, useEffect } from 'react'
import RockPaperScissors from './contracts/RockPaperScissors.json'
import { getWeb3 } from './utils.js'

const STATES = ['Idle', 'Created', 'Joined', 'Commited', 'Revealed']

function App() {
  const [web3, setWeb3] = useState()
  const [accounts, setAccounts] = useState()
  const [contract, setContract] = useState()
  const [game, setGame] = useState({ state: '0' })
  const [move, setMove] = useState()

  useEffect(() => {
    const initApp = async () => {
      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts()
      const networkID = await web3.eth.net.getId()
      const deployedNetwork = RockPaperScissors.networks[networkID]
      const contract = new web3.eth.Contract(
        RockPaperScissors.abi,
        deployedNetwork && deployedNetwork.address
      )

      setWeb3(web3)
      setAccounts(accounts)
      setContract(contract)
    }

    initApp();
  });

  return (
    <div className="container">
      Hello
    </div>
  );
}

export default App;
