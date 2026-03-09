import { NextResponse } from "next/server"

export async function GET() {
  const hasRedis = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  
  return NextResponse.json({ 
    multiDeviceEnabled: hasRedis 
  })
}
