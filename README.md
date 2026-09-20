# 🧠 AI Job Application Assistant

> **Upload your resume. Paste a job description. Get an honest, explainable answer: Should you apply?**

---

## 📌 What Is This Project?

This is a full-stack web application that helps job seekers understand how well their resume matches a job posting — before they apply.

Most people either:
- Apply to every job blindly (wasting time)
- Or feel unsure whether their skills are "good enough"

This app solves that by using AI to compare your resume against a job description and giving you a clear, honest breakdown — not just a score, but an explanation of *why* you matched or didn't match.

---

## 🎯 What the App Does (Once Fully Built)

1. You paste your resume (or upload a PDF)
2. You paste a job description
3. You click Analyze
4. The app tells you:
   - ✅ Your match score (e.g., 82%)
   - ✅ Which skills you have that the job wants
   - ✅ Which skills you're missing
   - ✅ Whether those missing skills are mandatory or just preferred
   - ✅ An explanation of why you got that score
   - ✅ Suggestions to improve how your resume *presents* existing experience
   - ✅ A clear recommendation: **APPLY / CONSIDER / SKIP**

> Important: The app will never tell you to fake a skill you don't have.
> It only helps you better present the real experience you already possess.

---

## 🔧 Tech Stack (Complete)

| What | Technology | Plain English Meaning |
|------|-----------|----------------------|
| UI | React | The web pages the user sees and clicks on |
| Styling | Tailwind CSS | Makes the UI look good without writing much CSS |
| Navigation | React Router | Lets you move between pages without refreshing |
| HTTP requests | Axios | How the frontend talks to the backend |
| Backend | Node.js + Express | The server that handles requests and calls the AI |
| AI | Google Gemini / OpenAI | The brain that reads your resume and job description |
| Database | MongoDB | Stores your resumes, analyses, and account info |
| DB Helper | Mongoose | Makes it easy to read/write to MongoDB |
| Auth | JWT + bcrypt | Secure login — passwords are never stored as plain text |
| PDF reading | pdf-parse | Extracts your resume text from a PDF file |
| Secrets | dotenv | Keeps API keys hidden from the public |

---

## 🗺️ Development Phases — What Happens After Each One

Each phase builds on the last. Nothing is skipped. Nothing is rushed.

---

### ✅ Phase 1 — Build the React UI (with fake data)

What we build:
- A page with two text boxes (resume + job description)
- An Analyze button
- A results section that shows fake/hardcoded analysis data

What you can do after this phase:
- See the full UI in your browser
- Click the Analyze button (nothing real happens yet — fake data shows up)
- Understand how the final results will look

What is NOT working yet:
- No real AI, no backend, no database

---

### ✅ Phase 2 — Build the Express Backend (with fake response)

What we build:
- A Node.js + Express server
- One API endpoint: `POST /api/analyze`
- It receives resume + job description and returns a hardcoded JSON response

What you can do after this phase:**
- Test the backend using Postman or Thunder Client
- See the server respond with a fake-but-correctly-shaped JSON result
- Confirm your backend is running and accepting requests

What is NOT working yet:**
- No real AI — still hardcoded response
- React is not connected to the backend yet

---

### ✅ Phase 3 — Connect React to Express

**What we build:**
- Make the Analyze button in React send a real HTTP request to the backend
- Display the response from Express in the UI (still fake data, but now flowing through the real pipeline)

**What you can do after this phase:**
- Click Analyze in your browser
- Watch the frontend send a request to the backend
- See a response appear in the UI — for the first time, data is flowing end-to-end

**What is NOT working yet:**
- Still using hardcoded data — no AI involved yet

---

### ✅ Phase 4 — Add Real AI (LLM API Call)

**What we build:**
- Connect the backend to an AI API (Google Gemini or OpenAI)
- The backend now sends your resume + job description to the AI
- The AI returns a real analysis

**What you can do after this phase:**
- Paste your real resume and a real job description
- Click Analyze
- Receive a **real AI-generated response** for the first time 🎉

**What is NOT working yet:**
- The AI response might be unstructured or unreliable
- No nice formatting of results yet

---

### ✅ Phase 5 — Make the AI Response Reliable (Structured JSON)

**What we build:**
- Improve the AI prompt so it always returns structured JSON
- Add error handling in case the AI returns something unexpected
- Validate and clean the response before sending it to React

**What you can do after this phase:**
- Rely on the AI always returning the same structure
- Know that even if the AI misbehaves, the app handles it gracefully

**What is NOT working yet:**
- Results display is still basic

---

### ✅ Phase 6 — Display Results Beautifully in React

