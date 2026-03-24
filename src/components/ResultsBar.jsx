export default function ResultsBar({ label, count, total, color }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-lg font-semibold">{label}</span>
        <span className="text-gray-400">
          {count} голосів ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
