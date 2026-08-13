import { NextResponse } from "next/server";
export function requestId() { return `req_${crypto.randomUUID()}`; }
export function ok<T>(data: T, status = 200) { return NextResponse.json({ data, meta: { requestId: requestId() } }, { status }); }
export function fail(code: string, message: string, status: number, details?: Record<string, unknown>) { return NextResponse.json({ error: { code, message, ...(details ? { details } : {}) }, meta: { requestId: requestId() } }, { status }); }
