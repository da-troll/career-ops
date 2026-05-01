import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Application } from '../types'
import { Briefcase, RefreshCw, Trash2, ChevronDown } from 'lucide-react'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-gray-700', text: 'text-gray-300', label: 'New' },
  applied: { bg: 'bg-blue-900', text: 'text-blue-300', label: 'Applied' },
  screening: { bg: 'bg-purple-900', text: 'text-purple-300', label: 'Screening' },
  interview: { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'Interview' },
  offer: { bg: 'bg-green-900', text: 'text-green-300', label: 'Offer 🎉' },
  rejected: { bg: 'bg-red-950', text: 'text-red-400', label: 'Rejected' },
  withdrawn: { bg: 'bg-gray-800', text: 'text-gray-500', label: 'Withdrawn' },
}

const GRADE_COLORS: Record<string, string> = {
  A: 'text-green-400 bg-green-950',
  'A-': 'text-green-400 bg-green-950',
  'B+': 'text-lime-400 bg-lime-950',
  B: 'text-yellow-400 bg-yellow-950',
  'B-': 'text-yellow-500 bg-yellow-950',
  C: 'text-orange-400 bg-orange-950',
  D: 'text-red-400 bg-red-950',
  F: 'text-red-600 bg-red-950',
}

const STATUSES = ['new', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn']

interface Props {
  refreshKey?: number
}

export function ApplicationTracker({ refreshKey }: Props) {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<'created_at' | 'score'>('created_at')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('career_ops_applications')
      .select('*')
      .order(sortBy, { ascending: sortBy === 'score' ? false : false })
    setApps((data as Application[]) ?? [])
    const notesMap: Record<string, string> = {}
    ;(data as Application[])?.forEach(a => { notesMap[a.id] = a.notes ?? '' })
    setNotes(notesMap)
    setLoading(false)
  }, [sortBy])

  useEffect(() => { load() }, [load, refreshKey])

  const updateStatus = async (id: string, status: Application['status']) => {
    await supabase
      .from('career_ops_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const saveNotes = async (id: string) => {
    await supabase
      .from('career_ops_applications')
      .update({ notes: notes[id], updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  const deleteApp = async (id: string) => {
    if (!confirm('Delete this application?')) return
    await supabase.from('career_ops_applications').delete().eq('id', id)
    setApps(prev => prev.filter(a => a.id !== id))
  }

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.filter(s => statusCounts[s] > 0).map(s => {
          const style = STATUS_STYLES[s]
          return (
            <span key={s} className={`text-xs px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
              {style.label} · {statusCounts[s]}
            </span>
          )
        })}
        {apps.length === 0 && !loading && (
          <span className="text-xs text-gray-500">No applications yet — score a job and save it</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort by:</span>
          <select
            className="input text-xs w-auto py-1.5 pr-6"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="created_at">Date Added</option>
            <option value="score">Score</option>
          </select>
        </div>
        <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5" onClick={load}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <span className="text-xs text-gray-500 ml-auto">{apps.length} application{apps.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Application list */}
      {loading && apps.length === 0 ? (
        <div className="card text-center py-12 text-gray-500 text-sm">Loading...</div>
      ) : (
        <div className="space-y-2">
          {apps.map(app => {
            const style = STATUS_STYLES[app.status]
            const gradeStyle = app.grade ? (GRADE_COLORS[app.grade] ?? 'text-gray-400 bg-gray-800') : null
            const isOpen = expanded === app.id

            return (
              <div key={app.id} className="card p-0 overflow-hidden">
                {/* Header row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : app.id)}
                >
                  <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{app.role_title}</span>
                      <span className="text-gray-400 text-sm">@</span>
                      <span className="text-green-400 text-sm truncate">{app.company_name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  {gradeStyle && (
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${gradeStyle}`}>
                      {app.grade}
                    </span>
                  )}
                  <div className="relative">
                    <select
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer appearance-none pr-5 ${style.bg} ${style.text}`}
                      value={app.status}
                      onChange={e => {
                        e.stopPropagation()
                        updateStatus(app.id, e.target.value as Application['status'])
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="text-gray-600 hover:text-red-400 transition-colors"
                    onClick={e => { e.stopPropagation(); deleteApp(app.id) }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-800 p-4 space-y-3">
                    {app.score_breakdown?.summary && (
                      <div className="bg-gray-950 rounded-lg p-3">
                        <p className="text-xs text-gray-400 font-medium mb-1">AI Assessment</p>
                        <p className="text-sm text-gray-300">{app.score_breakdown.summary}</p>
                      </div>
                    )}
                    {app.score_breakdown?.dimensions && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {app.score_breakdown.dimensions.map(d => (
                          <div key={d.name} className="flex items-center justify-between text-xs">
                            <span className="text-gray-400 truncate">{d.name}</span>
                            <span className={`font-mono ml-2 ${d.score >= 4 ? 'text-green-400' : d.score >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {d.score}/5
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {app.cover_letter && (
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1">Cover Letter</p>
                        <div className="bg-gray-950 rounded-lg p-3 text-xs text-gray-300 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
                          {app.cover_letter}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Notes</p>
                      <textarea
                        className="textarea text-sm"
                        rows={2}
                        placeholder="Add notes..."
                        value={notes[app.id] ?? ''}
                        onChange={e => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                        onBlur={() => saveNotes(app.id)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
