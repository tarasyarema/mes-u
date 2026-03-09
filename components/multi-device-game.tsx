"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Hand,
  Users,
  RotateCcw,
  Eye,
  EyeOff,
  Languages,
  QrCode,
  Crown,
  Check,
  Clock,
  Play,
  Square,
  Copy,
  CheckCheck,
  Sun,
  Moon,
  Home,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import type { RoomState } from "@/lib/redis"

type GameView = "home" | "create" | "join" | "lobby" | "playing" | "voted" | "results"
type Language = "ca" | "en"

const translations = {
  ca: {
    title: "Mes U",
    subtitle: "Versió multidispositiu",
    createRoom: "Crea una sala",
    joinRoom: "Uneix-te a una sala",
    yourName: "El teu nom",
    roomCode: "Codi de sala",
    create: "Crear",
    join: "Unir-se",
    back: "Enrere",
    scanQR: "Escaneja el QR o comparteix el codi",
    playersInRoom: "Jugadors a la sala",
    waitingForPlayers: "Esperant jugadors...",
    startGame: "Comença el joc",
    waitingForLeader: "Esperant que el líder comenci...",
    yourTurn: "Et toca!",
    dontLetOthersSee: "Fes la teva elecció",
    plusOne: "+1",
    pass: "Passar",
    voteRecorded: "Vot enregistrat!",
    waitingForOthers: "Esperant els altres jugadors...",
    playersVoted: "{voted} de {total} han votat",
    gameFinished: "Joc acabat!",
    finalCountIs: "El recompte final és...",
    outOf: "de {total} jugadors han afegit +1",
    showChoices: "Mostra les eleccions",
    hideChoices: "Amaga les eleccions",
    playAgain: "Torna a jugar",
    stopGame: "Atura el joc",
    backToLobby: "Torna a la sala",
    onlyLeaderSees: "Només el líder veu les eleccions individuals",
    leader: "Líder",
    you: "Tu",
    voted: "Ha votat",
    waiting: "Esperant",
    copied: "Copiat!",
    copyCode: "Copia el codi",
    needMorePlayers: "Calen mínim 2 jugadors",
    roomNotFound: "Sala no trobada",
    gameInProgress: "El joc ja ha començat",
    home: "Inici",
  },
  en: {
    title: "Plus One",
    subtitle: "Multi-device Version",
    createRoom: "Create Room",
    joinRoom: "Join Room",
    yourName: "Your name",
    roomCode: "Room code",
    create: "Create",
    join: "Join",
    back: "Back",
    scanQR: "Scan the QR or share the code",
    playersInRoom: "Players in room",
    waitingForPlayers: "Waiting for players...",
    startGame: "Start Game",
    waitingForLeader: "Waiting for the leader to start...",
    yourTurn: "Your turn!",
    dontLetOthersSee: "Make your choice",
    plusOne: "+1",
    pass: "Pass",
    voteRecorded: "Vote recorded!",
    waitingForOthers: "Waiting for other players...",
    playersVoted: "{voted} of {total} have voted",
    gameFinished: "Game finished!",
    finalCountIs: "The final count is...",
    outOf: "out of {total} players added +1",
    showChoices: "Show Choices",
    hideChoices: "Hide Choices",
    playAgain: "Play Again",
    stopGame: "Stop Game",
    backToLobby: "Back to Lobby",
    onlyLeaderSees: "Only the leader sees individual choices",
    leader: "Leader",
    you: "You",
    voted: "Voted",
    waiting: "Waiting",
    copied: "Copied!",
    copyCode: "Copy code",
    needMorePlayers: "Need at least 2 players",
    roomNotFound: "Room not found",
    gameInProgress: "Game already in progress",
    home: "Home",
  },
}

