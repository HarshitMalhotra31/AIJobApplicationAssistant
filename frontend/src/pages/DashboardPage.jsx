import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/useAuth'
import {
  BarChartIcon,
  CheckIcon,
  TrendingUpIcon,
  TargetIcon,
  SpinnerIcon,
  AlertCircleIcon,
  ArrowRightIcon,
} from '../components/Icons'

function DashboardPage({ onSelectAnalysis }) {
  const { isGuest } = useAuth()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  async function fetchDashboardStats() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await axios.get('http://localhost:8000/api/dashboard')
      setData(res.data)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError('Could not connect to the backend server. Make sure MongoDB and Express are running.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleViewReport(id) {
    if (onSelectAnalysis) {
      axios
        .get(`http://localhost:8000/api/history/${id}`)
        .then((res) => {
          onSelectAnalysis(res.data)
          navigate('/')
        })
        .catch((err) => {
          console.error('Error fetching report:', err)
          navigate('/')
        })
    } else {
      navigate('/')
    }
  }

  function getScoreColor(score) {
    if (score >= 70) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  function getBadgeStyle(score) {
    if (score >= 70) return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
    if (score >= 40) return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
    return 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
        <SpinnerIcon className="w-8 h-8 text-blue-500 dark:text-blue-400 mb-3" />
        <p className="text-sm font-semibold text-slate-800 dark:text-white">Loading your job search metrics...</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Aggregating historical evaluation data from MongoDB</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 shadow-xl transition-colors">
        <div className="flex items-start gap-3">
          <AlertCircleIcon className="w-6 h-6 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">Unable to Load Dashboard</h3>
            <p className="text-xs text-rose-700 dark:text-rose-300/90 mt-1 leading-relaxed">{error}</p>
            <button
              onClick={fetchDashboardStats}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.totalAnalyses === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-xl backdrop-blur-md transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
          <BarChartIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {isGuest ? 'Guest Analytics Preview' : 'No Evaluations Recorded Yet'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
          {isGuest
            ? 'Analytics and historical benchmarks are compiled for registered accounts. Create a free account to track your average match score, aggregate missing skills, and monitor your application success!'
            : 'Run your first resume analysis against a job posting to unlock match trends, skill gap intelligence, and historical benchmarks.'}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isGuest ? (
            <>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                Create Free Account
              </Link>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                Back to Evaluation
              </Link>
            </>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>Evaluate Your First Job</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    )
  }

  const { totalAnalyses, avgMatchScore, minScore, maxScore, recommendations, topMissingSkills, topMatchedSkills, recentAnalyses } = data

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fadeIn">
      
      {/* Dashboard Title & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Job Search Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregate insights and qualification gaps across all evaluated positions
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>+ New Evaluation</span>
        </Link>
      </div>

      {/* 1. Top High-Level Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Evaluated */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg flex flex-col justify-between transition-colors">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Evaluated
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalAnalyses}
            </span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {totalAnalyses === 1 ? 'Job' : 'Jobs'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
            Stored permanently in MongoDB
          </span>
        </div>

        {/* Average Match Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg flex flex-col justify-between transition-colors">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Average Match Score
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-black ${getScoreColor(avgMatchScore)} tracking-tight`}>
              {avgMatchScore}%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Range: {minScore}% – {maxScore}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                avgMatchScore >= 70 ? 'bg-emerald-500' : avgMatchScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, avgMatchScore))}%` }}
            />
          </div>
        </div>

        {/* Apply Probability */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg flex flex-col justify-between transition-colors">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Strong Matches (APPLY)
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {recommendations.apply}
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400/80">
              {totalAnalyses ? Math.round((recommendations.apply / totalAnalyses) * 100) : 0}% of total
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
            Jobs where core criteria were met
          </span>
        </div>

        {/* Gaps / Skip Count */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg flex flex-col justify-between transition-colors">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Consider / Skip Ratio
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {recommendations.consider}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">consider</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {recommendations.skip}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">skip</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
            Requires upskilling or framing tweaks
          </span>
        </div>

      </div>

      {/* 2. Middle Section: Skill Gap Intelligence & Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Most Frequent Missing Skills (Skill Gap Matrix) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Recurring Missing Skills</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Skills most often missing in targeted job postings</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-800 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200/80 dark:border-rose-800/60">
                Action Items
              </span>
            </div>

            {topMissingSkills.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-6 text-center">
                No repeated missing skills detected across your applications.
              </p>
            ) : (
              <div className="space-y-3">
                {topMissingSkills.map((item) => (
                  <div key={item.skill} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-200 font-semibold">{item.skill}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {item.count} {item.count === 1 ? 'job' : 'jobs'} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-700"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
            💡 Prioritize learning or featuring these skills in your personal projects to unlock more matches.
          </p>
        </div>

        {/* Most Frequent Matched Skills (Strengths) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Consistent Core Strengths</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Your most frequently verified qualifications</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
                Verified
              </span>
            </div>

            {topMatchedSkills.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-6 text-center">
                No matching skills found yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {topMatchedSkills.map((item) => (
                  <div
                    key={item.skill}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs"
                  >
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{item.skill}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-mono">
                      {item.count}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
            ✨ These are your primary selling points when networking or reaching out to recruiters.
          </p>
        </div>

      </div>

      {/* 3. Bottom Section: Recent Applications */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Evaluation Records</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Latest job postings tested through the match engine</p>
          </div>
          <Link
            to="/"
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-bold transition-colors"
          >
            Start New →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {recentAnalyses.map((item) => (
            <div
              key={item._id}
              onClick={() => handleViewReport(item._id)}
              className="py-3.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4 group select-none"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors truncate">
                    {item.jobTitle || 'Untitled Position'}
                  </h4>
                  {item.companyName && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      • {item.companyName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{formatDate(item.createdAt)}</span>
                  <span>•</span>
                  <span>{item.matchedSkills?.length || 0} skills matched</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getBadgeStyle(
                    item.matchScore
                  )}`}
                >
                  {item.matchScore}% • {item.recommendation}
                </span>

                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  title="View report"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default DashboardPage
