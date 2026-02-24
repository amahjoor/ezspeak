'use client'

import { useState, useEffect, useRef } from 'react'

const DOWNLOADS = {
  windows: {
    label: 'Windows',
    version: 'v1.1.1',
    url: 'https://github.com/amahjoor/ezspeak/releases/download/v1.1.1/ezspeak.Setup.1.1.1.exe',
    available: true,
  },
  mac: {
    label: 'macOS',
    version: 'v1.1.1',
    url: 'https://github.com/amahjoor/ezspeak/releases/download/v1.1.1/ezspeak-1.1.1-arm64.dmg',
    available: true,
  },
} as const

type OS = 'windows' | 'mac' | 'other'

function detectOS(): OS {
  if (typeof window === 'undefined') return 'other'
  const ua = window.navigator.userAgent
  if (/Mac/i.test(ua)) return 'mac'
  if (/Win/i.test(ua)) return 'windows'
  return 'other'
}

interface DownloadButtonProps {
  /**
   * Visual variant:
   *   'primary' — green button, for the hero section (white/light background)
   *   'inverse' — white button, for the green-gradient download section
   *   'nav'     — plain text link style, for the header nav
   */
  variant?: 'primary' | 'inverse' | 'nav'
}

export default function DownloadButton({ variant = 'primary' }: DownloadButtonProps) {
  const [os, setOs] = useState<OS>('windows') // default for SSR
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOs(detectOS())
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const primaryPlatform: 'windows' | 'mac' = os === 'mac' ? 'mac' : 'windows'
  const primary = DOWNLOADS[primaryPlatform]

  // Other platform options for the dropdown
  const otherOptions = (
    Object.entries(DOWNLOADS) as [keyof typeof DOWNLOADS, (typeof DOWNLOADS)[keyof typeof DOWNLOADS]][]
  ).filter(([key]) => key !== primaryPlatform)

  // ── Nav variant ──────────────────────────────────────────────────────────────
  if (variant === 'nav') {
    return (
      <div ref={containerRef} className="relative inline-flex items-center">
        {primary.available && primary.url ? (
          <a
            href={primary.url}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Download
            <span className="ml-1 text-xs text-gray-400">{primary.version}</span>
          </a>
        ) : (
          <span className="text-gray-400 cursor-not-allowed">Download</span>
        )}
        <button
          onClick={() => setOpen((prev: boolean) => !prev)}
          className="ml-1 text-gray-400 hover:text-gray-700 transition-colors flex items-center"
          aria-label="Other download options"
          aria-expanded={open}
        >
          <svg
            className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 whitespace-nowrap">
            {/* Current platform (already shown in nav link) */}
            <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              All platforms
            </div>
            {primary.available && primary.url && (
              <a
                href={primary.url}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <PlatformIcon platform={primaryPlatform} />
                <span>Download for {primary.label}</span>
                <span className="ml-auto pl-4 text-xs text-gray-400">{primary.version}</span>
              </a>
            )}
            {otherOptions.map(([key, opt]) =>
              opt.available && opt.url ? (
                <a
                  key={key}
                  href={opt.url}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <PlatformIcon platform={key} />
                  <span>Download for {opt.label}</span>
                  <span className="ml-auto pl-4 text-xs text-gray-400">{opt.version}</span>
                </a>
              ) : (
                <div
                  key={key}
                  className="flex items-center gap-2 px-5 py-3 text-sm text-gray-400 cursor-not-allowed select-none"
                >
                  <PlatformIcon platform={key} className="opacity-40" />
                  {opt.label} — Coming Soon
                </div>
              )
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Primary / Inverse variants ───────────────────────────────────────────────
  const mainButtonBase =
    variant === 'primary'
      ? 'bg-[#6BB589] hover:bg-[#559f70] text-white'
      : 'bg-white text-[#6BB589] hover:bg-gray-50'

  const mainButtonClass = `${mainButtonBase} font-semibold px-8 py-4 rounded-l-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2`
  const chevronButtonClass = `${mainButtonBase} px-3 py-4 rounded-r-full transition-all shadow-lg hover:shadow-xl border-l ${
    variant === 'primary' ? 'border-[#559f70]' : 'border-[#6BB589]/20'
  } flex items-center`

  return (
    <div ref={containerRef} className="relative inline-flex">
      <div className="inline-flex">
        {/* Main download button */}
        {primary.available && primary.url ? (
          <a href={primary.url} className={mainButtonClass}>
            <span>Download for {primary.label}</span>
            <span className={`text-xs font-normal ${variant === 'primary' ? 'text-white/60' : 'text-[#6BB589]/60'}`}>{primary.version}</span>
          </a>
        ) : (
          <button disabled className={`${mainButtonClass} opacity-60 cursor-not-allowed`}>
            <span>{primary.label} — Coming Soon</span>
          </button>
        )}

        {/* Chevron toggle */}
        <button
          onClick={() => setOpen((prev: boolean) => !prev)}
          className={chevronButtonClass}
          aria-label="Other download options"
          aria-expanded={open}
        >
          <svg
            className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 min-w-full whitespace-nowrap">
          {otherOptions.map(([key, opt]) =>
            opt.available && opt.url ? (
              <a
                key={key}
                href={opt.url}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <PlatformIcon platform={key} />
                <span>Download for {opt.label}</span>
                <span className="ml-auto pl-4 text-xs text-gray-400">{opt.version}</span>
              </a>
            ) : (
              <div
                key={key}
                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-400 cursor-not-allowed select-none"
              >
                <PlatformIcon platform={key} className="opacity-40" />
                {opt.label} — Coming Soon
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

function PlatformIcon({ platform, className = '' }: { platform: string; className?: string }) {
  if (platform === 'windows') {
    return (
      <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 5.6L10.5 4.5V11.5H3V5.6ZM11.5 4.35L21 3V11.5H11.5V4.35ZM3 12.5H10.5V19.5L3 18.4V12.5ZM11.5 12.5H21V21L11.5 19.65V12.5Z" />
      </svg>
    )
  }
  if (platform === 'mac') {
    return (
      <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.2 1.3-2.18 3.87.03 3.06 2.67 4.08 2.7 4.09l-.07.13ZM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
      </svg>
    )
  }
  return null
}
