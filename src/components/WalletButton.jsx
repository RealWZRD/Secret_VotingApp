import { useWallet } from "../context/WalletContext"
import { HiLightningBolt } from "react-icons/hi"

export default function WalletButton() {
  const { isConnected, shortAddress, isConnecting, connect } = useWallet()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 
                      text-green-400 px-4 py-2 rounded-xl text-sm">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        🦊 {shortAddress}
      </div>
    )
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-primary hover:bg-primary/80 
                 text-white px-4 py-2 rounded-xl text-sm transition-colors
                 disabled:opacity-50"
    >
      <HiLightningBolt />
      {isConnecting ? "Підключення..." : "Підключити"}
    </button>
  )
}
