import { CheckIcon, ZapIcon, XIcon, PencilIcon, RefreshIcon } from './Icons'

function ScoreDisplay({
  matchScore = 0,
  recommendation = 'CONSIDER',
  stats,
  onEditInputs,
  onReset,
}) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, matchScore))
  const strokeDashoffset = circumference - (progress / 100) * circumference

  function getTheme() {
    if (progress >= 70) {
      return {
        stroke: '#10b981', // emerald-500
        textColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
        badgeIcon: CheckIcon,
        subtext: 'High match probability. Strong alignment with requirements.',
      }
    }
    if (progress >= 40) {
      return {
        stroke: '#f59e0b', // amber-500
        textColor: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
        badgeIcon: ZapIcon,
        subtext: 'Partial match. Core skills present with a few gaps.',
      }
    }
    return {
      stroke: '#f43f5e', // rose-500
      textColor: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
      badgeIcon: XIcon,
      subtext: 'Significant gaps in must-have requirements.',
    }
  }

  const theme = getTheme()
  const BadgeIconComponent = theme.badgeIcon

  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm dark:shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-5 transition-colors">
      
      {/* Left: Gauge + Recommendation + Description */}
      <div className="flex items-center gap-4.5 w-full md:w-auto">
        {/* Compact Circular SVG Gauge */}
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
            <circle
              cx="45"
              cy="45"
              r={radius}
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke={theme.stroke}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Score Label */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-xl font-black ${theme.textColor}`}>
              {progress}
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">%</span>
            </span>
          </div>
        </div>

        {/* Verdict Details */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeBg}`}
            >
              <BadgeIconComponent className="w-3.5 h-3.5" />
              <span>RECOMMENDATION: {recommendation}</span>
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Match Verdict</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-snug">{theme.subtext}</p>
        </div>
      </div>

      {/* Center/Right: Quick Metrics Chips */}
      {stats && (
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-center">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-3.5 py-2 text-center min-w-[75px] shadow-xs">
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block leading-tight">
              {stats.matchedCount}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Matched</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-3.5 py-2 text-center min-w-[75px] shadow-xs">
            <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 block leading-tight">
              {stats.missingCount}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Missing</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-3.5 py-2 text-center min-w-[85px] shadow-xs">
            <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 block leading-tight">
              {stats.mustHaveMet}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Must-Haves</span>
          </div>
        </div>
      )}

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {onEditInputs && (
          <button
            onClick={onEditInputs}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
          >
            <PencilIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Inputs</span>
          </button>
        )}
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-md shadow-blue-600/20 active:translate-y-0.5"
          >
            <RefreshIcon className="w-3.5 h-3.5 text-white" />
            <span>New Job</span>
          </button>
        )}
      </div>

    </div>
  )
}

export default ScoreDisplay
