import Link from 'next/link'
import GitHubStars from '@/components/GitHubStars'

/**
 * GitHub download URL for the latest release
 * Update this value to change all download links across the website
 */
const GITHUB_DOWNLOAD_URL = 'https://github.com/amahjoor/ezspeak/releases/download/v1.0.4/ezspeak.Setup.1.0.4.exe'

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
            <a href={GITHUB_DOWNLOAD_URL} className="text-gray-600 hover:text-gray-900">Download</a>
            <a
              href="https://discord.gg/WmZrBBEpab"
              target="_blank"
              className="text-gray-600 hover:text-gray-900"
            >
              Discord
            </a>
            <div className="flex items-center group">
              <a
                href="https://github.com/amahjoor/ezspeak"
                target="_blank"
                className="text-gray-600 group-hover:text-gray-900 pl-3 pr-2 py-1.5 group-hover:bg-gray-100 rounded-l-md transition-colors"
              >
                GitHub
              </a>
              <GitHubStars />
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 mb-8 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Free & Open Source
            </span>
            <span>•</span>
            <span>Windows 10+</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Local or Cloud
            </span>
          </div>

          <h1 className="text-6xl font-bold mb-6 leading-[1.15] py-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Speak, don&apos;t type
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Voice-to-text transcription for Windows. Choose local offline transcription
            for complete privacy, or use OpenAI Whisper for cloud processing.
            Press a button, speak naturally, and watch your words appear instantly.
          </p>

          <div className="flex items-center justify-center gap-4">
            <a
              href={GITHUB_DOWNLOAD_URL}
              className="bg-[#6BB589] hover:bg-[#559f70] text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl"
            >
              Download ezspeak
            </a>
            <a
              href="https://github.com/amahjoor/ezspeak"
              target="_blank"
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-4 rounded-full transition-all"
            >
              View on GitHub
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Free forever • No account needed • Installs in seconds
          </p>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="aspect-video rounded-2xl shadow-2xl overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/e5Ah0JnQxB8?vq=hd1080"
              title="ezspeak Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Features that matter</h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Everything you need for fast, accurate voice transcription
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - One-Key Recording */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#6BB589] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Recording</h3>
              <p className="text-gray-600">
                Press your hotkey to start recording. Speak naturally. Press again to stop.
                Text appears instantly at your cursor - no waiting, no fuss.
              </p>
            </div>

            {/* Feature 2 - Local or Cloud */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow relative">
              <div className="w-12 h-12 bg-[#6BB589] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Local or Cloud</h3>
              <p className="text-gray-600">
                Choose offline transcription for complete privacy and no internet required,
                or use cloud APIs for processing. Switch anytime based on your needs.
              </p>
            </div>

            {/* Feature 3 - Auto-Paste */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#6BB589] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto-Paste</h3>
              <p className="text-gray-600">
                Transcribed text automatically pastes at your cursor location.
                Works in any Windows app - browsers, Word, Slack, anywhere.
              </p>
            </div>

            {/* Feature 4 - Custom Hotkeys */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#6BB589] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Controls</h3>
              <p className="text-gray-600">
                Customize hotkeys, toggle modes, and recording behavior.
                Set up push-to-talk, hold-to-record, or any workflow that suits you.
              </p>
            </div>

            {/* Feature 5 - Privacy & Security */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#6BB589] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-gray-600">
                Your audio stays private. Local processing never leaves your device.
                Optional cloud APIs only process when you choose them.
              </p>
            </div>

            {/* Feature 6 - System Tray App */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#6BB589] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">System Tray App</h3>
              <p className="text-gray-600">
                Runs quietly in your system tray. Always ready, never in the way.
                Minimal resource usage, maximum productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How it works</h2>

          <div className="space-y-12">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-[#6BB589] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Install & Configure</h3>
                <p className="text-gray-600">
                  Download the installer, add your OpenAI API key, and choose your recording hotkey.
                  Takes less than 2 minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-[#6BB589] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Press Your Hotkey</h3>
                <p className="text-gray-600">
                  Place your cursor in any text field. Press your hotkey (default: Right Ctrl)
                  to start recording.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-[#6BB589] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Speak Naturally</h3>
                <p className="text-gray-600">
                  Speak in your natural voice. No need to speak slowly or enunciate.
                  Whisper understands natural speech patterns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-[#6BB589] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Text Appears</h3>
                <p className="text-gray-600">
                  Press your hotkey again (or release in hold mode). Your transcribed text
                  instantly appears at your cursor. That&apos;s it!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Simply free pricing.</h2>
          <p className="text-gray-600 mb-16 max-w-2xl mx-auto">
            ezspeak is free and open source. Local transcription is completely free with zero cost.
            Cloud transcription only costs when you use API services.
          </p>

          <div className="bg-white p-12 rounded-3xl border border-gray-300 shadow-xl max-w-lg mx-auto">
            <div className="w-16 h-16 bg-[#6BB589] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-2">Free Forever</h3>
            <p className="text-gray-600 mb-8">Open source • No subscription</p>

            <div className="space-y-4 text-left mb-8">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6BB589] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Local or cloud transcription</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6BB589] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited recordings</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6BB589] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>High-quality speech recognition</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6BB589] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>All features included</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6BB589] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Privacy controls</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6BB589] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Open source code</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 px-4 bg-gradient-to-br from-[#6BB589] to-[#559f70]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to speak instead of type?</h2>
          <p className="text-xl mb-8 opacity-90">
            Download ezspeak for Windows and start transcribing in minutes.
          </p>

          <a
            href={GITHUB_DOWNLOAD_URL}
            className="inline-block bg-white text-[#6BB589] font-semibold px-10 py-5 rounded-full hover:shadow-2xl transition-all text-lg"
          >
            Download for Windows
          </a>

          <p className="text-sm mt-6 opacity-75">
            Windows 10+ • Free forever
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently asked questions</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Is ezspeak really free?</h3>
              <p className="text-gray-600">
                Yes! ezspeak is free and open source. You only pay for API usage when using
                cloud transcription services, which is typically very affordable.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Do I need any accounts?</h3>
              <p className="text-gray-600">
                No accounts needed for local transcription - it works completely offline.
                If you want to use cloud APIs for transcription, you&apos;ll need to create
                an account with your preferred service provider.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Is my voice data private?</h3>
              <p className="text-gray-600">
                With local transcription, your audio never leaves your computer. When using cloud
                services, audio is processed and immediately deleted. We do not store or use your data.
                API keys (when used) are stored locally and encrypted.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Which apps does ezspeak work with?</h3>
              <p className="text-gray-600">
                ezspeak works with any Windows application that accepts text input: web browsers,
                Microsoft Word, Slack, Discord, email clients, code editors, and more.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">What languages are supported?</h3>
              <p className="text-gray-600">
                ezspeak supports over 50 languages including English, Spanish, French, German,
                Chinese, Japanese, and many more through both local and cloud transcription options.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Can I customize the hotkey?</h3>
              <p className="text-gray-600">
                Absolutely! You can set any key as your recording hotkey. The default is Right Ctrl,
                but you can change it to any function key or modifier key you prefer.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Do I need internet for local transcription?</h3>
              <p className="text-gray-600">
                No! Local transcription works completely offline. The AI model is downloaded
                once and stored on your computer. You only need internet to download the model initially.
              </p>
            </div>
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
                Made by{' '}
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
