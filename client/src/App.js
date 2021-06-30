import { useState, useEffect } from 'react'
import RockPaperScissors from './contracts/RockPaperScissors.json'
import { getWeb3 } from './utils.js'

const STATES = ['Idle', 'Created', 'Joined', 'Commited', 'Revealed']

function App() {
  const [web3, setWeb3] = useState()

  useEffect(() => {
    const initApp = async () => {
      const web3 = await getWeb3()
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
