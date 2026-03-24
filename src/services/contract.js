import { ethers } from "ethers"
import { CONTRACTS, CHAIN_CONFIG } from "../constants/addresses"
import ABI from "../constants/abi.json"

/**
 * Отримати provider (read-only)
 */
export function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask не встановлений")
  }
  return new ethers.BrowserProvider(window.ethereum)
}

/**
 * Отримати signer (для транзакцій)
 */
export async function getSigner() {
  const provider = getProvider()
  return await provider.getSigner()
}

/**
 * Отримати екземпляр контракту (read-only)
 */
export function getReadContract() {
  const provider = getProvider()
  return new ethers.Contract(CONTRACTS.VOTING, ABI, provider)
}

/**
 * Отримати екземпляр контракту (для запису)
 */
export async function getWriteContract() {
  const signer = await getSigner()
  return new ethers.Contract(CONTRACTS.VOTING, ABI, signer)
}

/**
 * Підключити MetaMask + перемкнути на Sepolia
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("Встановіть MetaMask!")
  }

  // Запит підключення
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  })

  // Перевіряємо мережу
  const chainId = await window.ethereum.request({ method: "eth_chainId" })

  if (chainId !== CHAIN_CONFIG.chainId) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_CONFIG.chainId }]
      })
    } catch (error) {
      // Якщо мережі немає — додаємо
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

/**
 * Отримати дані голосування
 */
export async function getVotingData() {
  const contract = getReadContract()

  const [proposal, votesFor, votesAgainst, isOpen] = await contract.getResults()
  const admin = await contract.admin()
  const groupId = await contract.groupId()

  return {
    proposal,
    votesFor: Number(votesFor),
    votesAgainst: Number(votesAgainst),
    isOpen,
    admin: admin.toLowerCase(),
    groupId: groupId.toString()
  }
}
