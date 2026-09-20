import { GoogleGenAI } from '@google/genai'

const ANALYSIS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    matchScore: {
      type: 'INTEGER',
      description:
        'Calculated match score from 0 to 100 based on weighted requirements (must-haves carry 75% weight, nice-to-haves carry 25% weight)',
    },
    recommendation: {
      type: 'STRING',
      enum: ['APPLY', 'CONSIDER', 'SKIP'],
      description:
        'Recommendation: APPLY (>=70% with core must-haves met), CONSIDER (40-69%), or SKIP (<40% or dealbreakers missing)',
    },
    matchedSkills: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          skill: { type: 'STRING', description: 'Name of the matched skill' },
          evidence: {
            type: 'STRING',
            description: 'Verbatim quote or project proof from resume showing this skill in practical use',
          },
        },
        required: ['skill', 'evidence'],
      },
      description: 'Skills present in both resume and job description, with verified evidence from the resume',
    },
    missingSkills: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Required or preferred skills missing or unverified from the resume',
    },
    mustHave: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          skill: { type: 'STRING', description: 'Core mandatory requirement from the job posting' },
          found: { type: 'BOOLEAN', description: 'Whether the candidate satisfies this mandatory requirement' },
          evidence: {
            type: 'STRING',
            description:
              'Direct quote/proof from resume if found, or concise explanation of why it is missing or unverified',
          },
        },
        required: ['skill', 'found', 'evidence'],
      },
      description: 'Mandatory non-negotiable requirements extracted from the job description',
    },
    niceToHave: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          skill: { type: 'STRING', description: 'Bonus or preferred qualification from the job posting' },
          found: { type: 'BOOLEAN', description: 'Whether the candidate satisfies this bonus qualification' },
          evidence: {
            type: 'STRING',
            description:
              'Direct quote/proof from resume if found, or concise explanation of why it is missing or unverified',
          },
        },
        required: ['skill', 'found', 'evidence'],
      },
      description: 'Preferred bonus qualifications from the job description',
    },
    explanation: {
      type: 'STRING',
      description: 'Objective, evidence-based evaluation summary explaining the score and verdict',
    },
    suggestions: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description:
        'Targeted improvement suggestions that cite specific points in the resume to better present existing experience without fabricating any skills',
    },
  },
  required: [
    'matchScore',
    'recommendation',
    'matchedSkills',
    'missingSkills',
    'mustHave',
    'niceToHave',
    'explanation',
    'suggestions',
  ],
}

/**
 * Normalizes and validates the AI response object, ensuring strict types,
 * bounded values, deduplicated lists, and evidence preservation.
 */
export function normalizeAndValidateAnalysis(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Analysis result must be a valid JSON object.')
  }

  // 1. Clamp match score between 0 and 100
  let matchScore = typeof data.matchScore === 'number' ? Math.round(data.matchScore) : 0
  matchScore = Math.max(0, Math.min(100, matchScore))

  // 2. Validate recommendation enum
  let recommendation = typeof data.recommendation === 'string' ? data.recommendation.toUpperCase() : ''
  if (!['APPLY', 'CONSIDER', 'SKIP'].includes(recommendation)) {
    if (matchScore >= 70) recommendation = 'APPLY'
    else if (matchScore >= 40) recommendation = 'CONSIDER'
    else recommendation = 'SKIP'
  }

  // 3. Normalize matched skills (supports both { skill, evidence } objects and legacy string arrays)
  const sanitizeMatchedSkills = (arr) => {
    if (!Array.isArray(arr)) return []
    const seen = new Set()
    const result = []

    for (const item of arr) {
      if (typeof item === 'string') {
        const skillName = item.trim()
        if (skillName && !seen.has(skillName.toLowerCase())) {
          seen.add(skillName.toLowerCase())
          result.push({ skill: skillName, evidence: '' })
        }
      } else if (item && typeof item === 'object') {
        const skillName = String(item.skill || '').trim()
        const evidence = String(item.evidence || '').trim()
        if (skillName && !seen.has(skillName.toLowerCase())) {
          seen.add(skillName.toLowerCase())
          result.push({ skill: skillName, evidence })
        }
      }
    }
    return result
  }

  // 4. Normalize string arrays (missingSkills, suggestions)
  const sanitizeStringArray = (arr) => {
    if (!Array.isArray(arr)) return []
    return Array.from(new Set(arr.map((s) => String(s).trim()).filter(Boolean)))
  }

  const matchedSkills = sanitizeMatchedSkills(data.matchedSkills)
  const missingSkills = sanitizeStringArray(data.missingSkills)
  const suggestions = sanitizeStringArray(data.suggestions)

  // 5. Normalize requirement tables with evidence
  const sanitizeRequirements = (arr) => {
    if (!Array.isArray(arr)) return []
    return arr
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        skill: String(item.skill || '').trim(),
        found: Boolean(item.found),
        evidence: String(item.evidence || '').trim(),
      }))
      .filter((item) => item.skill.length > 0)
  }

  const mustHave = sanitizeRequirements(data.mustHave)
  const niceToHave = sanitizeRequirements(data.niceToHave)

  // 6. Explanation
  const explanation =
    typeof data.explanation === 'string' && data.explanation.trim()
      ? data.explanation.trim()
      : 'No explanation provided.'

  return {
    matchScore,
    recommendation,
    matchedSkills,
    missingSkills,
    mustHave,
    niceToHave,
    explanation,
    suggestions,
  }
}

