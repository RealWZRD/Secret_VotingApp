import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { connectWallet } from "../services/contract"

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Підключення гаманця
  const connect = useCallback(async () => {
    setIsConnecting(true)
    try {
      const addr = await connectWallet()
      setAccount(addr.toLowerCase())
    } catch (err) {
      console.error("Wallet connection failed:", err)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [])

  // Слухаємо зміни акаунту
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null)
      } else {
        setAccount(accounts[0].toLowerCase())
      }
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)

    // Перевіряємо чи вже підключено
    window.ethereum
      .request({ method: "eth_accounts" })
      .then(handleAccountsChanged)

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [])

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null

  return (
    <WalletContext.Provider value={{
      account,
      shortAddress,
      isConnecting,
      connect,
      isConnected: !!account
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) throw new Error("useWallet must be inside WalletProvider")
  return context
}
