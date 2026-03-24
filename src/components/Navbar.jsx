import { NavLink } from "react-router-dom"
import { HiHome, HiUserAdd, HiCheckCircle, HiChartBar, HiCog } from "react-icons/hi"
import WalletButton from "./WalletButton"

const links = [
  { to: "/", icon: HiHome, label: "Головна" },
  { to: "/register", icon: HiUserAdd, label: "Реєстрація" },
  { to: "/vote", icon: HiCheckCircle, label: "Голосувати" },
  { to: "/results", icon: HiChartBar, label: "Результати" },
  { to: "/admin", icon: HiCog, label: "Адмін" }
]

export default function Navbar() {
  return (
    <nav className="bg-card border-b border-gray-700 px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Логотип */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗳️</span>
          <span className="font-bold text-lg text-accent">ZK Vote</span>
        </div>

        {/* Навігація */}
        <div className="flex items-center gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive
                  ? "bg-primary/20 text-accent"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon className="text-lg" />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Гаманець */}
        <WalletButton />
      </div>
    </nav>
  )
}
