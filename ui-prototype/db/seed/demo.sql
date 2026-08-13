INSERT OR IGNORE INTO users (id, provider_user_id, email, email_normalized, name, email_verified_at)
VALUES
  ('usr_demo_owner', 'demo-owner', 'owner@taskflow.demo', 'owner@taskflow.demo', 'Demo Owner', unixepoch() * 1000),
  ('usr_demo_admin', 'demo-admin', 'admin@taskflow.demo', 'admin@taskflow.demo', 'Demo Admin', unixepoch() * 1000),
  ('usr_demo_member', 'demo-member', 'member@taskflow.demo', 'member@taskflow.demo', 'Demo Member', unixepoch() * 1000),
  ('usr_demo_guest', 'demo-guest', 'guest@taskflow.demo', 'guest@taskflow.demo', 'Demo Guest', unixepoch() * 1000),
  ('usr_other_owner', 'other-owner', 'owner@other.demo', 'owner@other.demo', 'Other Owner', unixepoch() * 1000);

INSERT OR IGNORE INTO workspaces (id, name, slug, plan)
VALUES ('ws_demo', 'TaskFlow Demo', 'taskflow-demo', 'PRO'), ('ws_other', 'Other Tenant', 'other-tenant', 'FREE');

INSERT OR IGNORE INTO memberships (id, workspace_id, user_id, role, status)
VALUES
  ('mem_demo_owner', 'ws_demo', 'usr_demo_owner', 'OWNER', 'ACTIVE'),
  ('mem_demo_admin', 'ws_demo', 'usr_demo_admin', 'ADMIN', 'ACTIVE'),
  ('mem_demo_member', 'ws_demo', 'usr_demo_member', 'MEMBER', 'ACTIVE'),
  ('mem_demo_guest', 'ws_demo', 'usr_demo_guest', 'GUEST', 'ACTIVE'),
  ('mem_other_owner', 'ws_other', 'usr_other_owner', 'OWNER', 'ACTIVE');

INSERT OR IGNORE INTO projects (id, workspace_id, name, description, visibility, lead_membership_id)
VALUES
  ('prj_demo_public', 'ws_demo', 'Website MVP', 'Workspace project', 'WORKSPACE', 'mem_demo_member'),
  ('prj_demo_private', 'ws_demo', 'Private Launch', 'Private project', 'PRIVATE', 'mem_demo_admin'),
  ('prj_other', 'ws_other', 'Other Project', 'Tenant isolation fixture', 'PRIVATE', 'mem_other_owner');

INSERT OR IGNORE INTO project_members (project_id, membership_id, access_level)
VALUES ('prj_demo_private', 'mem_demo_member', 'EDIT'), ('prj_demo_private', 'mem_demo_guest', 'COMMENT');

INSERT OR IGNORE INTO boards (id, workspace_id, project_id, name)
VALUES ('brd_demo', 'ws_demo', 'prj_demo_public', 'Công việc'), ('brd_other', 'ws_other', 'prj_other', 'Công việc');

INSERT OR IGNORE INTO columns (id, workspace_id, board_id, name, position)
VALUES ('col_demo', 'ws_demo', 'brd_demo', 'Backlog', 1000), ('col_other', 'ws_other', 'brd_other', 'Backlog', 1000);

INSERT OR IGNORE INTO tasks (id, workspace_id, project_id, board_id, column_id, creator_membership_id, title, position)
VALUES
  ('tsk_demo', 'ws_demo', 'prj_demo_public', 'brd_demo', 'col_demo', 'mem_demo_member', 'Ship tenant-safe MVP', 1000),
  ('tsk_other', 'ws_other', 'prj_other', 'brd_other', 'col_other', 'mem_other_owner', 'Other tenant secret', 1000);
