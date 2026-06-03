import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import BottomNav from "@/components/BottomNav"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kadeřnice",
  description: "Aplikace pro kadeřnice",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className={`${geist.className} bg-gray-50`}>
        <div className="max-w-md mx-auto min-h-screen bg-white relative">
          <main className="pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
