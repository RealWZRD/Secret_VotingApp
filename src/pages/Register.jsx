import { useState } from "react"
import { useWallet } from "../context/WalletContext"
import { createIdentity, loadIdentity, hasIdentity } from "../services/identity"
import toast from "react-hot-toast"
import { HiClipboardCopy, HiShieldCheck, HiExclamation, HiRefresh } from "react-icons/hi"

export default function Register() {
  const { isConnected } = useWallet()
  const [commitment, setCommitment] = useState(() => {
    const existing = loadIdentity()
    return existing?.commitment || null
  })
  const [justCreated, setJustCreated] = useState(false)

  const handleCreate = () => {
    try {
      const { commitment: newCommitment } = createIdentity()
      setCommitment(newCommitment)
      setJustCreated(true)
      toast.success("Новий ZK-бюлетень успішно згенеровано! 🎉")
    } catch (err) {
      toast.error("Помилка: " + err.message)
    }
  }

  const copyCommitment = () => {
    navigator.clipboard.writeText(commitment)
    toast.success("Код скопійовано!")
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🦊</div>
        <h2 className="text-2xl font-bold mb-2">Підключи гаманець</h2>
        <p className="text-gray-400">Спочатку підключи MetaMask</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center"> Реєстрація акціонера</h1>

      {!commitment ? (
        /* Ідентичність ще не створена */
        <div className="bg-card border border-gray-700 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🔑</div>
          <h2 className="text-xl font-bold mb-2">Створити ZK-бюлетень</h2>
          <p className="text-gray-400 mb-6">
            Буде згенеровано унікальний секретний ключ, який зберігатиметься
            <strong className="text-white"> тільки у вашому браузері</strong>.
          </p>

          <button
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/80 text-white px-8 py-3 
                       rounded-xl font-medium text-lg transition-colors"
          >
            🔑 Згенерувати мій ключ
          </button>
        </div>
      ) : (
        /* Ідентичність вже створена */
        <div className="space-y-6">
          {/* Успіх та управління ключем */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <HiShieldCheck className="text-green-400 text-3xl" />
                <div>
                  <h2 className="text-xl font-bold text-green-400">
                    {justCreated ? "Бюлетень створено! 🎉" : "Ключ доступу активний"}
                  </h2>
                  <p className="text-green-500/70 text-sm">
                    Ваш секрет надійно схований у браузері.
                  </p>
                </div>
              </div>
              
              {/* Кнопка створення НОВОГО ключа */}
              <button
                onClick={() => {
                  if (window.confirm("Увага! Старий ключ буде назавжди стерто з браузера. Ви впевнені, що хочете створити новий бюлетень для нового голосування?")) {
                    handleCreate()
                  }
                }}
                className="flex items-center gap-2 bg-dark border border-gray-600 hover:border-accent 
                           text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-all text-sm"
              >
                <HiRefresh className="text-lg" />
                <span>Згенерувати новий</span>
              </button>
            </div>
          </div>

          {/* Commitment */}
          <div className="bg-card border border-gray-700 rounded-2xl p-6">
            <h3 className="font-bold mb-2 text-gray-300">
              Ваш публічний Identity Commitment:
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Це ваш "публічний жетон". Смарт-контракт не знає вашого імені, він знає лише цей код.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-dark p-3 rounded-xl text-accent text-sm 
                               overflow-x-auto break-all font-mono">
                {commitment}
              </code>
              <button
                onClick={copyCommitment}
                className="bg-primary/20 hover:bg-primary/30 text-accent p-3 
                           rounded-xl transition-colors shrink-0"
                title="Копіювати"
              >
                <HiClipboardCopy className="text-xl" />
              </button>
            </div>
          </div>

          {/* Інструкція */}
          <div className="bg-card border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <HiExclamation className="text-yellow-400 text-2xl mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">Що робити далі?</h3>
                <ol className="text-gray-400 space-y-2 text-sm list-decimal ml-4">
                  <li>
                    Скопіюйте ваш <strong className="text-white">Identity Commitment</strong> вище.
                  </li>
                  <li>
                    Надішліть його <strong className="text-white">адміністратору зборів</strong> (або вставте в систему реєстрації компанії).
                  </li>
                  <li>
                    Адмін додасть ваш код до реєстру виборців на блокчейні.
                  </li>
                  <li>
                    Після додавання ви зможете проголосувати на сторінці
                    <strong className="text-accent"> "Голосувати"</strong>.
                  </li>
                  <li className="text-yellow-500/80 mt-2">
                    <em>Коли оголосять наступні збори, просто натисніть "Згенерувати новий" і повторіть процес.</em>
                  </li>
                </ol>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}