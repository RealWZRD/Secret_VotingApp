import { ethers } from "ethers"
import { CONTRACTS, CHAIN_CONFIG } from "../constants/addresses"
import ABI from "../constants/abi.json"

// 🔥 Секретна зброя: незалежний провайдер для читання
// Він гарантує, що ми завжди дивимось у Sepolia, навіть якщо гаманець глючить
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
  // Тепер читаємо напряму з інтернету!
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

export async function getVotingData() {
  const contract = getReadContract()

  // ethers v6: безпечне розпакування результату за індексами
  const result = await contract.getResults()
  const admin = await contract.admin()
  const groupId = await contract.groupId()

  return {
    proposal: result[0],
    votesFor: Number(result[1]),
    votesAgainst: Number(result[2]),
    isOpen: result[3],
    admin: admin.toLowerCase(),
    groupId: groupId.toString()
  }
}