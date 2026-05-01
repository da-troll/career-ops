import OpenAI from 'openai'
import type { UserProfile, JobScore } from '../types'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
  dangerouslyAllowBrowser: true,
})

const SCORE_DIMENSIONS = [
  { key: 'role_fit', name: 'Role Fit', weight: 2.0 },
  { key: 'tech_stack', name: 'Tech Stack Match', weight: 1.5 },
  { key: 'impact_scope', name: 'Impact & Scope', weight: 1.5 },
  { key: 'compensation', name: 'Compensation Signals', weight: 1.2 },
  { key: 'culture', name: 'Culture Indicators', weight: 1.0 },
  { key: 'remote_flexibility', name: 'Remote Flexibility', weight: 1.3 },
  { key: 'career_trajectory', name: 'Career Trajectory', weight: 1.2 },
  { key: 'team_size', name: 'Team Size Preference', weight: 0.8 },
  { key: 'industry_relevance', name: 'Industry Relevance', weight: 1.0 },
  { key: 'work_life_balance', name: 'Work-Life Balance', weight: 0.8 },
]

function scoreToGrade(score: number): string {
  if (score >= 4.5) return 'A'
  if (score >= 4.0) return 'A-'
  if (score >= 3.5) return 'B+'
  if (score >= 3.0) return 'B'
  if (score >= 2.5) return 'B-'
  if (score >= 2.0) return 'C'
  if (score >= 1.5) return 'D'
  return 'F'
}

function scoreToRecommendation(score: number): JobScore['recommendation'] {
  if (score >= 4.3) return 'strong_yes'
  if (score >= 3.5) return 'yes'
  if (score >= 2.5) return 'maybe'
  if (score >= 1.5) return 'no'
  return 'strong_no'
}

export async function scoreJob(jobDescription: string, profile: UserProfile): Promise<JobScore> {
  const dimensionList = SCORE_DIMENSIONS.map(d => `- ${d.key}: ${d.name} (weight: ${d.weight})`).join('\n')

  const prompt = `You are an expert career advisor. Score this job opportunity for the candidate below.

## Candidate Profile
Name: ${profile.name}
Title: ${profile.title}
Location: ${profile.location}
Summary: ${profile.summary}
Key Skills: ${profile.skills.join(', ')}
Experience: ${profile.experience}
Preferences:
- Remote: ${profile.preferences.remote}
- Team size: ${profile.preferences.teamSize}
- Industries: ${profile.preferences.industry.join(', ')}
- Role types: ${profile.preferences.roleTypes.join(', ')}

## Job Description
${jobDescription}

## Scoring Instructions
Score each dimension 1-5 (1=poor fit, 5=excellent fit). Be honest and critical — not every job is a great fit.

Dimensions to score:
${dimensionList}

Return ONLY valid JSON in this exact format:
{
  "dimensions": {
    "role_fit": { "score": 4, "reasoning": "..." },
    "tech_stack": { "score": 3, "reasoning": "..." },
    "impact_scope": { "score": 4, "reasoning": "..." },
    "compensation": { "score": 3, "reasoning": "..." },
    "culture": { "score": 4, "reasoning": "..." },
    "remote_flexibility": { "score": 5, "reasoning": "..." },
    "career_trajectory": { "score": 4, "reasoning": "..." },
    "team_size": { "score": 3, "reasoning": "..." },
    "industry_relevance": { "score": 4, "reasoning": "..." },
    "work_life_balance": { "score": 3, "reasoning": "..." }
  },
  "summary": "2-3 sentence overall assessment highlighting key strengths and concerns"
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const raw = JSON.parse(response.choices[0].message.content || '{}')

  // Build structured dimensions
  const dimensions = SCORE_DIMENSIONS.map(d => ({
    name: d.name,
    score: raw.dimensions?.[d.key]?.score ?? 3,
    max: 5,
    reasoning: raw.dimensions?.[d.key]?.reasoning ?? '',
    weight: d.weight,
  }))

  // Weighted average
  const totalWeight = SCORE_DIMENSIONS.reduce((sum, d) => sum + d.weight, 0)
  const weightedSum = dimensions.reduce((sum, d, i) => sum + d.score * SCORE_DIMENSIONS[i].weight, 0)
  const overall = Math.round((weightedSum / totalWeight) * 10) / 10

  const grade = scoreToGrade(overall)
  const recommendation = scoreToRecommendation(overall)

  return { overall, grade, dimensions, summary: raw.summary ?? '', recommendation }
}

export async function draftCoverLetter(
  jobDescription: string,
  profile: UserProfile,
  onChunk: (text: string) => void
): Promise<string> {
  const prompt = `Write a compelling, personalized cover letter for this job application.

## Candidate
Name: ${profile.name}
Title: ${profile.title}
Location: ${profile.location}
Summary: ${profile.summary}
Key Skills: ${profile.skills.join(', ')}
Experience: ${profile.experience}

## Job Description
${jobDescription}

## Instructions
- 3-4 paragraphs, ~300 words total
- Opening: hook with specific angle on why this role/company
- Middle: 2 specific examples of relevant work/impact (be concrete, not generic)
- Closing: forward-looking, clear CTA
- Voice: confident and direct, not fawning
- Do NOT use: "I am excited", "thrilled", "passionate", "synergy", "leverage"
- Format: plain text, no markdown, no Dear [Name] placeholder
- Start directly with the opening hook

Write the cover letter now:`

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    stream: true,
  })

  let full = ''
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? ''
    if (text) {
      full += text
      onChunk(text)
    }
  }
  return full
}
