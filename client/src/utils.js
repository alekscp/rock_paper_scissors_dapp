import Web3 from "web3";

const getWeb3 = async () => {
  let web3;

  if (window.ethereum) {
    await window.ethereum.request({
      method:  "eth_requestAccounts"
    });

    web3 = new Web3(window.ethereum);

    return web3;
  } else if (window.web3) {
    web3 = new Web3(Web3.currentProvider);

    return web3;
  } else {
    web3 = new Web3("http://localhost:8545");

    return web3;
  }
};

export { getWeb3 };
