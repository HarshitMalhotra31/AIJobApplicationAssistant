import { GoogleGenAI } from '@google/genai'

const ANALYSIS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    matchScore: { type: 'INTEGER', description: 'Match score between 0 and 100' },
    recommendation: {
      type: 'STRING',
      enum: ['APPLY', 'CONSIDER', 'SKIP'],
      description: 'Recommendation for the applicant',
    },
    matchedSkills: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Skills present in both resume and job description',
    },
    missingSkills: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Required skills missing from the resume',
    },
    mustHave: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          skill: { type: 'STRING' },
          found: { type: 'BOOLEAN' },
        },
        required: ['skill', 'found'],
      },
    },
    niceToHave: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          skill: { type: 'STRING' },
          found: { type: 'BOOLEAN' },
        },
        required: ['skill', 'found'],
      },
    },
    explanation: { type: 'STRING', description: 'Brief rationale for the score' },
    suggestions: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Suggestions to better present existing experience',
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
 * bounded values, and deduplicated lists.
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

  // 3. Normalize skill lists (deduplicate, trim, filter non-strings)
  const sanitizeStringArray = (arr) => {
    if (!Array.isArray(arr)) return []
    return Array.from(new Set(arr.map((s) => String(s).trim()).filter(Boolean)))
  }

  const matchedSkills = sanitizeStringArray(data.matchedSkills)
  const missingSkills = sanitizeStringArray(data.missingSkills)
  const suggestions = sanitizeStringArray(data.suggestions)

  // 4. Normalize requirement tables
  const sanitizeRequirements = (arr) => {
    if (!Array.isArray(arr)) return []
    return arr
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        skill: String(item.skill || '').trim(),
        found: Boolean(item.found),
      }))
      .filter((item) => item.skill.length > 0)
  }

  const mustHave = sanitizeRequirements(data.mustHave)
  const niceToHave = sanitizeRequirements(data.niceToHave)

  // 5. Explanation
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
You are a professional resume analyst. Your job is to evaluate how well a candidate's resume matches a job description.

Analyze the resume against the job description carefully. Then return your analysis as a valid JSON object matching the requested schema.

STRICT RULES:
- Never suggest adding a skill the candidate does not actually have
- Only suggest better presentation of skills they already possess
- Base every match or mismatch on actual evidence from the resume
- Be honest — if a required skill is missing, say so clearly

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}
`

  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
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
