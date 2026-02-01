import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ezspeak - Voice to Text for Windows",
  description: "Free voice-to-text transcription for Windows using OpenAI Whisper. Press a button, speak naturally, and watch your words appear instantly.",
  keywords: ["voice to text", "speech to text", "transcription", "Windows", "OpenAI Whisper", "dictation"],
  authors: [{ name: "Arman Mahjoor" }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: "ezspeak - Voice to Text for Windows",
    description: "Free voice-to-text transcription powered by OpenAI Whisper",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
