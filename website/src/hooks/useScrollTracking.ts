'use client'

import { useEffect, useRef } from 'react'
import { trackSectionView } from '@/lib/analytics'

/**
 * Hook to track when a section becomes visible
 */
export function useScrollTracking(sectionName: string) {
  const sectionRef = useRef<HTMLElement>(null)
  const hasTracked = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            trackSectionView(sectionName)
            hasTracked.current = true
          }
        })
      },
      { threshold: 0.3 } // Track when 30% of the section is visible
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [sectionName])

  return sectionRef
}






