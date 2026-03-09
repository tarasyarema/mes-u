import { NextResponse } from "next/server"
import { getRoom, updateRoom } from "@/lib/redis"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const { action, playerId } = await request.json()

    const room = await getRoom(code.toUpperCase())

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.leaderId !== playerId) {
      return NextResponse.json({ error: "Only the leader can control the game" }, { status: 403 })
    }

    switch (action) {
      case "start":
        if (room.players.length < 2) {
          return NextResponse.json({ error: "Need at least 2 players" }, { status: 400 })
        }
        room.phase = "playing"
        room.votes = {}
        room.players = room.players.map((p) => ({ ...p, hasVoted: false }))
        break

      case "stop":
        room.phase = "finished"
        break

      case "restart":
        room.phase = "playing"
        room.votes = {}
        room.players = room.players.map((p) => ({ ...p, hasVoted: false }))
        break

      case "reset":
        room.phase = "waiting"
        room.votes = {}
        room.players = room.players.map((p) => ({ ...p, hasVoted: false }))
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await updateRoom(room)

    return NextResponse.json({ room })
  } catch (error) {
    console.error("Error controlling room:", error)
    return NextResponse.json({ error: "Failed to control room" }, { status: 500 })
  }
}
