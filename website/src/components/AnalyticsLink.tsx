'use client'

import { trackDownload, trackExternalLink, trackCTA } from '@/lib/analytics'
import { ReactNode } from 'react'

type AnalyticsLinkProps = {
  href: string
  children: ReactNode
  className?: string
  trackingType?: 'download' | 'external' | 'cta'
  trackingLabel?: string
  target?: string
}

/**
 * Link component with built-in analytics tracking
 */
export default function AnalyticsLink({
  href,
  children,
  className,
  trackingType = 'external',
  trackingLabel,
  target,
}: AnalyticsLinkProps) {
  const handleClick = () => {
    if (trackingType === 'download') {
      trackDownload(trackingLabel || 'unknown')
    } else if (trackingType === 'cta') {
      trackCTA(trackingLabel || 'unknown', href)
    } else {
      trackExternalLink(href, trackingLabel)
    }
  }

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      target={target}
    >
      {children}
    </a>
  )
}






