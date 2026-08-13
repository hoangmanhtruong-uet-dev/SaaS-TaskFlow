import { eq } from "drizzle-orm";
import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { parseJson, requiredString } from "@/app/lib/validation";
import { getDb } from "@/db";
import { memberships, workspaces } from "@/db/schema";
import { listUserWorkspaces } from "@/db/users";

export async function GET() { const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401); const rows = await listUserWorkspaces(auth.user.id); return ok(rows.map((row: Awaited<ReturnType<typeof listUserWorkspaces>>[number]) => ({ ...row, archivedAt: row.archivedAt?.toISOString() ?? null }))); }
export async function POST(request: Request) { try { const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401); const body = await parseJson(request); const name = requiredString(body, "name", 100); const slug = requiredString(body, "slug", 80).toLowerCase(); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return fail("SLUG_INVALID", "Slug chỉ gồm chữ thường, số và dấu gạch ngang", 400); if (await getDb().select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.slug, slug)).get()) return fail("SLUG_TAKEN", "Slug đã được sử dụng", 409, { suggestion: `${slug}-${Math.floor(Math.random() * 900 + 100)}` }); const id = crypto.randomUUID(); const db = getDb(); await db.batch([db.insert(workspaces).values({ id, name, slug }), db.insert(memberships).values({ id: crypto.randomUUID(), workspaceId: id, userId: auth.user.id, role: "OWNER" })]); return ok({ id, name, slug, plan: "FREE", role: "OWNER", archivedAt: null }, 201); } catch (error) { return routeError(error); } }
