import { useState } from 'react'
import { ZapIcon, XIcon, DocumentTextIcon, BriefcaseIcon, SpinnerIcon, SearchIcon } from './Icons'

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
  const [resume, setResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  function handleLoadSample() {
    setResume(SAMPLE_RESUME)
    setJobDescription(SAMPLE_JOB)
  }

  function handleClear() {
    setResume('')
    setJobDescription('')
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

    await onAnalyze(resume, jobDescription)
  }

  return (
    <div className="w-full">
      {/* Quick Actions Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Input Documents
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-950/60 text-blue-300 hover:bg-blue-900/70 border border-blue-800/80 transition-all cursor-pointer disabled:opacity-50"
          >
            <ZapIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Try Sample Demo</span>
          </button>
          {(resume || jobDescription) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <XIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Two text areas side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Resume Input */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4 text-blue-400" />
              <span>Your Resume</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {resumeStats.words} words • {resumeStats.chars} chars
            </span>
          </div>
          <textarea
            className="w-full h-64 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/80 disabled:bg-slate-900/40 disabled:cursor-not-allowed font-mono transition-all"
            placeholder="Paste your resume text here (experience, skills, projects)..."
            value={resume}
            disabled={isLoading}
            onChange={(e) => setResume(e.target.value)}
          />
        </div>

        {/* Job Description Input */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-indigo-400" />
              <span>Job Description</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {jobStats.words} words • {jobStats.chars} chars
            </span>
          </div>
          <textarea
            className="w-full h-64 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/80 disabled:bg-slate-900/40 disabled:cursor-not-allowed font-mono transition-all"
            placeholder="Paste the job requirements and description here..."
            value={jobDescription}
            disabled={isLoading}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

      </div>

      {/* Analyze Button */}
      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2.5 text-sm sm:text-base cursor-pointer active:scale-98"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-5 h-5 animate-spin" />
              <span>Analyzing Match with AI...</span>
            </>
          ) : (
            <>
              <SearchIcon className="w-5 h-5" />
              <span>Evaluate Match Probability</span>
            </>
          )}
        </button>
      </div>

    </div>
  )
}

export default InputSection
