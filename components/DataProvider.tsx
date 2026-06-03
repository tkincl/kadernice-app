"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"

export default function DataProvider({ children }: { children: React.ReactNode }) {
  const nacistVse = useAppStore((s) => s.nacistVse)
  const nacitani = useAppStore((s) => s.nacitani)

  useEffect(() => {
    nacistVse()
  }, [nacistVse])

  if (nacitani) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Načítám data...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
