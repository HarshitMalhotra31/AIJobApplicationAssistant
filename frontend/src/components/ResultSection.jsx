import { useState } from 'react'
import ScoreDisplay from './ScoreDisplay'
import SkillsList from './SkillsList'
import RequirementsTable from './RequirementsTable'
import SuggestionsList from './SuggestionsList'
import { TagIcon, TargetIcon, LightbulbIcon } from './Icons'

function ResultSection({ result, onReset, onEditInputs }) {
  const [activeTab, setActiveTab] = useState('skills')
  const [showAll, setShowAll] = useState(false)

  if (!result) return null

  const stats = {
    matchedCount: result.matchedSkills?.length || 0,
    missingCount: result.missingSkills?.length || 0,
    mustHaveMet: `${(result.mustHave || []).filter((i) => i.found).length} / ${
      (result.mustHave || []).length
    }`,
  }

  const tabs = [
    { id: 'skills', label: 'Skills Breakdown', count: `${stats.matchedCount} matched`, Icon: TagIcon },
    { id: 'requirements', label: 'Requirements Matrix', count: stats.mustHaveMet, Icon: TargetIcon },
    { id: 'suggestions', label: 'AI Improvement Tips', count: `${result.suggestions?.length || 0} tips`, Icon: LightbulbIcon },
  ]

  return (
    <div className="w-full flex flex-col gap-5 animate-fadeIn">

      {/* 1. Anchored Top Match Verdict Hero Banner (Never shifts or moves down) */}
      <ScoreDisplay
        matchScore={result.matchScore}
        recommendation={result.recommendation}
        stats={stats}
        onEditInputs={onEditInputs}
        onReset={onReset}
      />

      {/* 2. Full-Width Tab Navigation */}
      <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 p-1.5 rounded-2xl shadow-xs transition-colors">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const TabIcon = tab.Icon
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setShowAll(false)
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive && !showAll
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isActive && !showAll
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. Full-Width Detailed Content Panels */}
      <div className="w-full">
        {!showAll && activeTab === 'skills' && (
          <SkillsList
            matchedSkills={result.matchedSkills}
            missingSkills={result.missingSkills}
          />
        )}

        {!showAll && activeTab === 'requirements' && (
          <RequirementsTable
            mustHave={result.mustHave}
            niceToHave={result.niceToHave}
          />
        )}

        {!showAll && activeTab === 'suggestions' && (
          <SuggestionsList
            explanation={result.explanation}
            suggestions={result.suggestions}
          />
        )}

        {showAll && (
          <div className="flex flex-col gap-6">
            <SkillsList
              matchedSkills={result.matchedSkills}
              missingSkills={result.missingSkills}
            />
            <RequirementsTable
              mustHave={result.mustHave}
              niceToHave={result.niceToHave}
            />
            <SuggestionsList
              explanation={result.explanation}
              suggestions={result.suggestions}
            />
          </div>
        )}
      </div>

      {/* Toggle between compact tabbed mode & expanded view */}
      <div className="text-center pt-2">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium underline underline-offset-4 cursor-pointer transition-colors"
        >
          {showAll ? '← Switch to Clean Tabbed View' : '↓ View All Detailed Sections Expanded'}
        </button>
      </div>

    </div>
  )
}

export default ResultSection
