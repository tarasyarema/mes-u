"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Hand, Users, RotateCcw, Eye, EyeOff, Languages } from "lucide-react"

type GamePhase = "setup" | "playing" | "handoff" | "reveal"
type Language = "ca" | "en"

const translations = {
  ca: {
    title: "Més U",
    subtitle: "Cada jugador afegeix +1 o passa en secret.",
    subtitleLine2: "Reveleu el total al final!",
    howManyPlayers: "Quants jugadors?",
    startGame: "Comença el Joc",
    playerOf: "Jugador {current} de {total}",
    yourTurn: "Et toca!",
    dontLetOthersSee: "No deixis que els altres vegin la teva elecció",
    plusOne: "+1",
    pass: "Passar",
    choiceRecorded: "Elecció enregistrada!",
    passDeviceTo: "Passa el dispositiu a",
    player: "Jugador",
    imPlayer: "Soc el Jugador {num}",
    allVotesIn: "Tots els vots estan!",
    everyoneGather: "Tots a prop per la revelació",
    revealTotal: "Revela el Total",
    finalCountIs: "El recompte final és...",
    outOf: "de {total} jugadors han afegit +1",
    showChoices: "Mostra Eleccions Individuals",
    hideChoices: "Amaga Eleccions Individuals",
    playAgain: "Torna a Jugar",
  },
  en: {
    title: "Plus One",
    subtitle: "Each player secretly adds +1 or passes.",
    subtitleLine2: "Reveal the total at the end!",
    howManyPlayers: "How many players?",
    startGame: "Start Game",
    playerOf: "Player {current} of {total}",
    yourTurn: "It's your turn!",
    dontLetOthersSee: "Don't let others see your choice",
    plusOne: "+1",
    pass: "Pass",
    choiceRecorded: "Choice recorded!",
    passDeviceTo: "Pass the device to",
    player: "Player",
    imPlayer: "I'm Player {num}",
    allVotesIn: "All votes are in!",
    everyoneGather: "Everyone gather around for the reveal",
    revealTotal: "Reveal the Total",
    finalCountIs: "The final count is...",
    outOf: "out of {total} players added +1",
    showChoices: "Show Individual Choices",
    hideChoices: "Hide Individual Choices",
    playAgain: "Play Again",
  },
}

export function PlusOneGame() {
  const [phase, setPhase] = useState<GamePhase>("setup")
  const [totalPlayers, setTotalPlayers] = useState(4)
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [choices, setChoices] = useState<boolean[]>([])
  const [showResult, setShowResult] = useState(false)
  const [showChoices, setShowChoices] = useState(false)
  const [language, setLanguage] = useState<Language>("ca")

  const t = translations[language]

  const startGame = () => {
    if (totalPlayers >= 2) {
      setChoices([])
      setCurrentPlayer(1)
      setPhase("playing")
      setShowResult(false)
    }
  }

  const makeChoice = (addOne: boolean) => {
    const newChoices = [...choices, addOne]
    setChoices(newChoices)

    if (newChoices.length >= totalPlayers) {
      setPhase("reveal")
    } else {
      setPhase("handoff")
    }
  }

  const nextPlayer = () => {
    setCurrentPlayer(currentPlayer + 1)
    setPhase("playing")
  }

  const resetGame = () => {
    setPhase("setup")
    setChoices([])
    setCurrentPlayer(1)
    setShowResult(false)
    setShowChoices(false)
  }

  const total = choices.filter(Boolean).length

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {phase === "setup" && (
        <Card className="w-full max-w-sm border-border bg-card">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="text-center space-y-6">
              <Button
                onClick={() => setLanguage(language === "ca" ? "en" : "ca")}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <Languages className="w-4 h-4 mr-1" />
                {language === "ca" ? "EN" : "CA"}
              </Button>

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
                <label className="text-sm font-medium text-foreground block text-left">
                  {t.howManyPlayers}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={99}
                  value={totalPlayers === 0 ? "" : totalPlayers}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "") {
                      setTotalPlayers(0)
                    } else {
                      setTotalPlayers(parseInt(val) || 0)
                    }
                  }}
                  className="text-center text-xl font-bold h-14 bg-input border-border text-foreground"
                />
              </div>

              <Button
                onClick={startGame}
                disabled={totalPlayers < 2}
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                {t.startGame}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "playing" && (
        <Card className="w-full max-w-sm border-border bg-card">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="text-center space-y-8">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm uppercase tracking-wider">
                  {t.playerOf.replace("{current}", String(currentPlayer)).replace("{total}", String(totalPlayers))}
                </p>
                <h2 className="text-2xl font-bold text-foreground">
                  {t.yourTurn}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t.dontLetOthersSee}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: totalPlayers }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i < currentPlayer - 1
                        ? "bg-primary"
                        : i === currentPlayer - 1
                        ? "bg-accent scale-125"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => makeChoice(true)}
                  className="h-32 flex flex-col gap-2 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  <Plus className="w-10 h-10" />
                  {t.plusOne}
                </Button>
                <Button
                  onClick={() => makeChoice(false)}
                  variant="secondary"
                  className="h-32 flex flex-col gap-2 text-lg font-semibold"
                  size="lg"
                >
                  <Hand className="w-10 h-10" />
                  {t.pass}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "handoff" && (
        <Card className="w-full max-w-sm border-border bg-card">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
                <EyeOff className="w-8 h-8 text-accent" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {t.choiceRecorded}
                </h2>
                <p className="text-muted-foreground">
                  {t.passDeviceTo} <span className="text-accent font-semibold">{t.player} {currentPlayer + 1}</span>
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: totalPlayers }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i < currentPlayer
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={nextPlayer}
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                {t.imPlayer.replace("{num}", String(currentPlayer + 1))}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "reveal" && (
        <Card className="w-full max-w-sm border-border bg-card">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="text-center space-y-6">
              {!showResult ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      {t.allVotesIn}
                    </h2>
                    <p className="text-muted-foreground">
                      {t.everyoneGather}
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowResult(true)}
                    className="w-full h-14 text-lg font-semibold"
                    size="lg"
                  >
                    {t.revealTotal}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm uppercase tracking-wider">
                      {t.finalCountIs}
                    </p>
                    <div className="relative">
                      <div className="text-8xl font-bold text-primary animate-in zoom-in-50 duration-500">
                        {total}
                      </div>
                      <p className="text-muted-foreground mt-2">
                        {t.outOf.replace("{total}", String(totalPlayers))}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      onClick={() => setShowChoices(!showChoices)}
                      variant="outline"
                      className="w-full h-12"
                    >
                      {showChoices ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          {t.hideChoices}
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          {t.showChoices}
                        </>
                      )}
                    </Button>
                    
                    {showChoices && (
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {choices.map((choice, i) => (
                          <div
                            key={i}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all animate-in fade-in-0 duration-300 ${
                              choice
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                            style={{ animationDelay: `${i * 100}ms` }}
                          >
                            {choice ? "+1" : "—"}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={resetGame}
                    variant="secondary"
                    className="w-full h-14 text-lg font-semibold"
                    size="lg"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    {t.playAgain}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
