import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects | Portfolio',
  description: 'Explore my open source projects and contributions.',
  openGraph: {
    title: 'Projects | Portfolio',
    description: 'Explore my open source projects and contributions.',
    type: 'website'
  }
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
