import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useWallet } from "../context/WalletContext"
import { getVotingData } from "../services/contract"
import { hasIdentity } from "../services/identity"

export default function Home() {
  const { isConnected } = useWallet()
  const [voting, setVoting] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected) {
      setLoading(false)
      return
    }

    getVotingData()
      .then(setVoting)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isConnected])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          🗳️ Анонімне голосування
        </h1>
        <p className="text-xl text-gray-400 mb-2">
          на базі <span className="text-accent font-semibold">Zero-Knowledge Proofs</span>
        </p>
        <p className="text-gray-500">
          Голосуй анонімно. Контракт підтвердить, що ти з групи,
          але не розкриє хто ти.
        </p>
      </div>

      {/* Як це працює */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {[
          {
            emoji: "🔐",
            title: "Приватність",
            desc: "Секретний ключ ніколи не покидає твій браузер"
          },
          {
            emoji: "🔮",
            title: "ZK-Доказ",
            desc: "Математичний доказ що ти в групі, без розкриття хто ти"
          },
          {
            emoji: "⛓️",
            title: "Блокчейн",
            desc: "Результат верифікується на Ethereum, незмінний і прозорий"
          }
        ].map(({ emoji, title, desc }) => (
          <div key={title} className="bg-card rounded-2xl p-6 border border-gray-700 text-center">
            <div className="text-3xl mb-2">{emoji}</div>
            <h3 className="font-bold mb-1">{title}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </div>
        ))}
      </div>

      {/* Статус */}
      {!isConnected ? (
        <div className="bg-card border border-yellow-500/30 rounded-2xl p-8 text-center">
          <p className="text-yellow-400 text-lg mb-2">
            🦊 Підключи MetaMask щоб почати
          </p>
          <p className="text-gray-500 text-sm">
            Використай кнопку у верхньому правому куті
          </p>
        </div>
      ) : loading ? (
        <div className="text-center text-gray-400">Завантаження...</div>
      ) : voting ? (
        <div className="bg-card border border-gray-700 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4">📋 Поточне голосування</h2>

          <div className="bg-dark rounded-xl p-4 mb-4">
            <p className="text-lg font-medium">&ldquo;{voting.proposal}&rdquo;</p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              voting.isOpen
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {voting.isOpen ? "🟢 Активне" : "🔴 Завершено"}
            </span>
            <span className="text-gray-400">
              Голосів: {voting.votesFor + voting.votesAgainst}
            </span>
          </div>

          <div className="flex gap-3">
            {!hasIdentity() ? (
              <Link
                to="/register"
                className="flex-1 bg-primary hover:bg-primary/80 text-center 
                           py-3 rounded-xl font-medium transition-colors"
              >
                🔑 Зареєструватися
              </Link>
            ) : (
              <Link
                to="/vote"
                className="flex-1 bg-primary hover:bg-primary/80 text-center 
                           py-3 rounded-xl font-medium transition-colors"
              >
                🗳️ Голосувати
              </Link>
            )}
            <Link
              to="/results"
              className="flex-1 bg-card border border-gray-600 hover:border-gray-400 
                         text-center py-3 rounded-xl font-medium transition-colors"
            >
              📊 Результати
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-gray-700 rounded-2xl p-8 text-center">
          <p className="text-gray-400">Голосування ще не створене</p>
        </div>
      )}
    </div>
  )
}
