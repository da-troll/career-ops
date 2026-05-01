# Career Ops — Build Plan

## What does this project actually do?

Career Ops is an AI-powered job search management system. The original (santifer/career-ops) is a CLI/terminal tool built on Claude Code that scores job opportunities A-F across 10 weighted dimensions, generates tailored PDF resumes, scans 45+ company career portals, and tracks applications via a terminal dashboard. It was built by a Head of Applied AI who used it to evaluate 740+ opportunities.

## Where does it fit?

**Personal tooling for Daniel** — Daniel is Head of Product AI/Automation/Integrations. He's in an ideal role right now but this is a useful "always on" personal intelligence tool. With AI moving fast, having a sharp evaluation tool for when interesting opportunities surface (or for active search) is genuinely valuable.

## Scoped MVP

A clean React web app with three core features:

1. **Job Fit Scorer** — paste a job description, get an A-F score across 10 dimensions (role fit, tech stack match, impact scope, compensation signals, culture indicators, remote flexibility, career trajectory, team size preference, industry relevance, work-life balance). Shows radar chart + per-dimension breakdown with AI reasoning.

2. **Cover Letter Drafter** — generate a tailored, non-generic cover letter using gpt-4o based on the job description + Daniel's pre-baked profile. Emphasizes AI product leadership, agentic systems, enterprise automation.

3. **Application Tracker** — Supabase-backed table of tracked applications. Save any scored job directly. Update status (new → applied → screening → interview → offer/rejected). Add notes. Sort by score.

## Real data used

- Daniel's professional profile pre-baked as the default persona (Head of Product AI/Automation/Integrations, Oslo, remote-friendly, OpenAI/Supabase/n8n stack)
- Supabase (onyrysthhdjfhwxuezap) for application persistence
- OpenAI gpt-4o-mini for scoring, gpt-4o for cover letter generation

## Build tasks

- [ ] package.json + deps
- [ ] index.html + tailwind setup
- [ ] OpenAI client helper (streaming)
- [ ] Supabase client
- [ ] UserProfile component (editable sidebar)
- [ ] JobScorer component with radar chart
- [ ] CoverLetterDrafter component
- [ ] ApplicationTracker component (Supabase CRUD)
- [ ] App.tsx with tab navigation
- [ ] Build + deploy
