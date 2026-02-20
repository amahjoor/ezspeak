import Link from 'next/link'
import GitHubStars from '@/components/GitHubStars'
import DownloadButton from '@/components/DownloadButton'
import { HeroVideoDialog } from '@/components/HeroVideoDialog'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6BB589] rounded-lg flex items-center justify-center text-[#ffffff] font-bold text-sm">
              ez
            </div>
            <span className="font-bold text-xl">ezspeak</span>
          </div>
          <div className="flex items-center gap-6">
            <DownloadButton variant="nav" />
            <a
              href="https://discord.gg/WmZrBBEpab"
              target="_blank"
              className="text-gray-600 hover:text-gray-900"
            >
              Discord
            </a>
            <GitHubStars />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 leading-[1.15] py-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Voice to text made ez.
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Voice-to-text transcription for any app. Choose local offline transcription
            for complete privacy, or use OpenAI Whisper for cloud processing.
            Press a button, and watch what you say appear.
          </p>

          <div className="flex items-center justify-center">
            <DownloadButton variant="primary" />
          </div>

          <div className="flex items-center justify-center mt-4">
            <a
              href="https://github.com/amahjoor/ezspeak"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-sm font-medium transition-all shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Star on GitHub
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Free forever • No account needed • Local or cloud
          </p>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <HeroVideoDialog
            animationStyle="from-center"
            videoSrc="https://www.youtube.com/embed/e5Ah0JnQxB8?vq=hd1080"
            thumbnailSrc="https://img.youtube.com/vi/e5Ah0JnQxB8/maxresdefault.jpg"
            thumbnailAlt="ezspeak Demo Video"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Features that matter</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Feature 1 - Works in Any App */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#6BB589] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Works in Any App</h3>
              <p className="text-gray-600">
                Browsers, Slack, Word, code editors — anywhere you can type, ezspeak works. No integration needed.
              </p>
            </div>

            {/* Feature 3 - Local or Cloud */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#6BB589] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Local or Cloud</h3>
              <p className="text-gray-600">
                Run fully offline with on-device Whisper, or use OpenAI&apos;s API. Switch anytime in settings.
              </p>
            </div>

            {/* Feature 4 - Transcription History */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#6BB589] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Transcription History</h3>
              <p className="text-gray-600">
                Every recording is saved automatically. Tap any entry to copy it back to your clipboard instantly.
              </p>
            </div>

            {/* Feature 5 - Privacy First */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#6BB589] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-gray-600">
                Local mode never sends audio anywhere. No account, no telemetry, no BS.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 px-4 bg-gradient-to-br from-[#6BB589] to-[#559f70]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to speak instead of type?</h2>
          <p className="text-xl mb-8 opacity-90">
            Download ezspeak and start transcribing in minutes.
          </p>

          <DownloadButton variant="inverse" />

          <p className="text-sm mt-6 opacity-75">
            Free forever • Open source
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently asked questions</h2>

          <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {[
              {
                q: "Is ezspeak really free?",
                a: "Yes! ezspeak is free and open source. You only pay for API usage when using cloud transcription services, which is typically very affordable."
              },
              {
                q: "Is my voice data private?",
                a: "With local transcription, your audio never leaves your computer. When using cloud services, audio is processed and immediately deleted. We do not store or use your data. API keys (when used) are stored locally and encrypted."
              },
              {
                q: "Which apps does ezspeak work with?",
                a: "ezspeak works with any application that accepts text input: web browsers, Microsoft Word, Slack, Discord, email clients, code editors, and more."
              },
              {
                q: "What languages are supported?",
                a: "ezspeak supports over 50 languages including English, Spanish, French, German, Chinese, Japanese, and many more through both local and cloud transcription options."
              },
              {
                q: "Do I need internet for local transcription?",
                a: "No! Local transcription works completely offline. The AI model is downloaded once and stored on your computer. You only need internet to download the model initially."
              },
            ].map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-xl font-semibold list-none">
                  {q}
                  <span className="ml-4 flex-shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-gray-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#6BB589] rounded-lg flex items-center justify-center text-[#ffffff] font-bold text-sm">
                  ez
                </div>
                <span className="font-bold text-white">ezspeak</span>
              </div>
              <span className="text-sm">
                Created by{' '}
                <a
                  href="https://mahjoor.com"
                  target="_blank"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Arman Mahjoor
                </a>
              </span>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://discord.gg/WmZrBBEpab" target="_blank" className="hover:text-white transition-colors">
                Discord
              </a>
              <a href="https://github.com/amahjoor/ezspeak" target="_blank" className="hover:text-white transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
