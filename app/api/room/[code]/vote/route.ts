import { NextResponse } from "next/server"
import { getRoom, updateRoom } from "@/lib/redis"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const { playerId, vote } = await request.json()

    const room = await getRoom(code.toUpperCase())

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.phase !== "playing") {
      return NextResponse.json({ error: "Game is not in progress" }, { status: 400 })
    }

    const player = room.players.find((p) => p.id === playerId)
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    if (player.hasVoted) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 })
    }

    // Record vote
    room.votes[playerId] = vote === true
    player.hasVoted = true

    // Update player in array
    room.players = room.players.map((p) =>
      p.id === playerId ? { ...p, hasVoted: true } : p
    )

    // Check if all players have voted
    const allVoted = room.players.every((p) => p.hasVoted)
    if (allVoted) {
      room.phase = "finished"
    }

    await updateRoom(room)

    return NextResponse.json({ room })
  } catch (error) {
    console.error("Error voting:", error)
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 })
  }
}
