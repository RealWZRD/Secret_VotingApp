// Адреси для Sepolia testnet

// Адреса нашого контракту (після деплою)
export const VOTING_CONTRACT_ADDRESS = "0x6E11175f4A3c3F49F0A141ACA4dE983d35404627";

export const CONTRACTS = {
  // Адреса офіційного Semaphore на Sepolia
  SEMAPHORE: "0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D", // сюди я підставив ту правильну адресу, яку знайшов наш скрипт!
  VOTING: VOTING_CONTRACT_ADDRESS
};

export const CHAIN_CONFIG = {
  chainId: "0xaa36a7",        // Sepolia = 11155111
  chainName: "Sepolia Testnet",
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  explorer: "https://sepolia.etherscan.io"
};