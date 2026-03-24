export default function VoteCard({ emoji, label, description, selected, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 p-8 rounded-2xl border-2 transition-all duration-300
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
        ${selected
          ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
          : "border-gray-600 bg-card hover:border-gray-400"
        }
      `}
    >
      <div className="text-5xl mb-3">{emoji}</div>
      <div className="text-xl font-bold mb-1">{label}</div>
      <div className="text-gray-400 text-sm">{description}</div>
    </button>
  )
}
