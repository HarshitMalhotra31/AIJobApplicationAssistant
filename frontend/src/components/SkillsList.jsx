import { CheckIcon, XIcon } from './Icons'

function SkillsList({ matchedSkills = [], missingSkills = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">

      {/* Matched Skills */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-900/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                Strong Matches
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
              {matchedSkills.length} {matchedSkills.length === 1 ? 'skill' : 'skills'}
            </span>
          </div>

          {matchedSkills.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No direct matching skills were identified.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-medium rounded-lg shadow-xs"
                >
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Missing Skills */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-rose-900/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                Missing / Unverified Skills
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80">
              {missingSkills.length} {missingSkills.length === 1 ? 'skill' : 'skills'}
            </span>
          </div>

          {missingSkills.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-4 px-3 text-xs text-emerald-400 font-medium bg-emerald-950/30 rounded-xl border border-emerald-900/50">
              <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Outstanding! No critical skill gaps were detected.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-medium rounded-lg shadow-xs"
                >
                  <XIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default SkillsList
