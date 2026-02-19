import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ezspeak - Voice to Text for Any App",
  description: "Free voice-to-text transcription using OpenAI Whisper. Press a button, speak naturally, and watch your words appear instantly.",
  keywords: ["voice to text", "speech to text", "transcription", "OpenAI Whisper", "dictation", "local transcription"],
  authors: [{ name: "Arman Mahjoor" }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: "ezspeak - Voice to Text for Any App",
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
