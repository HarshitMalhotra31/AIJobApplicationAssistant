import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/useAuth'
import {
  HistoryIcon,
  XIcon,
  TrashIcon,
  SpinnerIcon,
  CheckIcon,
  AlertCircleIcon,
  ZapIcon,
} from './Icons'

function HistoryDrawer({ isOpen, onClose, onSelectAnalysis }) {
  const { isGuest } = useAuth()
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingId, setLoadingId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && !isGuest) {
      fetchHistory()
    }
  }, [isOpen, isGuest])

  async function fetchHistory() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await axios.get('http://localhost:8000/api/history')
      setHistory(res.data)
    } catch (err) {
      console.error('Fetch history error:', err)
      setError('Could not load history. Make sure the server and MongoDB are running.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSelect(id) {
    setLoadingId(id)
    try {
      const res = await axios.get(`http://localhost:8000/api/history/${id}`)
      onSelectAnalysis(res.data)
      onClose()
    } catch (err) {
      console.error('Select analysis error:', err)
      alert('Failed to load this analysis report. Please try again.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this evaluation from your history?')) {
      return
    }

    try {
      await axios.delete(`http://localhost:8000/api/history/${id}`)
      setHistory((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      console.error('Delete analysis error:', err)
      alert('Failed to delete history item.')
    }
  }

  function getBadgeStyle(score) {
    if (score >= 70) {
      return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
    }
    if (score >= 40) {
      return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
    }
    return 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/50 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-colors">

          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <HistoryIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Evaluation History</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {history.length} {history.length === 1 ? 'saved report' : 'saved reports'} in MongoDB
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close history"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {isGuest ? (
              <div className="p-6 rounded-3xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 text-center space-y-3 my-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                  <ZapIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Guest Mode Active</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Evaluation history is not saved in Guest Mode. Create a free account to permanently save, compare, and reopen all your evaluations!
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all text-center"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center border border-slate-200 dark:border-slate-700"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
                <SpinnerIcon className="w-7 h-7 text-blue-500 dark:text-blue-400 mb-3" />
                <p className="text-xs">Fetching past analyses from MongoDB...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircleIcon className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <HistoryIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No evaluations saved yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Run your first resume analysis and it will be saved here automatically!
                </p>
              </div>
            ) : (
              history.map((item) => {
                const isItemLoading = loadingId === item._id
                return (
                  <div
                    key={item._id}
                    onClick={() => handleSelect(item._id)}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500/40 transition-all cursor-pointer group shadow-xs flex flex-col gap-2.5"
                  >
                    {/* Top Row: Title & Score Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors truncate">
                          {item.jobTitle}
                        </h3>
                        {item.companyName && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.companyName}</p>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${getBadgeStyle(
                          item.matchScore
                        )}`}
                      >
                        {item.matchScore}% • {item.recommendation}
                      </span>
                    </div>

                    {/* Middle Row: Key Stats */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckIcon className="w-3 h-3" />
                        {item.matchedCount} matched
                      </span>
                      <span>•</span>
                      <span>{item.missingCount} gaps</span>
                      <span>•</span>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] ml-auto">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/40 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center gap-1">
                        {isItemLoading ? (
                          <>
                            <SpinnerIcon className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                            <span>Loading report...</span>
                          </>
                        ) : (
                          <span>Load this report →</span>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item._id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete from history"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Drawer Footer */}
          {history.length > 0 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center">
              <button
                onClick={fetchHistory}
                disabled={isLoading}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer font-medium"
              >
                ↻ Refresh History List
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default HistoryDrawer
