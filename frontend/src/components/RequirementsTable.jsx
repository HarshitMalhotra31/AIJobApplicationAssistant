import { CheckIcon, XIcon, TargetIcon, SparklesIcon } from './Icons'

function RequirementsTable({ mustHave = [], niceToHave = [] }) {
  const mustHaveMet = mustHave.filter((i) => i.found).length
  const niceToHaveMet = niceToHave.filter((i) => i.found).length

  function SkillRow({ skill, found }) {
    return (
      <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-800/60 transition-colors border-b border-slate-800/60 last:border-0">
        <span className="text-xs sm:text-sm font-medium text-slate-300">{skill}</span>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            found
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/70'
              : 'bg-rose-950/60 text-rose-400 border border-rose-800/70'
          }`}
        >
          {found ? <CheckIcon className="w-3 h-3 shrink-0" /> : <XIcon className="w-3 h-3 shrink-0" />}
          <span>{found ? 'Met' : 'Missing'}</span>
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">

      {/* Must Have (Dealbreakers) */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TargetIcon className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Must-Have Qualifications</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Core non-negotiable requirements</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
            {mustHaveMet} / {mustHave.length} met
          </span>
        </div>

        {mustHave.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            No specific must-have requirements extracted.
          </p>
        ) : (
          <div className="flex flex-col">
            {mustHave.map((item, idx) => (
              <SkillRow key={`${item.skill}-${idx}`} skill={item.skill} found={item.found} />
            ))}
          </div>
        )}
      </div>

      {/* Nice to Have (Bonuses) */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Nice-to-Have / Preferred</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Bonus skills that strengthen your candidacy</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
            {niceToHaveMet} / {niceToHave.length} met
          </span>
        </div>

        {niceToHave.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            No optional/preferred requirements specified.
          </p>
        ) : (
          <div className="flex flex-col">
            {niceToHave.map((item, idx) => (
              <SkillRow key={`${item.skill}-${idx}`} skill={item.skill} found={item.found} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default RequirementsTable
