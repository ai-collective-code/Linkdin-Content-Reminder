'use client'

import { motion } from 'framer-motion'
import {
  Settings, User, Key, Globe, Bell, Palette,
  Shield, Database, Save, CheckCircle2,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/* ── Settings sections ───────────────────────────────────────── */
const SECTIONS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'api',           label: 'API Keys',       icon: Key },
  { id: 'data',          label: 'Data Sources',    icon: Database },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'appearance',    label: 'Appearance',      icon: Palette },
  { id: 'security',      label: 'Security',       icon: Shield },
] as const

/* ── Component ───────────────────────────────────────────────── */
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string>('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-glass px-6 py-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple/20 to-cyan/20">
          <Settings className="size-5 text-purple" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground">
            Manage your account, API keys, and preferences
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Section sidebar */}
        <nav className="w-56 shrink-0 space-y-1 overflow-y-auto border-r border-glass p-3">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                activeSection === s.id
                  ? 'bg-purple/15 font-medium text-purple'
                  : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground',
              )}
            >
              <s.icon className="size-4" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-2xl space-y-6"
          >
            {activeSection === 'profile' && <ProfileSection />}
            {activeSection === 'api' && <ApiKeysSection />}
            {activeSection === 'data' && <DataSourcesSection />}
            {activeSection === 'notifications' && <NotificationsSection />}
            {activeSection === 'appearance' && <AppearanceSection />}
            {activeSection === 'security' && <SecuritySection />}
          </motion.div>

          {/* Save button */}
          <div className="mx-auto mt-8 flex max-w-2xl justify-end">
            <button
              onClick={handleSave}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all',
                saved
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-purple text-white hover:bg-purple/90',
              )}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="size-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Section components ──────────────────────────────────────── */
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-glass bg-surface-0/50 p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  )
}

function InputField({
  label, placeholder, type = 'text', defaultValue = '',
}: {
  label: string; placeholder: string; type?: string; defaultValue?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-glass bg-surface-1 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-purple/50 focus:outline-none focus:ring-1 focus:ring-purple/30"
      />
    </div>
  )
}

function ToggleRow({ label, desc, defaultOn = false }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          on ? 'bg-purple' : 'bg-surface-2',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform',
            on && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}

/* ── Profile ─────────────────────────────────────────────────── */
function ProfileSection() {
  return (
    <SectionCard title="Profile">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-purple to-pink text-lg font-bold text-white">
            MB
          </div>
          <div>
            <p className="font-medium text-foreground">Mahi Bajaj</p>
            <p className="text-xs text-muted-foreground">tech@aicollective.agency</p>
          </div>
        </div>
        <InputField label="Display Name" placeholder="Your name" defaultValue="Mahi Bajaj" />
        <InputField label="Email" placeholder="email@example.com" defaultValue="tech@aicollective.agency" />
        <InputField label="Organization" placeholder="Your company" defaultValue="AI Collective" />
      </div>
    </SectionCard>
  )
}

/* ── API Keys ────────────────────────────────────────────────── */
function ApiKeysSection() {
  return (
    <SectionCard title="API Keys">
      <p className="mb-4 text-xs text-muted-foreground">
        API keys are stored securely as environment variables. Update them in your deployment platform (Netlify).
      </p>
      <div className="space-y-4">
        <InputField label="Anthropic API Key" placeholder="sk-ant-..." type="password" defaultValue="••••••••••••••••" />
        <InputField label="Google Sheet ID" placeholder="Your Sheet ID" defaultValue="••••••••••••" />
        <InputField label="Google API Key (Simpler for Netlify)" placeholder="AIzaSy..." type="password" defaultValue="••••••••••••" />
        <p className="text-xs text-muted-foreground pt-2">Or use a Service Account (Legacy):</p>
        <InputField label="Google Service Account Email" placeholder="name@project.iam.gserviceaccount.com" defaultValue="••••••••••••" />
      </div>
    </SectionCard>
  )
}

/* ── Data Sources ────────────────────────────────────────────── */
function DataSourcesSection() {
  return (
    <SectionCard title="Data Sources">
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-glass p-3">
          <div className="flex items-center gap-3">
            <Globe className="size-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-foreground">Google Sheets</p>
              <p className="text-xs text-muted-foreground">Primary event data source</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
            Connected
          </span>
        </div>
      </div>
    </SectionCard>
  )
}

/* ── Notifications ───────────────────────────────────────────── */
function NotificationsSection() {
  return (
    <SectionCard title="Notifications">
      <div className="divide-y divide-glass">
        <ToggleRow label="Event Reminders" desc="Get notified about upcoming cultural events" defaultOn />
        <ToggleRow label="Content Generation" desc="Alerts when AI content is ready" defaultOn />
        <ToggleRow label="Sheet Sync" desc="Notification when data refreshes" />
      </div>
    </SectionCard>
  )
}

/* ── Appearance ──────────────────────────────────────────────── */
function AppearanceSection() {
  return (
    <SectionCard title="Appearance">
      <div className="divide-y divide-glass">
        <ToggleRow label="Dark Mode" desc="Use dark theme across the application" defaultOn />
        <ToggleRow label="Compact View" desc="Reduce spacing for information density" />
        <ToggleRow label="Animations" desc="Enable micro-animations and transitions" defaultOn />
      </div>
    </SectionCard>
  )
}

/* ── Security ────────────────────────────────────────────────── */
function SecuritySection() {
  return (
    <SectionCard title="Security">
      <div className="divide-y divide-glass">
        <ToggleRow label="Two-Factor Auth" desc="Add extra security to your account" />
        <ToggleRow label="Session Timeout" desc="Auto-logout after 30 minutes of inactivity" defaultOn />
      </div>
    </SectionCard>
  )
}
