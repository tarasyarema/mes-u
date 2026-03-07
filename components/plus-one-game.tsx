"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Hand, Users, RotateCcw, Eye, EyeOff } from "lucide-react"

type GamePhase = "setup" | "playing" | "handoff" | "reveal"

export function PlusOneGame() {
  const [phase, setPhase] = useState<GamePhase>("setup")
  const [totalPlayers, setTotalPlayers] = useState(4)
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [choices, setChoices] = useState<boolean[]>([])
  const [showResult, setShowResult] = useState(false)
  const [showChoices, setShowChoices] = useState(false)

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
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Plus One</h1>
                <p className="text-muted-foreground text-sm">
                  Each player secretly adds +1 or passes.
                  <br />
                  Reveal the total at the end!
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground block text-left">
                  How many players?
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
                Start Game
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
                  Player {currentPlayer} of {totalPlayers}
                </p>
                <h2 className="text-2xl font-bold text-foreground">
                  {"It's your turn!"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {"Don't let others see your choice"}
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
                  +1
                </Button>
                <Button
                  onClick={() => makeChoice(false)}
                  variant="secondary"
                  className="h-32 flex flex-col gap-2 text-lg font-semibold"
                  size="lg"
                >
                  <Hand className="w-10 h-10" />
                  Pass
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
                  Choice recorded!
                </h2>
                <p className="text-muted-foreground">
                  Pass the device to <span className="text-accent font-semibold">Player {currentPlayer + 1}</span>
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
                {"I'm Player " + (currentPlayer + 1)}
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
                      All votes are in!
                    </h2>
                    <p className="text-muted-foreground">
                      Everyone gather around for the reveal
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowResult(true)}
                    className="w-full h-14 text-lg font-semibold"
                    size="lg"
                  >
                    Reveal the Total
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm uppercase tracking-wider">
                      The final count is...
                    </p>
                    <div className="relative">
                      <div className="text-8xl font-bold text-primary animate-in zoom-in-50 duration-500">
                        {total}
                      </div>
                      <p className="text-muted-foreground mt-2">
                        out of {totalPlayers} players added +1
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
                          Hide Individual Choices
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Show Individual Choices
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
                    Play Again
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
