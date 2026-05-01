export interface ScoreDimension {
  name: string
  score: number
  max: number
  reasoning: string
  weight: number
}

export interface JobScore {
  overall: number
  grade: string
  dimensions: ScoreDimension[]
  summary: string
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
}

export interface UserProfile {
  name: string
  title: string
  location: string
  summary: string
  skills: string[]
  experience: string
  preferences: {
    remote: 'required' | 'preferred' | 'flexible' | 'office'
    teamSize: 'startup' | 'scaleup' | 'enterprise' | 'any'
    industry: string[]
    roleTypes: string[]
  }
}

export interface Application {
  id: string
  company_name: string
  role_title: string
  job_description: string | null
  score: number | null
  grade: string | null
  score_breakdown: JobScore | null
  cover_letter: string | null
  status: 'new' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
  notes: string | null
  applied_at: string | null
  created_at: string
  updated_at: string
}
