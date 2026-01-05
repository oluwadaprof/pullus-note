// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/src/primitives/theme-provider'
import { Providers } from '@/src/app/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notes App - Offline First PWA',
  description: 'A progressive web app for note-taking with offline support',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='dark' suppressHydrationWarning>
      <body className={`theme-transition ${inter.className}`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          themes={['orange', 'light', 'dark', 'red', 'rose']}
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}