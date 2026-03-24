import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Register from "./pages/Register"
import Vote from "./pages/Vote"
import Results from "./pages/Results"
import Admin from "./pages/Admin"

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-600 text-sm border-t border-gray-800">
        🗳️ ZK Anonymous Voting • Powered by Semaphore & Ethereum
      </footer>
    </div>
  )
}
