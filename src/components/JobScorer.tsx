import { useState } from 'react'
import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Zap, CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react'
import type { UserProfile, JobScore, Application } from '../types'
import { scoreJob } from '../lib/openai'
import { supabase } from '../lib/supabase'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

interface Props {
  profile: UserProfile
  onSaved?: (app: Application) => void
}

const GRADE_COLORS: Record<string, string> = {
  'A': 'text-green-400',
  'A-': 'text-green-400',
  'B+': 'text-lime-400',
  'B': 'text-yellow-400',
  'B-': 'text-yellow-500',
  'C': 'text-orange-400',
  'D': 'text-red-400',
  'F': 'text-red-600',
}

const REC_CONFIG = {
  strong_yes: { icon: CheckCircle, color: 'text-green-400', label: 'Strong Yes — Apply immediately' },
  yes: { icon: CheckCircle, color: 'text-lime-400', label: 'Yes — Worth applying' },
  maybe: { icon: AlertCircle, color: 'text-yellow-400', label: 'Maybe — Proceed with caution' },
  no: { icon: XCircle, color: 'text-orange-400', label: 'No — Likely not a fit' },
  strong_no: { icon: XCircle, color: 'text-red-400', label: 'Strong No — Skip this one' },
}

export function JobScorer({ profile, onSaved }: Props) {
  const [jobDesc, setJobDesc] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<JobScore | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!jobDesc.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)
    try {
      const score = await scoreJob(jobDesc, profile)
      setResult(score)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scoring failed')
    } finally {
      setLoading(false)
    }
  }

  const saveApplication = async () => {
    if (!result) return
    setSaving(true)
    try {
      const { data, error: err } = await supabase
        .from('career_ops_applications')
        .insert({
          company_name: companyName || 'Unknown Company',
          role_title: roleTitle || 'Unknown Role',
          job_description: jobDesc,
          score: result.overall,
          grade: result.grade,
          score_breakdown: result,
          status: 'new',
        })
        .select()
        .single()

      if (err) throw err
      setSaved(true)
      if (onSaved) onSaved(data as Application)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const radarData = result
    ? {
        labels: result.dimensions.map(d => d.name.replace(' ', '\n')),
        datasets: [
          {
            label: 'Score',
            data: result.dimensions.map(d => d.score),
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            borderColor: 'rgba(34, 197, 94, 0.8)',
            pointBackgroundColor: 'rgba(34, 197, 94, 1)',
            pointRadius: 4,
          },
        ],
      }
    : null

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, color: '#6b7280', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
        angleLines: { color: 'rgba(255,255,255,0.08)' },
        pointLabels: { color: '#9ca3af', font: { size: 10 } },
      },
    },
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  }

  const recConfig = result ? REC_CONFIG[result.recommendation] : null
  const RecIcon = recConfig?.icon

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Company Name</label>
          <input
            className="input text-sm"
            placeholder="e.g. Anthropic"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Role Title</label>
          <input
            className="input text-sm"
            placeholder="e.g. Head of Product"
            value={roleTitle}
            onChange={e => setRoleTitle(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Job Description</label>
        <textarea
          className="textarea text-sm"
          rows={8}
          placeholder="Paste the full job description here..."
          value={jobDesc}
          onChange={e => setJobDesc(e.target.value)}
        />
      </div>

      <button
        className="btn-primary flex items-center gap-2"
        onClick={analyze}
        disabled={loading || !jobDesc.trim()}
      >
        <Zap className="w-4 h-4" />
        {loading ? 'Analyzing...' : 'Score This Job'}
      </button>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="card flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Scoring across 10 dimensions...</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Header score */}
          <div className="card flex items-center gap-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${GRADE_COLORS[result.grade] ?? 'text-white'}`}>
                {result.grade}
              </div>
              <div className="text-gray-400 text-sm mt-1">{result.overall}/5.0</div>
            </div>
            <div className="flex-1">
              {recConfig && RecIcon && (
                <div className={`flex items-center gap-2 mb-2 ${recConfig.color}`}>
                  <RecIcon className="w-4 h-4" />
                  <span className="font-medium text-sm">{recConfig.label}</span>
                </div>
              )}
              <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* Radar chart + dimension breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card flex items-center justify-center">
              {radarData && (
                <Radar data={radarData} options={radarOptions} />
              )}
            </div>
            <div className="card overflow-auto">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Dimension Breakdown
              </h3>
              <div className="space-y-2">
                {result.dimensions.map(d => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-300">{d.name}</span>
                      <span className="text-xs font-mono text-gray-400">{d.score}/5</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(d.score / 5) * 100}%`,
                          backgroundColor:
                            d.score >= 4 ? '#22c55e' : d.score >= 3 ? '#eab308' : '#ef4444',
                        }}
                      />
                    </div>
                    {d.reasoning && (
                      <p className="text-xs text-gray-500 mt-0.5">{d.reasoning}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={saveApplication}
              disabled={saving || saved}
            >
              <Save className="w-4 h-4" />
              {saved ? '✓ Saved to Tracker' : saving ? 'Saving...' : 'Save to Tracker'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => { setResult(null); setJobDesc(''); setCompanyName(''); setRoleTitle(''); setSaved(false) }}>
              New Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
