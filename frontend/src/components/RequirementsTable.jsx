import { useState } from 'react'
import {
  CheckIcon,
  XIcon,
  TargetIcon,
  SparklesIcon,
  QuoteIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AlertCircleIcon,
} from './Icons'

function SkillRow({ skill, found, evidence, isExpanded, onToggle }) {
  return (
    <div className="flex flex-col py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60 last:border-0">
      <div
        className="flex items-center justify-between cursor-pointer select-none gap-2.5 group"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors shrink-0">
            {isExpanded ? (
              <ChevronUpIcon className="w-3.5 h-3.5" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5" />
            )}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {skill}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
            found
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/70'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/70'
          }`}
        >
          {found ? <CheckIcon className="w-3 h-3 shrink-0" /> : <XIcon className="w-3 h-3 shrink-0" />}
          <span>{found ? 'Met' : 'Missing'}</span>
        </span>
      </div>

      {/* Expandable Evidence / Gap Detail */}
      {isExpanded && evidence && (
        <div className="mt-2.5 pl-5 pr-1 animate-fadeIn">
          {found ? (
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 shadow-xs">
              <QuoteIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-emerald-900 dark:text-emerald-200 block text-[11px] uppercase tracking-wider mb-1">
                  Resume Evidence:
                </span>
                <p className="italic text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed font-sans text-xs">
                  "{evidence}"
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertCircleIcon className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-rose-900 dark:text-rose-200 block text-[11px] uppercase tracking-wider mb-1">
                  Gap Context:
                </span>
                <p className="text-rose-800/90 dark:text-rose-300/90 leading-relaxed text-xs">
                  {evidence}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RequirementsTable({ mustHave = [], niceToHave = [] }) {
  const mustHaveMet = mustHave.filter((i) => i.found).length
  const niceToHaveMet = niceToHave.filter((i) => i.found).length

  // By default, expand all items if total items <= 8 for easy reading
  const initialExpandedState = () => {
    const state = {}
    mustHave.forEach((_, idx) => {
      state[`must-${idx}`] = true
    })
    niceToHave.forEach((_, idx) => {
      state[`nice-${idx}`] = true
    })
    return state
  }

  const [expanded, setExpanded] = useState(initialExpandedState)

  const toggleRow = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleAll = (type, list, expand) => {
    setExpanded((prev) => {
      const next = { ...prev }
      list.forEach((_, idx) => {
        next[`${type}-${idx}`] = expand
      })
      return next
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">

      {/* Must Have (Dealbreakers) */}
      <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-lg flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Must-Have Qualifications</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Core non-negotiable requirements (75% score weight)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              {mustHaveMet} / {mustHave.length} met
            </span>
          </div>

          {mustHave.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4 text-center">
              No specific must-have requirements extracted.
            </p>
          ) : (
            <div className="flex flex-col">
              {mustHave.map((item, idx) => {
                const id = `must-${idx}`
                return (
                  <SkillRow
                    key={`${item.skill}-${idx}`}
                    skill={item.skill}
                    found={item.found}
                    evidence={item.evidence}
                    isExpanded={!!expanded[id]}
                    onToggle={() => toggleRow(id)}
                  />
                )
              })}
            </div>
          )}
        </div>

        {mustHave.length > 0 && (
          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => toggleAll('must', mustHave, true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
            >
              Expand all
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => toggleAll('must', mustHave, false)}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
            >
              Collapse all
            </button>
          </div>
        )}
      </div>

      {/* Nice to Have (Bonuses) */}
      <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-lg flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Nice-to-Have / Preferred</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Bonus skills that strengthen your candidacy (25% weight)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              {niceToHaveMet} / {niceToHave.length} met
            </span>
          </div>

          {niceToHave.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4 text-center">
              No optional/preferred requirements specified.
            </p>
          ) : (
            <div className="flex flex-col">
              {niceToHave.map((item, idx) => {
                const id = `nice-${idx}`
                return (
                  <SkillRow
                    key={`${item.skill}-${idx}`}
                    skill={item.skill}
                    found={item.found}
                    evidence={item.evidence}
                    isExpanded={!!expanded[id]}
                    onToggle={() => toggleRow(id)}
                  />
                )
              })}
            </div>
          )}
        </div>

        {niceToHave.length > 0 && (
          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => toggleAll('nice', niceToHave, true)}
              className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer font-medium"
            >
              Expand all
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => toggleAll('nice', niceToHave, false)}
              className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer font-medium"
            >
              Collapse all
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default RequirementsTable

