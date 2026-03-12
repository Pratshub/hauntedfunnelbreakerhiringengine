import "./globals.css"
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: "Haunted Funnel Breaker",
  description: "AI job search intelligence engine"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
