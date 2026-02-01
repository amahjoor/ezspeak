// Analytics event tracking utilities

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
}

type EventParams = {
  category?: string
  label?: string
  value?: number
  [key: string]: any
}

/**
 * Track a custom event
 */
export const trackEvent = (
  action: string,
  params?: EventParams
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params)
  }
}

/**
 * Track download button clicks
 */
export const trackDownload = (location: string) => {
  trackEvent('download_click', {
    category: 'Downloads',
    label: location,
    download_location: location,
  })
}

/**
 * Track external link clicks
 */
export const trackExternalLink = (
  destination: string,
  label?: string
) => {
  trackEvent('external_link_click', {
    category: 'Engagement',
    label: label || destination,
    link_destination: destination,
  })
}

/**
 * Track CTA button clicks
 */
export const trackCTA = (
  ctaName: string,
  location: string
) => {
  trackEvent('cta_click', {
    category: 'Engagement',
    label: ctaName,
    cta_location: location,
  })
}

/**
 * Track section visibility (when user scrolls to a section)
 */
export const trackSectionView = (sectionName: string) => {
  trackEvent('section_view', {
    category: 'Engagement',
    label: sectionName,
    section_name: sectionName,
  })
}

/**
 * Track video interactions
 */
export const trackVideoInteraction = (
  action: 'play' | 'pause' | 'complete',
  videoName: string
) => {
  trackEvent('video_interaction', {
    category: 'Video',
    label: `${action}_${videoName}`,
    video_action: action,
    video_name: videoName,
  })
}






