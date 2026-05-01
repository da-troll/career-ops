import { useState, useRef } from 'react'
import { FileText, Copy, Check, RotateCcw } from 'lucide-react'
import type { UserProfile } from '../types'
import { draftCoverLetter } from '../lib/openai'

interface Props {
  profile: UserProfile
}

export function CoverLetterDrafter({ profile }: Props) {
  const [jobDesc, setJobDesc] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [letter, setLetter] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const letterRef = useRef<HTMLDivElement>(null)

  const generate = async () => {
    if (!jobDesc.trim()) return
    setStreaming(true)
    setLetter('')
    setError('')
    try {
      let full = ''
      await draftCoverLetter(jobDesc, profile, (chunk) => {
        full += chunk
        setLetter(full)
        if (letterRef.current) {
          letterRef.current.scrollTop = letterRef.current.scrollHeight
        }
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Draft failed')
    } finally {
      setStreaming(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        <div className="flex items-end">
          <p className="text-xs text-gray-500">
            Using profile: <span className="text-gray-300">{profile.name}</span>
          </p>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Job Description</label>
        <textarea
          className="textarea text-sm"
          rows={7}
          placeholder="Paste the job description to get a tailored cover letter..."
          value={jobDesc}
          onChange={e => setJobDesc(e.target.value)}
        />
      </div>

      <button
        className="btn-primary flex items-center gap-2"
        onClick={generate}
        disabled={streaming || !jobDesc.trim()}
      >
        <FileText className="w-4 h-4" />
        {streaming ? 'Writing...' : 'Draft Cover Letter'}
      </button>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {(letter || streaming) && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-400" />
              {companyName ? `Cover Letter — ${companyName}` : 'Cover Letter'}
            </h3>
            <div className="flex gap-2">
              {!streaming && letter && (
                <>
                  <button
                    className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
                    onClick={generate}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Regenerate
                  </button>
                </>
              )}
            </div>
          </div>
          <div
            ref={letterRef}
            className="bg-gray-950 rounded-lg p-4 max-h-80 overflow-y-auto text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-mono"
          >
            {letter}
            {streaming && <span className="inline-block w-1.5 h-4 bg-green-400 animate-pulse ml-0.5 align-middle" />}
          </div>
          {!streaming && letter && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">{letter.split(/\s+/).length} words</span>
              <span className="text-xs text-gray-500">gpt-4o</span>
            </div>
          )}
        </div>
      )}

      <div className="card bg-gray-950 border-gray-800">
        <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Tips</h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>→ Paste the full JD including company context for best results</li>
          <li>→ Edit your profile (above) to tune the letter to a different persona</li>
          <li>→ Always review before sending — the AI gives a starting point, not a final draft</li>
          <li>→ Regenerate for a different angle if the first version misses the mark</li>
        </ul>
      </div>
    </div>
  )
}
