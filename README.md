# Career Ops

AI-powered job intelligence — score job fit, draft cover letters, track applications.

## Features

- **Job Fit Scorer** — paste a job description and get an A-F grade across 10 weighted dimensions (role fit, tech stack match, impact scope, compensation signals, culture, remote flexibility, career trajectory, team size, industry relevance, work-life balance). Includes a radar chart and per-dimension AI reasoning.
- **Cover Letter Drafter** — streaming gpt-4o cover letter tailored to the JD + your profile. Non-generic, no "I am passionate" boilerplate.
- **Application Tracker** — Supabase-backed pipeline with status tracking (new → applied → screening → interview → offer/rejected), notes, and score history.
- **Editable profile** — pre-loaded with Daniel's Head of Product AI/Automation/Integrations context; customize for any persona.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- OpenAI API (gpt-4o-mini for scoring, gpt-4o for cover letters)
- Supabase (application persistence)
- Chart.js / react-chartjs-2 (radar chart)

## Live URL

https://mvp.trollefsen.com/2026-05-01-career-ops/

## Setup (local dev)

```bash
npm install
# Copy .env.local and fill in your keys:
# VITE_OPENAI_API_KEY=...
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
npm run dev
```

## Inspired by

[santifer/career-ops](https://github.com/santifer/career-ops) ⭐ 9,221 — adapted for our household stack (OpenAI instead of Claude, web UI instead of CLI).

---

Built by Wilson 🏐 · Nightly MVP Builder · 2026-05-01
