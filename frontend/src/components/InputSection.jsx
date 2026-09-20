import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/useAuth'
import {
  ZapIcon,
  XIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  SpinnerIcon,
  SearchIcon,
  UploadIcon,
  CheckIcon,
  AlertCircleIcon,
  LinkIcon,
  GlobeIcon,
  ArrowRightIcon,
} from './Icons'

const SAMPLE_RESUME = `Alex Chen — Senior Full-Stack Engineer
Email: alex.chen@example.com | GitHub: github.com/alexchen | LinkedIn: linkedin.com/in/alexchen

SUMMARY
Experienced Full-Stack Engineer with 5+ years building scalable web applications. Strong expertise in React, TypeScript, Node.js, and RESTful API architecture. Proven track record improving performance and team velocity.

TECHNICAL SKILLS
• Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3/Tailwind CSS, Python, SQL
• Frontend: React, Next.js, Redux Toolkit, Tailwind CSS, Responsive Design, Webpack
• Backend: Node.js, Express, REST APIs, PostgreSQL, MongoDB, Redis
• Tools & DevOps: Git, Docker, CI/CD (GitHub Actions), Jest, AWS (S3, EC2)

EXPERIENCE
Senior Software Engineer | CloudScale Inc. (2022 - Present)
• Architected React + TypeScript micro-frontends serving 150K+ daily active users.
• Improved frontend Core Web Vitals by 38% through code-splitting and asset optimization.
• Mentored 4 junior engineers and conducted weekly code reviews.

Software Engineer | DevPulse Technologies (2020 - 2022)
• Developed responsive client dashboards using React, Tailwind CSS, and Node.js.
• Built secure REST endpoints with Express and PostgreSQL handling 2M+ monthly requests.`

const SAMPLE_JOB = `Job Title: Senior Frontend / Full-Stack Engineer
Company: Apex Innovations
Location: Remote (US / Global)

About the Role:
We are seeking an experienced Full-Stack Engineer with strong React and Node.js skills to lead frontend architecture and collaborate on scalable APIs.

Must-Have Requirements:
• 4+ years professional software development experience
• Deep proficiency in React, TypeScript, and modern CSS (Tailwind CSS)
• Strong backend experience with Node.js and Express
• Demonstrated experience designing and integrating RESTful APIs
• Experience with Git, testing (Jest/Cypress), and CI/CD pipelines

Nice-to-Have Requirements:
• Experience with GraphQL APIs
• Experience with Docker and AWS cloud deployments
• Background working in fast-paced remote startup environments`