export function MultiDeviceGame() {
  const [view, setView] = useState<GameView>("home")
  const [language, setLanguage] = useState<Language>("ca")
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [room, setRoom] = useState<RoomState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showChoices, setShowChoices] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const { theme, setTheme } = useTheme()

  const t = translations[language]

  const isLeader = room && playerId === room.leaderId
  const currentPlayer = room?.players.find((p) => p.id === playerId)

  const pollRoom = useCallback(async () => {
    if (!roomCode) return
    try {
      const res = await fetch(`/api/room/${roomCode}`)
      if (res.ok) {
        const data = await res.json()
        setRoom(data.room)

        // Update view based on room state
        if (data.room.phase === "waiting") {
          setView("lobby")
          setHasVoted(false)
        } else if (data.room.phase === "playing") {
          const player = data.room.players.find((p: { id: string }) => p.id === playerId)
          if (player?.hasVoted) {
            setHasVoted(true)
            setView("voted")
          } else {
            setView("playing")
          }
        } else if (data.room.phase === "finished") {
          setView("results")
        }
      }
    } catch (err) {
      console.error("Error polling room:", err)
    }
  }, [roomCode, playerId])

  useEffect(() => {
    if (!roomCode || view === "home" || view === "create" || view === "join") return

    const interval = setInterval(pollRoom, 1500)
    return () => clearInterval(interval)
  }, [roomCode, view, pollRoom])

  const createRoom = async () => {
    if (!playerName.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderName: playerName.trim() }),
      })

      if (!res.ok) throw new Error("Failed to create room")

      const data = await res.json()
      setRoom(data.room)
      setPlayerId(data.playerId)
      setRoomCode(data.room.id)
      setView("lobby")
    } catch (err) {
      setError("Failed to create room")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: roomCode.trim().toUpperCase(), playerName: playerName.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 404) setError(t.roomNotFound)
        else if (res.status === 400) setError(t.gameInProgress)
        else setError(data.error || "Failed to join room")
        return
      }

      setRoom(data.room)
      setPlayerId(data.playerId)
      setRoomCode(data.room.id)
      setView("lobby")
    } catch (err) {
      setError("Failed to join room")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const controlGame = async (action: "start" | "stop" | "restart" | "reset") => {
    if (!roomCode || !playerId) return
    setLoading(true)

    try {
      const res = await fetch(`/api/room/${roomCode}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, playerId }),
      })

      if (res.ok) {
        const data = await res.json()
        setRoom(data.room)
        setShowChoices(false)
        setHasVoted(false)
      }
    } catch (err) {
      console.error("Error controlling game:", err)
    } finally {
      setLoading(false)
    }
  }

  const vote = async (addOne: boolean) => {
    if (!roomCode || !playerId || hasVoted) return
    setLoading(true)

    try {
      const res = await fetch(`/api/room/${roomCode}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, vote: addOne }),
      })

      if (res.ok) {
        const data = await res.json()
        setRoom(data.room)
        setHasVoted(true)
        setView("voted")
      }
    } catch (err) {
      console.error("Error voting:", err)
    } finally {
      setLoading(false)
    }
  }

  const copyRoomCode = async () => {
    if (!roomCode) return
    await navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetAll = () => {
    setView("home")
    setRoom(null)
    setPlayerId(null)
    setRoomCode("")
    setError(null)
    setShowChoices(false)
    setHasVoted(false)
  }

  const total = room ? Object.values(room.votes).filter(Boolean).length : 0
  const votedCount = room ? room.players.filter((p) => p.hasVoted).length : 0
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/online?code=${roomCode}` : ""

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Home */}
      {view === "home" && (
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
                <p className="text-muted-foreground text-sm">{t.subtitle}</p>
              </div>

              <div className="space-y-3">
                <Button onClick={() => setView("create")} className="w-full h-14 text-lg font-semibold" size="lg">
                  <QrCode className="w-5 h-5 mr-2" />
                  {t.createRoom}
                </Button>
                <Button
                  onClick={() => setView("join")}
                  variant="secondary"
                  className="w-full h-14 text-lg font-semibold"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  {t.joinRoom}
                </Button>

                <Link href="/">
                  <Button variant="ghost" className="w-full h-10 text-muted-foreground">
                    <Home className="w-4 h-4 mr-2" />
                    {t.home}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Room */}
      {view === "create" && (
        <Card className="w-full max-w-sm border-border bg-card">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">{t.createRoom}</h1>
              </div>

              <div className="space-y-3 text-left">
                <label className="text-sm font-medium text-foreground block">{t.yourName}</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="..."
                  className="h-14 text-lg bg-input border-border text-foreground"
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <div className="flex gap-3">
                <Button onClick={() => setView("home")} variant="outline" className="flex-1 h-12">
                  {t.back}
                </Button>
                <Button
                  onClick={createRoom}
                  disabled={!playerName.trim() || loading}
                  className="flex-1 h-12 font-semibold"
                >
                  {t.create}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join Room */}
      {view === "join" && (
        <Card className="w-full max-w-sm border-border bg-card">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">{t.joinRoom}</h1>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-foreground block">{t.yourName}</label>
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="..."
                    className="h-14 text-lg bg-input border-border text-foreground"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-foreground block">{t.roomCode}</label>
                  <Input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="ABCD"
                    maxLength={4}
                    className="h-14 text-lg text-center font-mono tracking-widest bg-input border-border text-foreground uppercase"
                  />
                </div>
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <div className="flex gap-3">
                <Button onClick={() => setView("home")} variant="outline" className="flex-1 h-12">
                  {t.back}
                </Button>
                <Button
                  onClick={joinRoom}
                  disabled={!playerName.trim() || !roomCode.trim() || loading}
                  className="flex-1 h-12 font-semibold"
                >
                  {t.join}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lobby */}
      {view === "lobby" && room && (
        <Card className="w-full max-w-sm border-border bg-card">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="text-center space-y-6">
              {isLeader && (
                <>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground">{t.scanQR}</h2>
                    <div className="bg-white p-4 rounded-xl inline-block">
                      <QRCodeSVG value={joinUrl} size={160} />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-mono font-bold tracking-widest text-primary">{roomCode}</span>
                      <Button onClick={copyRoomCode} variant="ghost" size="sm">
                        {copied ? <CheckCheck className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {!isLeader && (
                <div className="space-y-2">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h2 className="text-xl font-bold text-foreground">{t.waitingForLeader}</h2>
                  <p className="text-2xl font-mono font-bold tracking-widest text-primary">{roomCode}</p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t.playersInRoom}</p>
                <div className="space-y-2">
                  {room.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg"
                    >
                      <span className="font-medium text-foreground">{player.name}</span>
                      <div className="flex items-center gap-2">
                        {player.id === room.leaderId && <Crown className="w-4 h-4 text-accent" />}
                        {player.id === playerId && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{t.you}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isLeader && (
                <Button
                  onClick={() => controlGame("start")}
                  disabled={room.players.length < 2 || loading}
                  className="w-full h-14 text-lg font-semibold"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {room.players.length < 2 ? t.needMorePlayers : t.startGame}
                </Button>
              )}

              <Link href="/">
                <Button variant="ghost" className="w-full h-10 text-muted-foreground">
                  <Home className="w-4 h-4 mr-2" />
                  {t.home}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playing */}
      {view === "playing" && room && !hasVoted && (
        <Card className="w-full max-w-sm border-border bg-card">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="text-center space-y-8">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm uppercase tracking-wider">
                  {currentPlayer?.name}
                </p>
                <h2 className="text-2xl font-bold text-foreground">{t.yourTurn}</h2>
                <p className="text-muted-foreground text-sm">{t.dontLetOthersSee}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => vote(true)}
                  disabled={loading}
                  className="h-32 flex flex-col gap-2 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  <Plus className="w-10 h-10" />
                  {t.plusOne}
                </Button>
                <Button
                  onClick={() => vote(false)}
                  disabled={loading}
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

      {/* Voted - Waiting */}
      {view === "voted" && room && (
        <Card className="w-full max-w-sm border-border bg-card">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Check className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{t.voteRecorded}</h2>
                <p className="text-muted-foreground">{t.waitingForOthers}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t.playersVoted
                    .replace("{voted}", String(votedCount))
                    .replace("{total}", String(room.players.length))}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {room.players.map((player) => (
                    <div
                      key={player.id}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        player.hasVoted
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {player.name}
                      {player.hasVoted && <Check className="w-3 h-3 inline ml-1" />}
                    </div>
                  ))}
                </div>
              </div>

              {isLeader && (
                <Button
                  onClick={() => controlGame("stop")}
                  variant="destructive"
                  className="w-full h-12"
                  disabled={loading}
                >
                  <Square className="w-4 h-4 mr-2" />
                  {t.stopGame}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {view === "results" && room && (
        <Card className="w-full max-w-sm border-border bg-card">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm uppercase tracking-wider">{t.finalCountIs}</p>
                <div className="relative">
                  <div className="text-8xl font-bold text-primary animate-in zoom-in-50 duration-500">{total}</div>
                  <p className="text-muted-foreground mt-2">
                    {t.outOf.replace("{total}", String(room.players.length))}
                  </p>
                </div>
              </div>

              {isLeader && (
                <div className="pt-4 space-y-3">
                  <Button onClick={() => setShowChoices(!showChoices)} variant="outline" className="w-full h-12">
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
                    <div className="space-y-2 pt-2">
                      {room.players.map((player) => (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                            room.votes[player.id] ? "bg-primary/20" : "bg-muted/50"
                          }`}
                        >
                          <span className="font-medium text-foreground">{player.name}</span>
                          <span
                            className={`font-bold ${
                              room.votes[player.id] ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {room.votes[player.id] ? "+1" : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!isLeader && (
                <p className="text-sm text-muted-foreground italic">{t.onlyLeaderSees}</p>
              )}

              <div className="flex gap-3 pt-4">
                {isLeader ? (
                  <>
                    <Button
                      onClick={() => controlGame("restart")}
                      className="flex-1 h-12 font-semibold"
                      disabled={loading}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t.playAgain}
                    </Button>
                    <Button
                      onClick={() => controlGame("reset")}
                      variant="outline"
                      className="flex-1 h-12"
                      disabled={loading}
                    >
                      {t.backToLobby}
                    </Button>
                  </>
                ) : (
                  <Button onClick={resetAll} variant="outline" className="w-full h-12">
                    {t.back}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="fixed bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
        Made with 💛 by La Famiglia
      </p>
    </main>
  )
}
