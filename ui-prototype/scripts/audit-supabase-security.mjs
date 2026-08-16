import assert from "node:assert/strict";
import postgres from "postgres";

const databaseUrl = process.env.SUPABASE_DB_URL;
if (!databaseUrl) throw new Error("SUPABASE_DB_URL is required for the database security audit.");

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: "require",
  connect_timeout: 15,
  idle_timeout: 2,
});

try {
  const tables = await sql`
    select c.relname as table_name, c.relrowsecurity as rls_enabled
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
    order by c.relname
  `;
  assert.ok(tables.length > 0, "No public application tables were found.");
  assert.deepEqual(tables.filter((table) => !table.rls_enabled).map((table) => table.table_name), [], "Every public table must enable RLS.");

  const anonymousGrants = await sql`
    select table_name, privilege_type
    from information_schema.table_privileges
    where table_schema = 'public' and grantee = 'anon'
    order by table_name, privilege_type
  `;
  assert.deepEqual([...anonymousGrants], [], "anon must not receive direct table privileges.");

  const authenticatedMutations = await sql`
    select table_name, privilege_type
    from information_schema.table_privileges
    where table_schema = 'public'
      and grantee = 'authenticated'
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'TRIGGER', 'REFERENCES')
    order by table_name, privilege_type
  `;
  assert.deepEqual([...authenticatedMutations], [], "authenticated must not receive table-level mutation privileges.");

  const serviceRoleMissing = await sql`
    select c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
      and not has_table_privilege('service_role', format('%I.%I', n.nspname, c.relname), 'SELECT,INSERT,UPDATE,DELETE')
    order by c.relname
  `;
  assert.deepEqual([...serviceRoleMissing], [], "service_role must retain server-side access to every application table.");

  const tablesWithoutPolicies = await sql`
    select c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    left join pg_policies p on p.schemaname = n.nspname and p.tablename = c.relname
    where n.nspname = 'public' and c.relkind in ('r', 'p')
    group by c.relname
    having count(p.policyname) = 0
    order by c.relname
  `;
  assert.deepEqual([...tablesWithoutPolicies], [], "Every public table must have an explicit access or server-only policy.");

  const unsafeDefiners = await sql`
    select p.oid::regprocedure::text as function_name
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private') and p.prosecdef
      and not exists (
        select 1 from unnest(coalesce(p.proconfig, array[]::text[])) setting
        where setting like 'search_path=%'
      )
    order by function_name
  `;
  assert.deepEqual([...unsafeDefiners], [], "SECURITY DEFINER functions must pin search_path.");

  const postgresDefaults = await sql`
    select d.defaclobjtype as object_type, d.defaclacl::text as acl
    from pg_default_acl d
    join pg_roles owner_role on owner_role.oid = d.defaclrole
    join pg_namespace n on n.oid = d.defaclnamespace
    where owner_role.rolname = 'postgres' and n.nspname = 'public'
    order by d.defaclobjtype
  `;
  const unsafeDefaults = postgresDefaults.filter(({ acl }) => /(?:anon|authenticated)=/.test(acl ?? ""));
  assert.deepEqual(unsafeDefaults.map(({ object_type, acl }) => ({ object_type, acl })), [], "Future postgres-owned objects must not default-grant anon or authenticated.");

  console.log(`Supabase security audit passed for ${tables.length} public tables: RLS, policies, grants, default ACLs, and SECURITY DEFINER search paths are hardened.`);
} finally {
  await sql.end({ timeout: 2 });
}