function InputSection({ onAnalyze, isLoading = false }) {
  const { isGuest, guestTrialsRemaining, recordGuestTrial } = useAuth()
  const navigate = useNavigate()

  const [resume, setResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  // URL Scraping state
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [jobUrl, setJobUrl] = useState('')
  const [isFetchingUrl, setIsFetchingUrl] = useState(false)
  const [urlError, setUrlError] = useState(null)
  const [fetchedJobInfo, setFetchedJobInfo] = useState(null)

  // Guest trial limit modal state
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false)

  const fileInputRef = useRef(null)

  function handleLoadSample() {
    setResume(SAMPLE_RESUME)
    setJobDescription(SAMPLE_JOB)
    setUploadedFileName(null)
    setUploadError(null)
    setFetchedJobInfo(null)
    setUrlError(null)
    setShowUrlInput(false)
  }

  function handleClear() {
    setResume('')
    setJobDescription('')
    setUploadedFileName(null)
    setUploadError(null)
    setFetchedJobInfo(null)
    setUrlError(null)
    setJobUrl('')
    setShowUrlInput(false)
  }

  async function handleFetchJobUrl(e) {
    if (e) e.preventDefault()
    let trimmedUrl = jobUrl.trim()
    if (!trimmedUrl) return

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      trimmedUrl = 'https://' + trimmedUrl
    }

    setUrlError(null)
    setIsFetchingUrl(true)

    try {
      const res = await axios.post('http://localhost:8000/api/scrape/job', {
        url: trimmedUrl,
      })

      setJobDescription(res.data.text)
      setFetchedJobInfo({
        title: res.data.title || trimmedUrl,
        url: res.data.url,
        wordCount: res.data.wordCount,
      })
      setJobUrl('')
      setShowUrlInput(false)
    } catch (err) {
      setUrlError(
        err.response?.data?.error ||
        err.message ||
        'Failed to extract job text from this URL. Please paste manually.'
      )
    } finally {
      setIsFetchingUrl(false)
    }
  }

  async function processPdf(file) {
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Please select a valid .pdf file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds 5MB limit. Please upload a smaller PDF.')
      return
    }

    setUploadError(null)
    setIsUploadingPdf(true)

    const formData = new FormData()
    formData.append('resumePdf', file)

    try {
      const res = await axios.post('http://localhost:8000/api/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResume(res.data.text)
      setUploadedFileName(
        `${res.data.filename} (${res.data.pageCount} ${
          res.data.pageCount === 1 ? 'page' : 'pages'
        })`
      )
    } catch (err) {
      setUploadError(
        err.response?.data?.error ||
        err.message ||
        'Failed to extract text from PDF. Make sure the file is readable.'
      )
    } finally {
      setIsUploadingPdf(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      processPdf(file)
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processPdf(file)
    }
  }

  function getStats(text) {
    const chars = text.length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    return { chars, words }
  }

  const resumeStats = getStats(resume)
  const jobStats = getStats(jobDescription)

  async function handleAnalyze() {
    if (!resume.trim() || !jobDescription.trim()) {
      alert('Please provide both your resume and a job description before analyzing.')
      return
    }

    if (isGuest && guestTrialsRemaining <= 0) {
      setShowGuestLimitModal(true)
      return
    }

    await onAnalyze(resume, jobDescription)

    if (isGuest) {
      recordGuestTrial()
    }
  }

  return (
    <div className="w-full">
      {/* Guest Mode Notification Banner */}
      {isGuest && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 dark:text-amber-200 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <ZapIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-amber-950 dark:text-white">Guest Evaluation Mode: </span>
              <span>
                You have <strong className="text-amber-800 dark:text-amber-300 font-bold underline underline-offset-2">{guestTrialsRemaining} of 2</strong> free trial evaluations remaining.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Link
              to="/register"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-200 border border-amber-600 dark:border-amber-500/40 shadow-xs transition-all"
            >
              Unlock Unlimited
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Input Documents
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            disabled={isLoading || isUploadingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <ZapIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Try Sample Demo</span>
          </button>
          {(resume || jobDescription) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading || isUploadingPdf}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <XIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Two text areas side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Resume Input with PDF Upload Support */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border shadow-sm dark:shadow-xl p-6 flex flex-col justify-between transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-4 ring-blue-500/10'
              : 'border-slate-200/90 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Your Resume</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploadingPdf}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/70 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                title="Upload a .pdf resume file"
              >
                {isUploadingPdf ? (
                  <>
                    <SpinnerIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Upload PDF</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
                {resumeStats.words}w • {resumeStats.chars}c
              </span>
            </div>
          </div>

          {/* Upload Success Badge */}
          {uploadedFileName && (
            <div className="mb-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 flex items-center justify-between text-xs text-blue-800 dark:text-blue-300 animate-fadeIn">
              <span className="flex items-center gap-1.5 truncate">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">PDF: {uploadedFileName}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setUploadedFileName(null)
                  setResume('')
                }}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                title="Remove uploaded resume"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Upload Error Banner */}
          {uploadError && (
            <div className="mb-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
              <AlertCircleIcon className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <textarea
            className="w-full h-64 p-4 bg-slate-50/60 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 disabled:bg-slate-100/60 dark:disabled:bg-slate-900/40 disabled:cursor-not-allowed font-mono transition-all"
            placeholder="Paste your resume text here, or click 'Upload PDF' above (or drag and drop a .pdf file here)..."
            value={resume}
            disabled={isLoading || isUploadingPdf}
            onChange={(e) => {
              setResume(e.target.value)
              if (uploadedFileName) setUploadedFileName(null)
            }}
          />
        </div>

        {/* Job Description Input with URL Fetching */}
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm dark:shadow-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Job Description</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(!showUrlInput)
                  setUrlError(null)
                }}
                disabled={isLoading || isFetchingUrl}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 ${
                  showUrlInput
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                    : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 border-slate-200 dark:border-slate-700 shadow-xs'
                }`}
                title="Extract job description from a posting URL"
              >
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Fetch from URL</span>
              </button>

              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
                {jobStats.words}w • {jobStats.chars}c
              </span>
            </div>
          </div>

          {/* Interactive URL Input Form */}
          {showUrlInput && (
            <form
              onSubmit={handleFetchJobUrl}
              className="mb-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-indigo-500/40 flex items-center gap-2 shadow-xs animate-fadeIn"
            >
              <div className="relative flex-1">
                <GlobeIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="Paste URL (e.g. LinkedIn, Indeed, Lever)..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={isFetchingUrl || !jobUrl.trim()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isFetchingUrl ? (
                  <>
                    <SpinnerIcon className="w-3.5 h-3.5 text-white animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightIcon className="w-3.5 h-3.5 text-white" />
                    <span>Extract</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false)
                  setUrlError(null)
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                title="Cancel"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* URL Extraction Success Badge */}
          {fetchedJobInfo && (
            <div className="mb-2 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between text-xs text-indigo-800 dark:text-indigo-300 animate-fadeIn">
              <span className="flex items-center gap-1.5 truncate">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  Extracted: {fetchedJobInfo.title || fetchedJobInfo.url} ({fetchedJobInfo.wordCount} words)
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setFetchedJobInfo(null)
                  setJobDescription('')
                }}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-0.5 transition-colors cursor-pointer shrink-0 ml-2"
                title="Remove extracted job text"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* URL Extraction Error Banner */}
          {urlError && (
            <div className="mb-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
              <AlertCircleIcon className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{urlError}</span>
            </div>
          )}

          <textarea
            className="w-full h-64 p-4 bg-slate-50/60 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 disabled:bg-slate-100/60 dark:disabled:bg-slate-900/40 disabled:cursor-not-allowed font-mono transition-all"
            placeholder="Paste the job requirements and description here, or click 'Fetch from URL' above..."
            value={jobDescription}
            disabled={isLoading || isFetchingUrl}
            onChange={(e) => {
              setJobDescription(e.target.value)
              if (fetchedJobInfo) setFetchedJobInfo(null)
            }}
          />
        </div>

      </div>

      {/* Analyze Button */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-2xl shadow-md shadow-blue-600/20 dark:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2.5 text-sm sm:text-base cursor-pointer active:translate-y-0.5"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-5 h-5 animate-spin" />
              <span>Analyzing Match with AI...</span>
            </>
          ) : (
            <>
              <SearchIcon className="w-5 h-5" />
              <span>
                {isGuest && guestTrialsRemaining <= 0
                  ? 'Trial Limit Reached (2/2 Used)'
                  : isGuest
                  ? `Evaluate Match Probability (${guestTrialsRemaining} free ${
                      guestTrialsRemaining === 1 ? 'trial' : 'trials'
                    } left)`
                  : 'Evaluate Match Probability'}
              </span>
            </>
          )}
        </button>

        {isGuest && guestTrialsRemaining <= 0 && (
          <p className="text-xs text-amber-400 font-semibold">
            You have used all 2 free trials.{' '}
            <Link to="/register" className="underline hover:text-amber-300 font-bold">
              Sign up for free
            </Link>{' '}
            to get unlimited evaluations!
          </p>
        )}
      </div>

      {/* Free Trial Limit Reached Modal */}
      {showGuestLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm shadow-amber-500/10">
              <ZapIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Free Trial Limit Reached (2/2 Used)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              You have completed your 2 free guest evaluations! Create a free account to unlock unlimited AI match evaluations, permanent history, and analytics.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                Create Free Account (Unlimited)
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Sign In to Existing Account
              </button>
              <button
                type="button"
                onClick={() => setShowGuestLimitModal(false)}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 pt-1 cursor-pointer transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default InputSection
