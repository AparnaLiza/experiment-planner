import './globals.css'

export const metadata = {
  title: 'Experiment Planner',
  description: 'Plan your research experiments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 overflow-hidden">{children}</body>
    </html>
  )
}
