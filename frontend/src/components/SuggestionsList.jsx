import { useState } from 'react'
import { LightbulbIcon, DocumentTextIcon, CheckIcon, ClipboardIcon, ShieldCheckIcon } from './Icons'

function SuggestionsList({ explanation = '', suggestions = [] }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!suggestions || suggestions.length === 0) return
    const textToCopy = `Resume Suggestions:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Explanation Quote Card */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/80 border border-blue-900/50 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2.5 mb-2">
          <LightbulbIcon className="w-5 h-5 text-blue-400 shrink-0" />
          <h3 className="text-sm font-bold text-blue-200 tracking-wide">
            Analysis Breakdown & Rationale
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7.5">
          {explanation || 'No detailed explanation provided.'}
        </p>
      </div>

      {/* Actionable Suggestions Card */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <DocumentTextIcon className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Actionable Resume Enhancements
              </h3>
              <p className="text-[11px] text-slate-400">
                Targeted recommendations to better present your existing qualifications
              </p>
            </div>
          </div>

          {suggestions.length > 0 && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardIcon className="w-3.5 h-3.5 text-slate-300" />}
              <span>{copied ? 'Copied!' : 'Copy Tips'}</span>
            </button>
          )}
        </div>

        {suggestions.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            No specific suggestions needed. Your resume matches the job description very closely!
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {suggestion}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheckIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Ethical AI Notice: These suggestions only optimize presentation of existing experience and never fabricate skills.
          </span>
        </div>
      </div>

    </div>
  )
}

export default SuggestionsList
