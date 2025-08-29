import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import "@/lib/execution-client" // Import execution client globally
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

export const metadata: Metadata = {
  title: 'Kōan - Build and Deploy DeFi Protocols',
  description: 'A powerful platform to build and deploy DeFi protocols and DAO governance systems with advanced tooling',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}

/* Safe area handling for mobile devices */
@media screen and (max-width: 768px) {
  :root {
    --vh: 1vh;
  }
}

/* Smooth scrolling for better UX */
html {
  scroll-behavior: smooth;
}

/* Better focus handling on mobile */
@media (max-width: 768px) {
  input, textarea, select {
    font-size: 16px !important;
  }
}
        `}</style>
      </head>
      <body className="antialiased">
        <ReactFlowProvider>
          {children}
        </ReactFlowProvider>
      </body>
    </html>
  )
}
