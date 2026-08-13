begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(8);

insert into auth.users (id, email, aud, role, created_at, updated_at) values
  ('00000000-0000-0000-0000-000000000001', 'owner@test.invalid', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'admin@test.invalid', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'member@test.invalid', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'guest@test.invalid', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'suspended@test.invalid', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000006', 'outsider@test.invalid', 'authenticated', 'authenticated', now(), now());

insert into public.profiles (id, email, name) values
  ('00000000-0000-0000-0000-000000000001', 'owner@test.invalid', 'Owner'),
  ('00000000-0000-0000-0000-000000000002', 'admin@test.invalid', 'Admin'),
  ('00000000-0000-0000-0000-000000000003', 'member@test.invalid', 'Member'),
  ('00000000-0000-0000-0000-000000000004', 'guest@test.invalid', 'Guest'),
  ('00000000-0000-0000-0000-000000000005', 'suspended@test.invalid', 'Suspended'),
  ('00000000-0000-0000-0000-000000000006', 'outsider@test.invalid', 'Outsider');

insert into public.workspaces (id, name, slug) values
  ('10000000-0000-0000-0000-000000000001', 'Tenant A', 'tenant-a'),
  ('10000000-0000-0000-0000-000000000002', 'Tenant B', 'tenant-b');

insert into public.memberships (id, workspace_id, user_id, role, status) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'OWNER', 'ACTIVE'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'ADMIN', 'ACTIVE'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'MEMBER', 'ACTIVE'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'GUEST', 'ACTIVE'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'MEMBER', 'SUSPENDED'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'OWNER', 'ACTIVE');

insert into public.projects (id, workspace_id, name, visibility) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Workspace project', 'WORKSPACE'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Private project', 'PRIVATE'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Other tenant project', 'WORKSPACE');

insert into public.project_members (workspace_id, project_id, membership_id, access_level)
values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'VIEW');

set local role authenticated;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
select results_eq('select count(*) from public.projects', array[2::bigint], 'Owner reads all projects in own tenant only');

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select results_eq('select count(*) from public.projects', array[2::bigint], 'Admin reads all projects in own tenant only');

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
select results_eq('select count(*) from public.projects', array[1::bigint], 'Member reads workspace-visible projects only');

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';
select results_eq('select count(*) from public.projects', array[1::bigint], 'Guest reads explicitly granted projects only');
select results_eq(
  $$select count(*) from public.projects where id = '30000000-0000-0000-0000-000000000002'$$,
  array[1::bigint],
  'Guest grant resolves to the intended private project'
);

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';
select results_eq('select count(*) from public.projects', array[0::bigint], 'Suspended membership has no access');

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000006';
select results_eq('select count(*) from public.projects', array[1::bigint], 'Second tenant owner reads own tenant');
select results_eq(
  $$select count(*) from public.projects where workspace_id = '10000000-0000-0000-0000-000000000001'$$,
  array[0::bigint],
  'Second tenant owner cannot read first tenant'
);

reset role;
select * from finish();
rollback;
