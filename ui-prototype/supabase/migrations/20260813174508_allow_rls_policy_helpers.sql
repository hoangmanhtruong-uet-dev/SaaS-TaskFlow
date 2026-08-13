-- Policies execute as the calling database role. The role needs EXECUTE on the
-- stored helper OID, while the private schema remains unavailable through the
-- Data API so clients cannot invoke these functions as RPC endpoints.
grant execute on function private.is_active_workspace_member(uuid) to authenticated;
grant execute on function private.has_workspace_role(uuid, public.workspace_role[]) to authenticated;
grant execute on function private.can_read_project(uuid, uuid) to authenticated;

revoke usage on schema private from public, anon, authenticated;
