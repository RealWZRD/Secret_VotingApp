import { ethers } from "ethers"
import { CONTRACTS, CHAIN_CONFIG } from "../constants/addresses"
import ABI from "../constants/abi.json"

const readOnlyProvider = new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl)

export function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask не встановлений")
  return new ethers.BrowserProvider(window.ethereum)
}

export async function getSigner() {
  const provider = getProvider()
  return await provider.getSigner()
}

export function getReadContract() {
  return new ethers.Contract(CONTRACTS.VOTING, ABI, readOnlyProvider)
}

export async function getWriteContract() {
  const signer = await getSigner()
  return new ethers.Contract(CONTRACTS.VOTING, ABI, signer)
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("Встановіть MetaMask!")
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
  
  const chainId = await window.ethereum.request({ method: "eth_chainId" })
  if (chainId !== CHAIN_CONFIG.chainId) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_CONFIG.chainId }]
      })
    } catch (error) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: CHAIN_CONFIG.chainId,
          chainName: CHAIN_CONFIG.chainName,
          rpcUrls: [CHAIN_CONFIG.rpcUrl],
          blockExplorerUrls: [CHAIN_CONFIG.explorer]
        }]
      })
    }
  }
  return accounts[0]
}

// 🔥 ОСЬ ЦЯ ФУНКЦІЯ, ЯКОЇ НЕ ВИСТАЧАЛО:
export async function getVotingData() {
  const contract = getReadContract()
  const data = await contract.getVotingData()

  return {
    proposal: data[0],
    isOpen: data[1],
    votesFor: Number(data[2]),
    votesAgainst: Number(data[3]),
    admin: data[4].toLowerCase(),
    groupId: data[5].toString(),
    proposalId: data[6].toString()
  }
}