**What we build:**
- Score display (big, colorful number)
- Skill badges (green = matched, red = missing)
- Must-have vs nice-to-have sections
- Recommendation badge (APPLY / CONSIDER / SKIP)
- Full explanation text
- Improvement suggestions list

**What you can do after this phase:**
- The app now looks and feels like a complete product
- Real resume + real job → beautiful, explainable result

**This completes the MVP. 🏁**

---

### ✅ Phase 7 — Improve AI Logic

**What we build:**
- Better prompt engineering for more accurate skill detection
- Evidence-based matching (AI quotes lines from your resume)
- More nuanced must-have vs nice-to-have classification
- Better improvement suggestions (more specific, more actionable)

**What you can do after this phase:**
- Get more accurate and trustworthy analysis results
- See the AI reference specific lines from your resume

---

### ✅ Phase 8 — Add MongoDB

**What we build:**
- Connect the backend to a MongoDB database
- Define schemas (shapes) for users and analyses
- Test that data can be saved and retrieved

**What you can do after this phase:**
- Store data permanently (it won't disappear when the server restarts)
- Confirm MongoDB is connected and working

---

### ✅ Phase 9 — Save Analysis History

**What we build:**
- Every analysis is saved to MongoDB after it's completed
- A new API endpoint: `GET /api/history` to retrieve past analyses
- A history list in React showing your previous results

**What you can do after this phase:**
- See a log of every job analysis you've ever run
- Click on a past result to view it again

---

### ✅ Phase 10 — Build a Dashboard

**What we build:**
- A proper dashboard page (separate from the analyze page)
- Summary stats: total analyses, average match score, top missing skills
- React Router for navigating between pages

**What you can do after this phase:**
- Navigate between a Dashboard page and an Analyze page
- See a bird's-eye view of your job search progress

---

### ✅ Phase 11 — Add Authentication (Login / Register)

**What we build:**
- Register and login pages in React
- Backend routes for `POST /api/auth/register` and `POST /api/auth/login`
- JWT tokens — the server gives you a token when you log in, you send it with every request
- Protected routes — history and dashboard are only accessible when logged in
- Passwords are hashed with bcrypt (never stored as plain text)

**What you can do after this phase:**
- Create an account
- Log in and out
- Have your own private history of analyses

---

### ✅ Phase 12 — PDF Resume Upload

**What we build:**
- A file upload button in React
- Backend endpoint to receive the PDF
- PDF text extraction using `pdf-parse`
- The extracted text is used for analysis exactly like manually pasted text

**What you can do after this phase:**
- Upload your actual resume PDF instead of pasting text

---

### ✅ Phase 13 — Job URL Extraction

**What we build:**
- An input field for a job posting URL
- Backend scrapes the page and extracts the job description text automatically

**What you can do after this phase:**
- Paste a LinkedIn / Indeed / company careers URL
- The app reads the job description for you — no more copy-pasting

---



## 📁 Project Folder Structure (Final)

```
job-tracker/
│
├── client/               ← Everything the user sees (React)
│   └── src/
│       ├── components/   ← Reusable UI pieces
│       ├── pages/        ← Full pages (Analyze, Dashboard, Login)
│       ├── context/      ← Global state (who is logged in)
│       ├── hooks/        ← Custom reusable logic
│       └── utils/        ← API call functions
│
├── server/               ← Everything on the server (Express)
│   ├── routes/           ← URL endpoints
│   ├── controllers/      ← Logic for each route
│   ├── services/         ← AI calls, PDF parsing
│   ├── models/           ← MongoDB data shapes
│   ├── middleware/        ← Auth checking, error handling
│   └── config/           ← Database connection
│
└── README.md             ← This file
```

---

## 🚫 What This App Will Never Do

- ❌ Guarantee you will get hired
- ❌ Suggest adding skills you don't have to your resume
- ❌ Store your resume data without your consent
- ❌ Share your information with anyone

---



## 🚀 Current Status

> **Phase: Phase 13 Completed (Job URL Extraction & Web Scraping 🌐).**

```
[x] Phase 1  — React UI
[x] Phase 2  — Express Backend
[x] Phase 3  — Connect Frontend to Backend
[x] Phase 4  — Real AI Integration
[x] Phase 5  — Reliable AI Response
[x] Phase 6  — Beautiful Results Display
[x] Phase 7  — Improved AI Logic & Evidence Matching
[x] Phase 8  — MongoDB Database & Schemas
[x] Phase 9  — Save & Retrieve Analysis History
[x] Phase 10 — Dashboard & Aggregate Metrics
[x] Phase 11 — Authentication (Login / Register / JWT)
[x] Phase 12 — PDF Upload
[x] Phase 13 — Job URL Extraction
[ ] Phase 14 — Deployment
```
