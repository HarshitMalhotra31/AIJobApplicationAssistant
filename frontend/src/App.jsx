import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { useTheme } from './context/useTheme'
import Navbar from './components/Navbar'
import HistoryDrawer from './components/HistoryDrawer'
import AnalyzePage from './pages/AnalyzePage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { SpinnerIcon, SunIcon, MoonIcon } from './components/Icons'

function AppContent() {
  const { isAuthenticated, isGuest, isLoading } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [activeAnalysis, setActiveAnalysis] = useState(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  function handleSelectAnalysis(analysis) {
    setActiveAnalysis(analysis)
  }

  // 1. Session check loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
        <SpinnerIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3 animate-spin" />
        <p className="text-xs font-semibold tracking-wide">Checking authentication...</p>
      </div>
    )
  }

  // 2. Unauthenticated Flow: Show login/register screen if neither logged in nor in guest mode
  if (!isAuthenticated && !isGuest) {
    return (
      <div className="min-h-screen bg-slate-50/90 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans relative selection:bg-blue-600 selection:text-white flex flex-col justify-center transition-colors duration-200">
        {/* Floating Top-Right Theme Toggle */}
        <div className="absolute top-5 right-5 z-20">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <SunIcon className="w-4 h-4 text-amber-400" />
            ) : (
              <MoonIcon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>

        {/* Ambient Atmosphere - Deep subtle glow in dark mode, pure luminous canvas in light mode */}
        <div className="fixed inset-0 hidden dark:block bg-[radial-gradient(ellipse_800px_450px_at_50%_-20%,rgba(30,58,138,0.18),transparent)] pointer-events-none" />
        <div className="fixed inset-0 hidden dark:block bg-[radial-gradient(ellipse_600px_400px_at_80%_80%,rgba(67,56,202,0.1),transparent)] pointer-events-none" />

        <main className="flex-1 relative z-10 flex items-center justify-center">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    )
  }

  // 3. Application Flow (Authenticated or Guest Mode with 2 free trials)
  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans relative selection:bg-blue-600 selection:text-white flex flex-col transition-colors duration-200">
      {/* Ambient Atmosphere - Deep subtle glow in dark mode, clean canvas in light mode */}
      <div className="fixed inset-0 hidden dark:block bg-[radial-gradient(ellipse_800px_450px_at_50%_-20%,rgba(30,58,138,0.18),transparent)] pointer-events-none" />
      <div className="fixed inset-0 hidden dark:block bg-[radial-gradient(ellipse_600px_400px_at_80%_80%,rgba(67,56,202,0.1),transparent)] pointer-events-none" />

      {/* Global Navigation Bar */}
      <Navbar onOpenHistory={() => setIsHistoryOpen(true)} />

      {/* Global History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectAnalysis={handleSelectAnalysis}
      />

      {/* Page Routes */}
      <main className="flex-1 relative z-10">
        <Routes>
          <Route
            path="/"
            element={
              <AnalyzePage
                initialResult={activeAnalysis}
                onClearResult={() => setActiveAnalysis(null)}
              />
            }
          />
          <Route
            path="/dashboard"
            element={<DashboardPage onSelectAnalysis={handleSelectAnalysis} />}
          />
          {/* If authenticated, redirect login/register to root. If guest, allow visiting login/register */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
