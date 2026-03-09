import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"
import type { RoomData } from "../route"

function getRedis() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

export async function POST(request: Request) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 503 })
  }

  const { code, action, playerId, choice } = await request.json()

  const roomData = await redis.get(`room:${code}`)
  if (!roomData) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  const room: RoomData = typeof roomData === "string" ? JSON.parse(roomData) : roomData

  switch (action) {
    case "start":
      if (room.leaderId !== playerId) {
        return NextResponse.json({ error: "Only leader can start" }, { status: 403 })
      }
      room.status = "playing"
      room.choices = []
      room.players = room.players.map((p) => ({ ...p, hasVoted: false }))
      break

    case "vote":
      if (room.status !== "playing") {
        return NextResponse.json({ error: "Game not in progress" }, { status: 400 })
      }
      const player = room.players.find((p) => p.id === playerId)
      if (!player) {
        return NextResponse.json({ error: "Player not in room" }, { status: 400 })
      }
      if (player.hasVoted) {
        return NextResponse.json({ error: "Already voted" }, { status: 400 })
      }
      room.choices.push({ playerId, choice })
      player.hasVoted = true

      // Check if all players have voted
      if (room.choices.length === room.players.length) {
        room.status = "reveal"
      }
      break

    case "reset":
      if (room.leaderId !== playerId) {
        return NextResponse.json({ error: "Only leader can reset" }, { status: 403 })
      }
      room.status = "waiting"
      room.choices = []
      room.players = room.players.map((p) => ({ ...p, hasVoted: false }))
      break

    case "stop":
      if (room.leaderId !== playerId) {
        return NextResponse.json({ error: "Only leader can stop" }, { status: 403 })
      }
      room.status = "reveal"
      break

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }

  await redis.set(`room:${code}`, JSON.stringify(room), { ex: 3600 })

  return NextResponse.json({ room })
}
