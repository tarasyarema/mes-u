"use client"

import { useSearchParams } from "next/navigation"
import { MultiDeviceGame } from "@/components/multi-device-game"
import { Suspense } from "react"

function OnlineGameContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  
  return <MultiDeviceGame initialCode={code || undefined} />
}

export default function OnlinePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <OnlineGameContent />
    </Suspense>
  )
}
