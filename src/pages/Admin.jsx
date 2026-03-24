import { useState, useEffect } from "react"
import { useWallet } from "../context/WalletContext"
import { getVotingData, getWriteContract } from "../services/contract"
import toast from "react-hot-toast"

export default function Admin() {
  const { account, isConnected } = useWallet()
  const [voting, setVoting] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [proposal, setProposal] = useState("")
  const [commitment, setCommitment] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected) return

    getVotingData().then(data => {
      setVoting(data)
      setIsAdmin(data.admin === account)
    }).catch(console.error)
  }, [isConnected, account])

  // Створити голосування
  const handleStartVoting = async () => {
    if (!proposal.trim()) return toast.error("Введіть питання!")

    try {
      setLoading(true)
      const contract = await getWriteContract()
      const tx = await contract.startVoting(proposal)
      await tx.wait()
      toast.success("Голосування створено! 🎉")
      setProposal("")

      // Оновити дані
      const data = await getVotingData()
      setVoting(data)
    } catch (err) {
      toast.error(err.reason || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Додати виборця
  const handleAddVoter = async () => {
    if (!commitment.trim()) return toast.error("Введіть commitment!")

    try {
      setLoading(true)
      const contract = await getWriteContract()
      const tx = await contract.addVoter(commitment)
      await tx.wait()
      toast.success("Виборця додано! ✅")
      setCommitment("")
    } catch (err) {
      toast.error(err.reason || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Завершити голосування
  const handleEndVoting = async () => {
    try {
      setLoading(true)
      const contract = await getWriteContract()
      const tx = await contract.endVoting()
      await tx.wait()
      toast.success("Голосування завершено! 🛑")

      const data = await getVotingData()
      setVoting(data)
    } catch (err) {
      toast.error(err.reason || err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🦊</div>
        <h2 className="text-2xl font-bold">Підключи гаманець</h2>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Доступ заборонено</h2>
        <p className="text-gray-400">
          Ця сторінка доступна тільки адміністратору контракту
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">⚙️ Панель адміна</h1>

      <div className="space-y-6">
        {/* Створити голосування */}
        <div className="bg-card border border-gray-700 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">🚀 Створити голосування</h2>
          <input
            type="text"
            value={proposal}
            onChange={e => setProposal(e.target.value)}
            placeholder="Введіть питання для голосування..."
            className="w-full bg-dark border border-gray-600 rounded-xl px-4 py-3 
                       text-white placeholder-gray-500 focus:border-accent 
                       focus:outline-none mb-3"
          />
          <button
            onClick={handleStartVoting}
            disabled={loading || voting?.isOpen}
            className="w-full bg-primary hover:bg-primary/80 disabled:opacity-50 
                       disabled:cursor-not-allowed py-3 rounded-xl font-medium 
                       transition-colors"
          >
            {voting?.isOpen ? "Голосування вже активне" : "Створити голосування"}
          </button>
        </div>

        {/* Додати виборця */}
        <div className="bg-card border border-gray-700 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">👥 Додати виборця</h2>
          <input
            type="text"
            value={commitment}
            onChange={e => setCommitment(e.target.value)}
            placeholder="Вставте Identity Commitment виборця..."
            className="w-full bg-dark border border-gray-600 rounded-xl px-4 py-3 
                       text-white placeholder-gray-500 focus:border-accent 
                       focus:outline-none mb-3 font-mono text-sm"
          />
          <button
            onClick={handleAddVoter}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 
                       py-3 rounded-xl font-medium transition-colors"
          >
            ➕ Додати до групи
          </button>
        </div>

        {/* Завершити */}
        {voting?.isOpen && (
          <div className="bg-card border border-red-500/30 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4 text-red-400">
              🛑 Завершити голосування
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Після завершення ніхто не зможе проголосувати.
              Результати залишаться на блокчейні назавжди.
            </p>
            <button
              onClick={handleEndVoting}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 
                         py-3 rounded-xl font-medium transition-colors"
            >
              Завершити голосування
            </button>
          </div>
        )}

        {/* Поточний статус */}
        {voting && (
          <div className="bg-card border border-gray-700 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-3">📋 Статус</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Питання:</span>
                <span>{voting.proposal || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Статус:</span>
                <span>{voting.isOpen ? "🟢 Активне" : "🔴 Закрите"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Голосів ЗА:</span>
                <span className="text-green-400">{voting.votesFor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Голосів ПРОТИ:</span>
                <span className="text-red-400">{voting.votesAgainst}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
