import type { Metadata, Viewport } from 'next'
import '../index.css'
import { DarkModeProvider } from '../contexts/DarkModeContext'

export const metadata: Metadata = {
  title: 'AI Galaxy',
  description: 'Exploring the future of AI. Discover AI tools, innovations, and insights across the technology galaxy.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark" data-scroll-behavior="smooth">
      <body className="bg-gray-50 dark:bg-gray-950 dark" suppressHydrationWarning>
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  )
}

