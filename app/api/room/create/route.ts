import { NextResponse } from "next/server"
import { createRoom, generatePlayerId } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { leaderName } = await request.json()
    
    if (!leaderName || typeof leaderName !== "string") {
      return NextResponse.json({ error: "Leader name is required" }, { status: 400 })
    }

    const leaderId = generatePlayerId()
    const room = await createRoom(leaderId, leaderName.trim())

    return NextResponse.json({
      room,
      playerId: leaderId,
    })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
