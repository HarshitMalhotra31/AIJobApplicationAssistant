import { useState } from 'react'
import axios from 'axios'
import InputSection from '../components/InputSection'
import ResultSection from '../components/ResultSection'
import { BarChartIcon, PencilIcon, SpinnerIcon, AlertCircleIcon } from '../components/Icons'

function AnalyzePage({ initialResult = null, onClearResult }) {
  const [result, setResult] = useState(initialResult)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState(initialResult ? 'results' : 'input') // 'input' | 'results'
  const [prevInitial, setPrevInitial] = useState(initialResult)

  if (initialResult !== prevInitial) {
    setPrevInitial(initialResult)
    if (initialResult) {
      setResult(initialResult)
      setCurrentView('results')
    }
  }

  async function handleAnalyze(resume, jobDescription) {
    setError(null)
    setIsLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/api/analyze', {
        resume,
        jobDescription,
      })

      setResult(response.data)
      // Switch view to results at the top of the viewport (no scrolling needed!)
      setCurrentView('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Something went wrong. Please make sure the backend server is running.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError(null)
    setCurrentView('input')
    onClearResult?.()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="relative z-10 text-center max-w-2xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">
          Resume vs. Job Match Engine
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
          Compare your resume against any job description to get an honest, explainable breakdown:
          <span className="font-semibold text-blue-600 dark:text-blue-400"> Should you apply?</span>
        </p>
      </div>

      {/* Top View Mode Switcher (Active when results are available) */}
      {result && (
        <div className="relative z-10 flex items-center justify-center mb-6">
          <div className="inline-flex p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl backdrop-blur-md">
            <button
              onClick={() => setCurrentView('results')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                currentView === 'results'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChartIcon className="w-3.5 h-3.5" />
              <span>Evaluation Breakdown</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentView === 'results' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {result.matchScore}% • {result.recommendation}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('input')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'input'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PencilIcon className="w-3.5 h-3.5" />
              <span>Edit Inputs</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* View 1: Input Documents */}
        {currentView === 'input' && (
          <div className="flex flex-col gap-6">
            <InputSection onAnalyze={handleAnalyze} isLoading={isLoading} />
            {result && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setCurrentView('results')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold underline underline-offset-4 cursor-pointer"
                >
                  ← Return to Current Evaluation Report ({result.matchScore}%)
                </button>
              </div>
            )}
          </div>
        )}

        {/* View 2: Evaluation Report */}
        {currentView === 'results' && result && (
          <ResultSection
            result={result}
            onReset={handleReset}
            onEditInputs={() => setCurrentView('input')}
          />
        )}

        {/* Loading Overlay/Card */}
        {isLoading && (
          <div className="mt-8 p-8 bg-white/95 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-500/30 rounded-2xl shadow-xl text-center backdrop-blur-md">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3 border border-blue-200 dark:border-blue-500/20">
              <SpinnerIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Evaluating candidate match with Gemini AI...
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1">
              Analyzing must-have qualifications, matching skills, and generating tailored suggestions.
            </p>
            <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mt-4 overflow-hidden">
              <div className="w-full h-full bg-blue-600 rounded-full animate-progress"></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3 shadow-sm">
            <AlertCircleIcon className="w-5 h-5 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-800 dark:text-rose-200">Analysis Failed</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AnalyzePage
