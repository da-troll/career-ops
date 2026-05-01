import { useState } from 'react'
import { Zap, FileText, Briefcase } from 'lucide-react'
import type { UserProfile, Application } from './types'
import { DEFAULT_PROFILE } from './lib/defaultProfile'
import { ProfilePanel } from './components/ProfilePanel'
import { JobScorer } from './components/JobScorer'
import { CoverLetterDrafter } from './components/CoverLetterDrafter'
import { ApplicationTracker } from './components/ApplicationTracker'

type Tab = 'score' | 'letter' | 'tracker'

const TABS: { id: Tab; label: string; icon: typeof Zap }[] = [
  { id: 'score', label: 'Job Scorer', icon: Zap },
  { id: 'letter', label: 'Cover Letter', icon: FileText },
  { id: 'tracker', label: 'Tracker', icon: Briefcase },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('score')
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [trackerRefresh, setTrackerRefresh] = useState(0)

  const handleSaved = (_app: Application) => {
    setTrackerRefresh(k => k + 1)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">Career Ops</span>
            <span className="text-xs text-gray-500 hidden sm:block">AI-powered job intelligence</span>
          </div>
          <div className="flex items-center gap-1">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === t.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ProfilePanel profile={profile} onChange={setProfile} />

        {tab === 'score' && <JobScorer profile={profile} onSaved={handleSaved} />}
        {tab === 'letter' && <CoverLetterDrafter profile={profile} />}
        {tab === 'tracker' && <ApplicationTracker refreshKey={trackerRefresh} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-4 text-center text-xs text-gray-600">
        Career Ops · Built by Wilson 🏐 · Nightly MVP 2026-05-01
      </footer>
    </div>
  )
}
