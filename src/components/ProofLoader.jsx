import { useState, useEffect } from "react"

const steps = [
  "Завантаження ZK-схеми...",
  "Побудова дерева Меркла...",
  "Обчислення witness...",
  "Генерація ZK-доказу...",
  "Фіналізація proof..."
]

export default function ProofLoader() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        const newStep = Math.floor((prev + 3) / 20)
        if (newStep !== step && newStep < steps.length) {
          setStep(newStep)
        }
        return prev + 2 + Math.random() * 3
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-card border border-accent/30 rounded-2xl p-8 text-center">
      {/* Анімована іконка */}
      <div className="text-6xl mb-4 animate-bounce">🔮</div>

      <h3 className="text-xl font-bold mb-2">Генерація ZK-доказу</h3>
      <p className="text-gray-400 text-sm mb-6">
        Доказ генерується локально у вашому браузері.
        <br />Секретний ключ нікуди не відправляється.
      </p>

      {/* Прогрес-бар */}
      <div className="w-full bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-accent h-full rounded-full 
                     transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <p className="text-accent text-sm font-mono">
        {steps[step]} {Math.round(Math.min(progress, 99))}%
      </p>
    </div>
  )
}
