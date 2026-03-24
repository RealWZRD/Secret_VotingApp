import { useState, useEffect } from "react"
import { useWallet } from "../context/WalletContext"
import { getVotingData } from "../services/contract"
import { CONTRACTS, CHAIN_CONFIG } from "../constants/addresses"
import ResultsBar from "../components/ResultsBar"

export default function Results() {
  const { isConnected } = useWallet()
  const [voting, setVoting] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected) {
      setLoading(false)
      return
    }

    const fetchResults = () => {
      getVotingData()
        .then(setVoting)
        .catch(console.error)
        .finally(() => setLoading(false))
    }

    fetchResults()

    // Оновлюємо кожні 10 секунд
    const interval = setInterval(fetchResults, 10000)
    return () => clearInterval(interval)
  }, [isConnected])

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🦊</div>
        <h2 className="text-2xl font-bold">Підключи гаманець</h2>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-400">
        Завантаження...
      </div>
    )
  }

  if (!voting) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-gray-400">Голосування не знайдено</p>
      </div>
    )
  }

  const total = voting.votesFor + voting.votesAgainst

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">📊 Результати</h1>

      {/* Питання */}
      <div className="bg-card border border-gray-700 rounded-2xl p-6 mb-6">
        <p className="text-gray-400 text-sm mb-1">Питання:</p>
        <p className="text-xl font-bold">&ldquo;{voting.proposal}&rdquo;</p>
        <div className="mt-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            voting.isOpen
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}>
            {voting.isOpen ? "🟢 Активне" : "🔴 Завершено"}
          </span>
        </div>
      </div>

      {/* Результати */}
      <div className="bg-card border border-gray-700 rounded-2xl p-6 mb-6">
        <ResultsBar
          label="👍 ЗА"
          count={voting.votesFor}
          total={total}
          color="bg-gradient-to-r from-green-500 to-emerald-400"
        />
        <ResultsBar
          label="👎 ПРОТИ"
          count={voting.votesAgainst}
          total={total}
          color="bg-gradient-to-r from-red-500 to-rose-400"
        />

        <div className="mt-4 pt-4 border-t border-gray-700 text-center">
          <span className="text-gray-400">
            Всього голосів: <strong className="text-white">{total}</strong>
          </span>
        </div>
      </div>

      {/* Верифікація */}
      <div className="bg-card border border-gray-700 rounded-2xl p-6">
        <h3 className="font-bold mb-3">🔍 Верифікація на блокчейні</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Контракт:</span>
            <a
              href={`${CHAIN_CONFIG.explorer}/address/${CONTRACTS.VOTING}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {CONTRACTS.VOTING.slice(0, 10)}...{CONTRACTS.VOTING.slice(-8)}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Мережа:</span>
            <span>{CHAIN_CONFIG.chainName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Semaphore Group:</span>
            <span className="text-accent">{voting.groupId}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
