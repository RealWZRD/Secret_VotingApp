import { useState } from "react"
import { useWallet } from "../context/WalletContext"
import { hasIdentity } from "../services/identity"
import { castVote } from "../services/voting"
import { CHAIN_CONFIG } from "../constants/addresses"
import VoteCard from "../components/VoteCard"
import ProofLoader from "../components/ProofLoader"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"

export default function Vote() {
  const { isConnected } = useWallet()
  const [selected, setSelected] = useState(null)    // 1 або 2
  const [status, setStatus] = useState("idle")       // idle | proving | sending | done | error
  const [txHash, setTxHash] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleVote = async () => {
    if (!selected) return

    try {
      setStatus("proving")
      setErrorMsg(null)

      const result = await castVote(selected)

      setTxHash(result.txHash)
      setStatus("done")
      toast.success("Голос зараховано анонімно! 🎉")
    } catch (err) {
      console.error(err)
      setStatus("error")

      if (err.message?.includes("already been used")) {
        setErrorMsg("Ви вже голосували! Повторне голосування неможливе.")
      } else {
        setErrorMsg(err.reason || err.message || "Невідома помилка")
      }

      toast.error("Помилка голосування")
    }
  }

  // Перевірки
  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🦊</div>
        <h2 className="text-2xl font-bold mb-2">Підключи гаманець</h2>
        <p className="text-gray-400">Спочатку підключи MetaMask</p>
      </div>
    )
  }

  if (!hasIdentity()) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔑</div>
        <h2 className="text-2xl font-bold mb-2">Немає ідентичності</h2>
        <p className="text-gray-400 mb-4">
          Спочатку створіть ZK-ідентичність
        </p>
        <Link
          to="/register"
          className="inline-block bg-primary hover:bg-primary/80 px-6 py-3 
                     rounded-xl font-medium transition-colors"
        >
          Перейти до реєстрації
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">🗳️ Голосування</h1>

      {/* Стан: вибір голосу */}
      {status === "idle" && (
        <div className="space-y-6">
          <div className="bg-card border border-gray-700 rounded-2xl p-6 text-center">
            <p className="text-gray-400 mb-1">Питання:</p>
            <p className="text-xl font-bold">Завантаження...</p>
          </div>

          {/* Картки голосування */}
          <div className="flex gap-4">
            <VoteCard
              emoji="👍"
              label="ЗА"
              description="Підтримую пропозицію"
              selected={selected === 1}
              onClick={() => setSelected(1)}
            />
            <VoteCard
              emoji="👎"
              label="ПРОТИ"
              description="Не підтримую"
              selected={selected === 2}
              onClick={() => setSelected(2)}
            />
          </div>

          {/* Кнопка голосування */}
          <button
            onClick={handleVote}
            disabled={!selected}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all
              ${selected
                ? "bg-primary hover:bg-primary/80 cursor-pointer"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
          >
            {selected
              ? `🔮 Згенерувати ZK-доказ та проголосувати "${selected === 1 ? "ЗА" : "ПРОТИ"}"`
              : "Оберіть варіант голосування"
            }
          </button>

          <p className="text-center text-gray-500 text-sm">
            🔒 Ваш голос буде повністю анонімним
          </p>
        </div>
      )}

      {/* Стан: генерація ZK-доказу */}
      {status === "proving" && <ProofLoader />}

      {/* Стан: успіх */}
      {status === "done" && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            Голос зараховано анонімно!
          </h2>
          <p className="text-gray-400 mb-6">
            Ваш голос підтверджено на блокчейні. Ніхто не може визначити,
            що це саме ви проголосували.
          </p>

          {txHash && (
            <div className="bg-dark rounded-xl p-4 mb-6">
              <p className="text-gray-500 text-sm mb-1">Транзакція:</p>
              <a
                href={`${CHAIN_CONFIG.explorer}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline text-sm break-all"
              >
                {txHash}
              </a>
            </div>
          )}

          <Link
            to="/results"
            className="inline-block bg-primary hover:bg-primary/80 px-6 py-3 
                       rounded-xl font-medium transition-colors"
          >
            📊 Переглянути результати
          </Link>
        </div>
      )}

      {/* Стан: помилка */}
      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Помилка</h2>
          <p className="text-gray-400 mb-4">{errorMsg}</p>
          <button
            onClick={() => {
              setStatus("idle")
              setSelected(null)
            }}
            className="bg-card border border-gray-600 hover:border-gray-400 
                       px-6 py-3 rounded-xl transition-colors"
          >
            Спробувати ще раз
          </button>
        </div>
      )}
    </div>
  )
}
