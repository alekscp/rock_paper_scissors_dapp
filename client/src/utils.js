import Web3 from "web3";

const getWeb3 = async () => {
  let web3

  if (window.ethereum) {
    await window.ethereum.send("eth_requestAccounts");

    web3 = new Web3(window.ethereum);

    return web3
  }

  if (Web3.givenProvider) {
    web3 = new Web3(Web3.givenProvider)

    return web3
  }

  web3 = new Web3("http://localhost:8545")
};

export { getWeb3 }
