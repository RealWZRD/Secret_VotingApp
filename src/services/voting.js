import { generateProof, Group } from "@semaphore-protocol/core"
import { loadIdentity } from "./identity"
import { getWriteContract, getVotingData } from "./contract"
import { JsonRpcProvider, Contract } from "ethers"
import { CONTRACTS, CHAIN_CONFIG } from "../constants/addresses"

export async function castVote(vote) {
  if (vote !== 1 && vote !== 2) {
    throw new Error("Невірний голос: має бути 1 (За) або 2 (Проти)")
  }

  const identityData = loadIdentity()
  if (!identityData) throw new Error("Спочатку створіть ZK-ідентичність!")

  const votingData = await getVotingData()
  if (!votingData.isOpen) throw new Error("Голосування закрите!")

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

  // 🔥 ОСЬ ТУТ БУЛА ПОМИЛКА!
  // Для Semaphore v4 ми просто передаємо масив виборців прямо в Групу
  const group = new Group(membersList)
  console.log(`👥 Знайдено виборців у групі: ${membersList.length}`)

  console.log("⏳ Генерація ZK-доказу...")
  const proof = await generateProof(
    identityData.identity,
    group,
    BigInt(vote),
    BigInt(votingData.groupId) // А от scope (ID групи) потрібен тільки тут!
  )

  console.log("✅ ZK-доказ згенеровано! Nullifier:", proof.nullifier)

  const contract = await getWriteContract()
  const tx = await contract.castVote(
    vote,
    proof.merkleTreeDepth,
    proof.merkleTreeRoot,
    proof.nullifier,
    proof.points
  )

  console.log("📤 Транзакція відправлена:", tx.hash)
  const receipt = await tx.wait()
  console.log("✅ Голос зараховано анонімно!")

  return { txHash: tx.hash, blockNumber: receipt.blockNumber }
}