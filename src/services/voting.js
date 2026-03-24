import { generateProof, Group } from "@semaphore-protocol/core"
import { loadIdentity } from "./identity"
import { getWriteContract, getVotingData } from "./contract"
import { BrowserProvider, Contract } from "ethers"
import { CONTRACTS } from "../constants/addresses"

/**
 * Проголосувати анонімно з ZK-доказом
 * @param {number} vote - 1 = За, 2 = Проти
 */
export async function castVote(vote) {
  if (vote !== 1 && vote !== 2) {
    throw new Error("Невірний голос: має бути 1 (За) або 2 (Проти)")
  }

  // 1. Завантажуємо ідентичність
  const identityData = loadIdentity()
  if (!identityData) {
    throw new Error("Спочатку створіть ZK-ідентичність!")
  }

  // 2. Отримуємо дані голосування
  const votingData = await getVotingData()
  if (!votingData.isOpen) {
    throw new Error("Голосування закрите!")
  }

  // ==========================================
  // 3. ВІДНОВЛЮЄМО ГРУПУ З БЛОКЧЕЙНУ
  // ==========================================
  console.log("⏳ Отримуємо список виборців з блокчейну...")
  const provider = new BrowserProvider(window.ethereum)
  
  // ABI для читання подій додавання виборців
  const semaphoreAbi = ["event MemberAdded(uint256 indexed groupId, uint256 index, uint256 identityCommitment, uint256 merkleTreeRoot)"]
  const semaphoreContract = new Contract(CONTRACTS.SEMAPHORE, semaphoreAbi, provider)

  // Обхід ліміту RPC: шукаємо тільки в останніх 40 000 блоках
  const currentBlock = await provider.getBlockNumber()
  const fromBlock = currentBlock - 40000 > 0 ? currentBlock - 40000 : 0

  const events = await semaphoreContract.queryFilter(
    semaphoreContract.filters.MemberAdded(votingData.groupId),
    fromBlock,
    "latest"
  )
  
  // Безпечно витягуємо Identity Commitments (це 3-й аргумент у події MemberAdded)
  const membersList = events.map(e => e.args[2].toString())

  // Створюємо об'єкт Групи і наповнюємо його виборцями
  const group = new Group(votingData.groupId)
  group.addMembers(membersList)
  console.log(`👥 Знайдено виборців у групі: ${membersList.length}`)

  // ==========================================
  // 4. ГЕНЕРУЄМО ZK-ДОКАЗ
  // ==========================================
  console.log("⏳ Генерація ZK-доказу...")

  const proof = await generateProof(
    identityData.identity,              // 1. наша секретна ідентичність
    group,                              // 2. об'єкт Групи з усіма виборцями
    BigInt(vote),                       // 3. message (наш голос)
    BigInt(votingData.groupId)          // 4. scope (ID групи)
  )

  console.log("✅ ZK-доказ згенеровано!")
  console.log("Nullifier:", proof.nullifier)

  // ==========================================
  // 5. ВІДПРАВЛЯЄМО В КОНТРАКТ
  // ==========================================
  const contract = await getWriteContract()

  const tx = await contract.castVote(
    vote,
    proof.merkleTreeDepth,
    proof.merkleTreeRoot,
    proof.nullifier,
    proof.points
  )

  console.log("📤 Транзакція відправлена:", tx.hash)

  // Чекаємо підтвердження
  const receipt = await tx.wait()
  console.log("✅ Голос зараховано анонімно!")

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber
  }
}