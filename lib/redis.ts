import { Redis } from "@upstash/redis"

function getRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

export const redis = getRedis()

export type RoomState = {
  id: string
  leaderId: string
  phase: "waiting" | "playing" | "finished"
  players: { id: string; name: string; hasVoted: boolean }[]
  votes: Record<string, boolean> // playerId -> voted +1 or pass
  createdAt: number
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 10)
}

const ROOM_TTL = 60 * 60 * 2 // 2 hours

export function isRedisConfigured(): boolean {
  return redis !== null
}

export async function createRoom(leaderId: string, leaderName: string): Promise<RoomState> {
  if (!redis) throw new Error("Redis not configured")
  const roomCode = generateRoomCode()
  const room: RoomState = {
    id: roomCode,
    leaderId,
    phase: "waiting",
    players: [{ id: leaderId, name: leaderName, hasVoted: false }],
    votes: {},
    createdAt: Date.now(),
  }
  await redis.set(`room:${roomCode}`, room, { ex: ROOM_TTL })
  return room
}

export async function getRoom(roomCode: string): Promise<RoomState | null> {
  if (!redis) throw new Error("Redis not configured")
  return await redis.get<RoomState>(`room:${roomCode}`)
}

export async function updateRoom(room: RoomState): Promise<void> {
  if (!redis) throw new Error("Redis not configured")
  await redis.set(`room:${room.id}`, room, { ex: ROOM_TTL })
}

export async function deleteRoom(roomCode: string): Promise<void> {
  if (!redis) throw new Error("Redis not configured")
  await redis.del(`room:${roomCode}`)
}