export async function analyzeResumeWithAI(resume, jobDescription) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.')
  }

  // Initialize inside the function so dotenv has already loaded the key
  const ai = new GoogleGenAI({ apiKey })

  const prompt = `
You are a meticulous, objective technical recruiter and career coach evaluating a candidate's resume against a job description.

EVALUATION METHODOLOGY:
1. Requirement Classification:
   - Carefully extract and separate MUST-HAVE requirements (non-negotiable prerequisites, years of core experience, mandatory technologies/degrees) from NICE-TO-HAVE requirements (bonus skills, preferred tools, nice-to-haves).

2. Evidence-Based Verification:
   - For every requirement or skill marked as found (true), you MUST cite direct quote evidence or concrete project proof from the candidate's resume.
   - If a technology is merely listed in a skills keyword section but shows no practical implementation in work experience or projects, note this nuance in the evidence/gap explanation.
   - For any requirement marked as missing (false), provide a clear, concise reason explaining the gap.

3. Weighted Scoring Logic:
   - Calculate matchScore strictly and proportionally:
     * MUST-HAVE requirements carry 75% of the total score weight.
     * NICE-TO-HAVE requirements carry 25% of the total score weight.
   - If critical dealbreakers are missing, do not inflate the score.
   - Recommendation thresholds:
     * "APPLY": matchScore >= 70 AND candidate satisfies the vast majority of must-haves.
     * "CONSIDER": matchScore 40 to 69, or candidate has strong foundational skills with 1-2 addressable gaps.
     * "SKIP": matchScore < 40, or candidate lacks the primary core mandatory requirements.

4. Ethical & Tailored Improvement Suggestions:
   - STRICT RULE: NEVER suggest adding or fabricating a skill, tool, or credential the candidate does not have.
   - Provide highly specific, actionable advice on how to better frame, reorganize, or quantify the experience they ALREADY have on their resume to better align with the job posting keywords and metrics.
   - Reference specific sections or bullet points from their resume.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}
`

  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ].filter(Boolean)

  let response = null
  let lastError = null

  for (const model of candidateModels) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: ANALYSIS_SCHEMA,
        },
      })
      if (response?.text) {
        break
      }
    } catch (err) {
      lastError = err
      const isOverloaded =
        err.status === 503 ||
        err.status === 429 ||
        err.message?.includes('high demand') ||
        err.message?.includes('UNAVAILABLE')
      console.warn(
        `Model ${model} unavailable (${err.status || err.message}). ${
          isOverloaded ? 'Falling back to next model...' : ''
        }`
      )

      // If it's an authentication error, don't keep trying models
      if (err.status === 401 || err.status === 403) {
        throw new Error('Invalid or unauthorized Gemini API key. Please check your GEMINI_API_KEY in .env.')
      }
    }
  }

  if (!response || !response.text) {
    if (lastError?.status === 503 || lastError?.message?.includes('high demand')) {
      throw new Error('The AI model is currently experiencing high demand from Google. Please wait a few seconds and try again.')
    }
    throw new Error(lastError?.message || 'Failed to generate analysis. Please try again.')
  }

  const text = response.text || ''

  // Clean out any accidental markdown backticks and isolate JSON block
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    cleaned = jsonMatch[0]
  }

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON. Raw response:', text)
    throw new Error('The AI returned an invalid response format. Please try again.')
  }

  // Validate and normalize all fields before returning
  return normalizeAndValidateAnalysis(parsed)
}
