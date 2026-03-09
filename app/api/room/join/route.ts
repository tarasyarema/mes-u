import { NextResponse } from "next/server"
import { getRoom, updateRoom, generatePlayerId } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { roomCode, playerName } = await request.json()

    if (!roomCode || typeof roomCode !== "string") {
      return NextResponse.json({ error: "Room code is required" }, { status: 400 })
    }

    if (!playerName || typeof playerName !== "string") {
      return NextResponse.json({ error: "Player name is required" }, { status: 400 })
    }

    const room = await getRoom(roomCode.toUpperCase())

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.phase !== "waiting") {
      return NextResponse.json({ error: "Game already in progress" }, { status: 400 })
    }

    const playerId = generatePlayerId()
    room.players.push({
      id: playerId,
      name: playerName.trim(),
      hasVoted: false,
    })

    await updateRoom(room)

    return NextResponse.json({
      room,
      playerId,
    })
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 })
  }
}
