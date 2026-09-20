import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'
import {
  DocumentTextIcon,
  LayoutDashboardIcon,
  HistoryIcon,
  SparklesIcon,
  ZapIcon,
  SunIcon,
  MoonIcon,
} from './Icons'

function Navbar({ onOpenHistory }) {
  const { user, isAuthenticated, isGuest, guestTrialsRemaining, logout, exitGuestMode } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-all shadow-sm shadow-blue-500/10">
            <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">
              AI Job Assistant
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase -mt-0.5">
              Match Engine
            </span>
          </div>
        </NavLink>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner transition-colors">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/60'
              }`
            }
          >
            <DocumentTextIcon className="w-3.5 h-3.5" />
            <span>Analyze</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/60'
              }`
            }
          >
            <LayoutDashboardIcon className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </NavLink>
        </nav>

        {/* Right Actions: Theme Toggle + History + User / Guest Status */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Light / Dark Mode Toggle Switch */}
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <SunIcon className="w-4 h-4 text-amber-400" />
            ) : (
              <MoonIcon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm transition-all cursor-pointer"
              title="Open evaluation history"
            >
              <HistoryIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}

          {isGuest ? (
            <div className="flex items-center gap-2 sm:pl-2 sm:border-l sm:border-slate-200 dark:sm:border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300">
                <ZapIcon className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                <span>{guestTrialsRemaining} {guestTrialsRemaining === 1 ? 'trial' : 'trials'} left</span>
              </span>
              <button
                onClick={() => navigate('/login')}
                type="button"
                className="hidden sm:inline-block px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                type="button"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  exitGuestMode()
                  navigate('/login')
                }}
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer transition-colors"
                title="Exit Guest Mode"
              >
                ✕
              </button>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2 sm:pl-2 sm:border-l sm:border-slate-200 dark:sm:border-slate-800">
              <div className="w-7 h-7 rounded-full bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 dark:border-blue-500/40 text-blue-600 dark:text-blue-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                {user?.name || user?.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                type="button"
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-800/60 transition-all cursor-pointer"
                title="Sign out of your account"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>

      </div>
    </header>
  )
}

export default Navbar
