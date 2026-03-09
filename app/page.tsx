"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Smartphone, Monitor, Languages, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { PlusOneGame } from "@/components/plus-one-game"

type Language = "ca" | "en"

const translations = {
  ca: {
    title: "Mes U",
    subtitle: "Cada jugador afegeix +1 o passa en secret.",
    subtitleLine2: "Reveleu el total al final!",
    singleDevice: "Un Dispositiu",
    singleDeviceDesc: "Passeu el telèfon entre jugadors",
    multiDevice: "Multidispositiu",
    multiDeviceDesc: "Cada jugador usa el seu propi dispositiu",
  },
  en: {
    title: "Plus One",
    subtitle: "Each player secretly adds +1 or passes.",
    subtitleLine2: "Reveal the total at the end!",
    singleDevice: "Single Device",
    singleDeviceDesc: "Pass the phone between players",
    multiDevice: "Multi-device",
    multiDeviceDesc: "Each player uses their own device",
  },
}

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("ca")
  const [multiDeviceEnabled, setMultiDeviceEnabled] = useState<boolean | null>(null)
  const { theme, setTheme } = useTheme()
  const t = translations[language]

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setMultiDeviceEnabled(data.multiDeviceEnabled))
      .catch(() => setMultiDeviceEnabled(false))
  }, [])

  // If Redis is not configured, directly show single-device game
  if (multiDeviceEnabled === false) {
    return <PlusOneGame />
  }

  // Loading state
  if (multiDeviceEnabled === null) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm border-border bg-card">
        <CardContent className="pt-8 pb-8 px-6">
          <div className="text-center space-y-6">
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <Button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => setLanguage(language === "ca" ? "en" : "ca")}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Languages className="w-4 h-4 mr-1" />
                {language === "ca" ? "EN" : "CA"}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
              <p className="text-muted-foreground text-sm">
                {t.subtitle}
                <br />
                {t.subtitleLine2}
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/local" className="block">
                <Button className="w-full h-auto py-4 flex flex-col items-center gap-1" size="lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    <span className="text-lg font-semibold">{t.singleDevice}</span>
                  </div>
                  <span className="text-xs opacity-80 font-normal">{t.singleDeviceDesc}</span>
                </Button>
              </Link>
              <Link href="/online" className="block">
                <Button variant="secondary" className="w-full h-auto py-4 flex flex-col items-center gap-1" size="lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    <span className="text-lg font-semibold">{t.multiDevice}</span>
                  </div>
                  <span className="text-xs opacity-80 font-normal">{t.multiDeviceDesc}</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
