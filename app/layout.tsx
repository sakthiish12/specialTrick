import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "./ClientLayout" // Renamed for clarity
import { PerformanceMonitor } from '@/components/monitoring/performance-monitor'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sakthiish Prince | Cybersecurity, Identity, Data & AI",
  description:
    "Portfolio of Sakthiish Prince - Building Solutions at the Edge of Cybersecurity, Identity, Data and AI.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
        <PerformanceMonitor />
      </body>
    </html>
  )
}
