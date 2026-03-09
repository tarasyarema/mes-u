import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

function getRedis() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export type RoomData = {
  code: string
  leaderId: string
  status: "waiting" | "playing" | "reveal"
  players: { id: string; name: string; hasVoted: boolean }[]
  choices: { playerId: string; choice: boolean }[]
  createdAt: number
}

// Create a new room
export async function POST(request: Request) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 503 })
  }

  const { leaderId, leaderName } = await request.json()

  let code = generateRoomCode()
  let attempts = 0
  while (attempts < 10) {
    const existing = await redis.get(`room:${code}`)
    if (!existing) break
    code = generateRoomCode()
    attempts++
  }

  const room: RoomData = {
    code,
    leaderId,
    status: "waiting",
    players: [{ id: leaderId, name: leaderName, hasVoted: false }],
    choices: [],
    createdAt: Date.now(),
  }

  await redis.set(`room:${code}`, JSON.stringify(room), { ex: 3600 }) // 1 hour expiry

  return NextResponse.json({ room })
}

// Get room data
export async function GET(request: Request) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "Room code required" }, { status: 400 })
  }

  const roomData = await redis.get(`room:${code}`)
  if (!roomData) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  const room: RoomData = typeof roomData === "string" ? JSON.parse(roomData) : roomData

  return NextResponse.json({ room })
}
