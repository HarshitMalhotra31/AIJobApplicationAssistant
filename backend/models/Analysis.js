import mongoose from 'mongoose'

const MatchedSkillSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, trim: true },
    evidence: { type: String, default: '', trim: true },
  },
  { _id: false }
)

const RequirementSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, trim: true },
    found: { type: Boolean, required: true },
    evidence: { type: String, default: '', trim: true },
  },
  { _id: false }
)

const AnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: '',
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    resumeText: {
      type: String,
      required: true,
    },
    jobDescriptionText: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    recommendation: {
      type: String,
      required: true,
      enum: ['APPLY', 'CONSIDER', 'SKIP'],
    },
    matchedSkills: [MatchedSkillSchema],
    missingSkills: [{ type: String, trim: true }],
    mustHave: [RequirementSchema],
    niceToHave: [RequirementSchema],
    explanation: {
      type: String,
      default: '',
    },
    suggestions: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
)

AnalysisSchema.index({ createdAt: -1 })

const Analysis = mongoose.model('Analysis', AnalysisSchema)

export default Analysis
