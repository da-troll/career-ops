import { useState } from 'react'
import { ChevronDown, ChevronUp, User } from 'lucide-react'
import type { UserProfile } from '../types'

interface Props {
  profile: UserProfile
  onChange: (p: UserProfile) => void
}

export function ProfilePanel({ profile, onChange }: Props) {
  const [open, setOpen] = useState(false)

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    onChange({ ...profile, [key]: value })

  return (
    <div className="card mb-4">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-green-400" />
          <span className="font-semibold text-sm">Your Profile</span>
          <span className="text-xs text-gray-500">{profile.name} · {profile.title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Name</label>
              <input
                className="input text-sm"
                value={profile.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Title</label>
              <input
                className="input text-sm"
                value={profile.title}
                onChange={e => set('title', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Location</label>
            <input
              className="input text-sm"
              value={profile.location}
              onChange={e => set('location', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Professional Summary</label>
            <textarea
              className="textarea text-sm"
              rows={3}
              value={profile.summary}
              onChange={e => set('summary', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Key Skills (comma separated)</label>
            <input
              className="input text-sm"
              value={profile.skills.join(', ')}
              onChange={e => set('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Experience Summary</label>
            <textarea
              className="textarea text-sm"
              rows={3}
              value={profile.experience}
              onChange={e => set('experience', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
