// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


export function middleware(_req: NextRequest) {
// SSR fará a checagem fina via requireRole().
return NextResponse.next()
}