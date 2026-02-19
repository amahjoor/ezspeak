'use client'

import { useEffect, useState } from 'react'

export default function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    fetch('https://api.github.com/repos/amahjoor/ezspeak')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count)
        }
      })
      .catch(() => {
        // Fallback to just showing "Star" if API fails
      })
  }, [])

  return (
    <a
      href="https://github.com/amahjoor/ezspeak/"
      target="_blank"
      className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors"
    >
      <span className="text-sm font-medium text-gray-600">
        {stars !== null ? stars.toLocaleString() : '...'}
      </span>
      <svg className="w-4 h-4 stroke-gray-600 fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    </a>
  )
}

