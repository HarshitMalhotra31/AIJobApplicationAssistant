import { useState } from 'react'
import { CheckIcon, XIcon, QuoteIcon, InfoIcon } from './Icons'

function SkillsList({ matchedSkills = [], missingSkills = [] }) {
  // Normalize matchedSkills items so each item is an object { skill, evidence }
  const normalizedMatched = matchedSkills.map((item) => {
    if (typeof item === 'object' && item !== null) {
      return {
        skill: item.skill || 'Unnamed Skill',
        evidence: item.evidence || '',
      }
    }
    return {
      skill: String(item),
      evidence: '',
    }
  })

  // Selected skill to inspect evidence
  const [selectedSkill, setSelectedSkill] = useState(() => {
    return normalizedMatched.find((s) => s.evidence) || normalizedMatched[0] || null
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">

      {/* Matched Skills */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">
                Strong Matches
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
              {normalizedMatched.length} {normalizedMatched.length === 1 ? 'skill' : 'skills'}
            </span>
          </div>

          {normalizedMatched.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4 text-center">
              No direct matching skills were identified.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {normalizedMatched.map((item) => {
                  const isSelected = selectedSkill?.skill === item.skill
                  const hasEvidence = Boolean(item.evidence)

                  return (
                    <button
                      key={item.skill}
                      type="button"
                      onClick={() => setSelectedSkill(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                          : 'bg-emerald-50/70 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border-emerald-200/80 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                      }`}
                      title={hasEvidence ? 'Click to inspect resume evidence' : item.skill}
                    >
                      <CheckIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                      <span>{item.skill}</span>
                      {hasEvidence && (
                        <QuoteIcon className={`w-2.5 h-2.5 shrink-0 ml-0.5 ${isSelected ? 'text-emerald-100' : 'text-emerald-600/70 dark:text-emerald-400/70'}`} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Evidence Inspector Callout */}
              {selectedSkill && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                      <QuoteIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Proof for "{selectedSkill.skill}":</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      Verified from Resume
                    </span>
                  </div>
                  <p className="italic text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pl-5 font-sans">
                    {selectedSkill.evidence
                      ? `"${selectedSkill.evidence}"`
                      : 'Verified from candidate profile and technical skills summary.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {normalizedMatched.length > 0 && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-3 flex items-center gap-1.5">
            <InfoIcon className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>Click any skill chip above to inspect its proof quote from the resume.</span>
          </p>
        )}
      </div>

      {/* Missing Skills */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">
                Missing / Unverified Skills
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
              {missingSkills.length} {missingSkills.length === 1 ? 'skill' : 'skills'}
            </span>
          </div>

          {missingSkills.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-4 px-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
              <CheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Outstanding! No critical skill gaps were detected.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs font-medium rounded-xl shadow-xs"
                >
                  <XIcon className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {missingSkills.length > 0 && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-3">
            Review these items against the Requirements Matrix for details on dealbreakers vs. nice-to-haves.
          </p>
        )}
      </div>

    </div>
  )
}

export default SkillsList

