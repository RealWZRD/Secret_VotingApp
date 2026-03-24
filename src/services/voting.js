import { generateProof, Group } from "@semaphore-protocol/core"
import { loadIdentity } from "./identity"
import { getVotingData } from "./contract" // getWriteContract більше не потрібен!
import { JsonRpcProvider, Contract } from "ethers"
import { CONTRACTS, CHAIN_CONFIG } from "../constants/addresses"

/**
 * Проголосувати анонімно з ZK-доказом (через Релеєр)
 * @param {number} vote - 1 = За, 2 = Проти
 */
export async function castVote(vote) {
  if (vote !== 1 && vote !== 2) {
    throw new Error("Невірний голос: має бути 1 (За) або 2 (Проти)")
  }

  // 1. Завантажуємо ідентичність
  const identityData = loadIdentity()
  if (!identityData) throw new Error("Спочатку створіть ZK-ідентичність!")

  // 2. Отримуємо дані голосування
  const votingData = await getVotingData()
  if (!votingData.isOpen) throw new Error("Голосування закрите!")

  // ==========================================
  // 3. ВІДНОВЛЮЄМО ГРУПУ З БЛОКЧЕЙНУ
  // ==========================================
  console.log("⏳ Отримуємо список виборців напряму з мережі...")
  
  const rpcProvider = new JsonRpcProvider(CHAIN_CONFIG.rpcUrl)
  const semaphoreAbi = ["event MemberAdded(uint256 indexed groupId, uint256 index, uint256 identityCommitment, uint256 merkleTreeRoot)"]
  const semaphoreContract = new Contract(CONTRACTS.SEMAPHORE, semaphoreAbi, rpcProvider)

  const currentBlock = await rpcProvider.getBlockNumber()
  const fromBlock = currentBlock - 40000 > 0 ? currentBlock - 40000 : 0

  const events = await semaphoreContract.queryFilter(
    semaphoreContract.filters.MemberAdded(votingData.groupId),
    fromBlock,
    "latest"
  )
  
  const safeEvents = Array.isArray(events) ? events : []
  const membersList = safeEvents.map(e => e.args[2].toString())

  const group = new Group(membersList)
  console.log(`👥 Знайдено виборців у групі: ${membersList.length}`)

  // ==========================================
  // 4. ГЕНЕРУЄМО ZK-ДОКАЗ
  // ==========================================
  console.log("⏳ Генерація ZK-доказу...")
  const proof = await generateProof(
    identityData.identity,
    group,
    BigInt(vote),
    BigInt(votingData.proposalId) // ТЕПЕР ТУТ МАЄ БУТИ proposalId
  ) 

  console.log("✅ ZK-доказ згенеровано! Nullifier:", proof.nullifier)

  // ==========================================
  // 5. ВІДПРАВЛЯЄМО НА РЕЛЕЄР (БЕЗ КОМІСІЇ ДЛЯ КОРИСТУВАЧА)
  // ==========================================
  console.log("📤 Відправляємо доказ на Релеєр...")
  
  const response = await fetch("http://localhost:3000/relay-vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vote: vote,
      merkleTreeDepth: proof.merkleTreeDepth,
      merkleTreeRoot: proof.merkleTreeRoot,
      nullifier: proof.nullifier,
      points: proof.points
    })
  })

  const data = await response.json()

  // Якщо бекенд повернув помилку
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Помилка релеєра при відправці транзакції")
  }

  console.log("✅ Голос успішно оплачено та зараховано релеєром!")
  
  // Повертаємо хеш транзакції, який нам віддав сервер
  return { txHash: data.txHash }
}