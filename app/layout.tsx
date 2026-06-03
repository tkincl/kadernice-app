import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import BottomNav from "@/components/BottomNav"
import DataProvider from "@/components/DataProvider"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kadeřnice",
  description: "Aplikace pro kadeřnice",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kadeřnice",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className={`${geist.className} bg-gray-50`}>
        <div className="max-w-md mx-auto bg-white relative" style={{minHeight: "100dvh"}}>
          <DataProvider>
            <main style={{paddingBottom: "80px"}}>{children}</main>
            <BottomNav />
          </DataProvider>
        </div>
      </body>
    </html>
  )
}
