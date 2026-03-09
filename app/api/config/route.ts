import { NextResponse } from "next/server"
import { isRedisConfigured } from "@/lib/redis"

export async function GET() {
  return NextResponse.json({ 
    multiDeviceEnabled: isRedisConfigured() 
  })
}
