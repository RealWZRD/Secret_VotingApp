import { useState } from "react"
import { useWallet } from "../context/WalletContext"
import { createIdentity, loadIdentity, hasIdentity } from "../services/identity"
import toast from "react-hot-toast"
import { HiClipboardCopy, HiShieldCheck, HiExclamation } from "react-icons/hi"

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
      toast.success("ZK-ідентичність створена! 🎉")
    } catch (err) {
      toast.error("Помилка: " + err.message)
    }
  }

  const copyCommitment = () => {
    navigator.clipboard.writeText(commitment)
    toast.success("Скопійовано!")
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
      <h1 className="text-3xl font-bold mb-8 text-center">🔐 Реєстрація виборця</h1>

      {!commitment ? (
        /* Ідентичність ще не створена */
        <div className="bg-card border border-gray-700 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🔑</div>
          <h2 className="text-xl font-bold mb-2">Створити ZK-ідентичність</h2>
          <p className="text-gray-400 mb-6">
            Буде згенеровано унікальний секретний ключ, який зберігатиметься
            <strong className="text-white"> тільки у вашому браузері</strong>.
          </p>

          <button
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/80 text-white px-8 py-3 
                       rounded-xl font-medium text-lg transition-colors"
          >
            🔑 Створити ідентичність
          </button>
        </div>
      ) : (
        /* Ідентичність створена */
        <div className="space-y-6">
          {/* Успіх */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <HiShieldCheck className="text-green-400 text-2xl" />
              <h2 className="text-xl font-bold text-green-400">
                {justCreated ? "Ідентичність створена! 🎉" : "Ідентичність знайдена ✅"}
              </h2>
            </div>
          </div>

          {/* Commitment */}
          <div className="bg-card border border-gray-700 rounded-2xl p-6">
            <h3 className="font-bold mb-2 text-gray-300">
              Ваш Identity Commitment:
            </h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-dark p-3 rounded-xl text-accent text-sm 
                              overflow-x-auto break-all">
                {commitment}
              </code>
              <button
                onClick={copyCommitment}
                className="bg-primary/20 hover:bg-primary/30 text-accent p-3 
                           rounded-xl transition-colors"
                title="Копіювати"
              >
                <HiClipboardCopy className="text-xl" />
              </button>
            </div>
          </div>

          {/* Інструкція */}
          <div className="bg-card border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <HiExclamation className="text-yellow-400 text-2xl mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">Що далі?</h3>
                <ol className="text-gray-400 space-y-2 text-sm list-decimal ml-4">
                  <li>
                    Скопіюйте ваш <strong className="text-white">commitment</strong> вище
                  </li>
                  <li>
                    Надішліть його <strong className="text-white">адміністратору</strong> голосування
                  </li>
                  <li>
                    Адмін додасть вас до групи виборців на блокчейні
                  </li>
                  <li>
                    Після цього ви зможете голосувати на сторінці
                    <strong className="text-accent"> "Голосувати"</strong>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Безпека */}
          <div className="bg-card border border-gray-700 rounded-2xl p-6">
            <h3 className="font-bold mb-3">🛡️ Безпека</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>✅ Секретний ключ зберігається тільки в localStorage вашого браузера</li>
              <li>✅ Commitment — це хеш, з якого неможливо відновити ключ</li>
              <li>✅ При голосуванні ZK-доказ генерується локально</li>
              <li>⚠️ Якщо очистите дані браузера — ключ буде втрачено!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
