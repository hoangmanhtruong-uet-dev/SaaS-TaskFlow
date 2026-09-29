# Production Mock Audit

Last updated: 2026-09-29
Scope: authenticated production routes under `/app`, public/demo routes, services, and settings modules.
Decision: NO-GO until mandatory production mocks are removed, replaced with real backend flows, or explicitly removed from authenticated production scope.

## Classification

- A. REAL PRODUCTION DEPENDENCY
- B. TEST FIXTURE
- C. DEMO/MARKETING
- D. DEVELOPMENT TOOL
- E. STATIC CONFIGURATION
- F. DEAD CODE
- G. PRODUCTION MOCK - MUST FIX
- H. UNKNOWN

## Core Production Findings

| File / symbol | Usage and call path | Classification | Production risk | Action |
|---|---|---|---|---|
| `app/services/project-service.ts` | API adapter used by `LiveProjects` and board flows | A | Low; real workspace-scoped API path | Keep; verify against staging later |
| `app/services/task-service.ts` | API adapter used by dashboard and board flows | A | Low; real task persistence path exists | Keep; verify against staging later |
| `app/services/workspace-service.ts` | Workspace API adapter | A | Low; trusted server authorization remains required | Keep |
| `db/authorization.ts` | Server-side membership/project authorization | A | Security-critical | Keep; database validation pending |
| `db/collaboration.ts` | Real member/invitation persistence and authorization | A | Security-critical; concurrency still unproven | Keep; add staging concurrency test |
| `app/lib/supabase/*` and `app/api/v1/auth/*` | Supabase Auth and server session routes | A | Real provider path; no fake authenticated user found | Keep; staging E2E pending |
| `app/api/v1/workspaces/[workspaceId]/billing/*` and `db/billing.ts` | Stripe entitlement and billing API path | A | Code-level source is Stripe/database; staging/live provider proof pending | Keep; verify later |
| `app/app/page.tsx` -> `LiveDashboard` | Loads real projects/tasks, then seeds reference tasks when database returns empty | G | Empty workspace displays fabricated tasks and users; can create false production state | IMPLEMENT REAL BACKEND FLOW or render an explicit empty state |
| `app/components/live-product-views.tsx` `defaultReferenceTasks` | Fallback used by authenticated dashboard | G | Hardcoded tasks, assignees, counts and dates are visible in `/app` | Remove fallback; use empty/loading/error state |
| `app/components/live-product-views.tsx` `assignees` and derived counts | Replaces missing real relations with hardcoded member names/counts | G | Incorrect ownership and task metadata | Map real relations or display unavailable state |
| `app/components/members/useTeamManagement.ts` | Mounted by `/app/members` through `TeamManagementContainer` | G | Entire member list, invites, role changes, remove, resend and transfer are local React state | IMPLEMENT REAL BACKEND FLOW; do not expose as production CRUD |
| `app/components/members/mockData.ts` | Source for authenticated member page and permission tab | G | Fabricated members and invitations appear as real tenant data | Remove after real member/invitation API integration |
| `app/components/members/PermissionMatrixTab.tsx` | Reads `MOCK_PERMISSION_MATRIX` in `/app/members` | G | Permission display is not server-derived | Use server permission matrix or remove tab from scope |
| `app/components/projects/useProjectManagement.ts` | Mounted by `/app/projects` | G | Starts from `MOCK_PROJECTS` and mutates local state | IMPLEMENT REAL PROJECT BACKEND FLOW |
| `app/components/projects/mockData.ts` | Source for authenticated projects manager | G | Fabricated project list and metrics | Remove from authenticated path |
| `app/components/my-tasks/useMyTasks.ts` | Mounted by `/app/tasks` | G | Starts from `MOCK_MY_TASKS`; updates are local state | IMPLEMENT REAL TASK QUERY/mutations |
| `app/components/my-tasks/mockData.ts` | Source for authenticated My Tasks view | G | Fabricated task assignments and deadlines | Remove from authenticated path |
| `app/components/calendar/useCalendarEngine.ts` | Mounted by `/app/calendar` | G | Initializes tasks, unscheduled tasks and Google events from mock data | IMPLEMENT real task/calendar source or remove calendar route from scope |
| `app/components/calendar/mockData.ts` | Source for calendar task/event state | G | Users can see fabricated deadlines and calendar events | Remove from authenticated calendar path |
| `app/components/notifications/useNotifications.ts` | Mounted by `/app/notifications` | G | Initializes feed from `MOCK_NOTIFICATIONS`; actions are local state | IMPLEMENT real notification API integration |
| `app/components/notifications/mockData.ts` | Source for authenticated notification feed | G | Fake unread/activity data presented as tenant state | Remove from authenticated path |
| `app/components/activity/useActivityLog.ts` and `activity/mockData.ts` | Mounted by `/app/activity` through `ActivityDashboardContainer` | G | Activity timeline starts from fabricated events and has no verified tenant API source | Implement real activity API flow or remove route from scope |
| `app/components/archived/useArchivedManager.ts` and `archived/mockData.ts` | Mounted by `/app/archived` through `ArchivedDashboardContainer` | G | Archived items and restore/delete actions are local mock state | Implement real archive/recovery API flow or remove route from scope |
| `app/components/search/SearchPageContainer.tsx` `MOCK_SEARCH_DATA` | `/app/search` merges real task API results with mock members/projects/tasks | G | Search returns records not belonging to the tenant | Remove mock merge; return only authorized API data |
| `app/components/search/SearchPageContainer.tsx` `.catch(() => [])` | Converts task API failure into empty real set, then mock data still renders | G | Backend failure becomes fabricated success | Surface API error; never fallback to mock results |
| `app/app/projects/[projectId]/files/page.tsx` `mockFiles` | Authenticated project files route | G | Displays fake files without storage/API source | IMPLEMENT attachment API or remove route from production scope |
| `app/app/projects/[projectId]/list/page.tsx` `mockTasks` | Authenticated project list route | G | Displays and mutates fabricated tasks | Use task API or remove route from scope |
| `app/components/tasks/TaskDetailDrawer.tsx` `mockTask` | Used for `ref-*` task IDs from dashboard fallback | G | Fabricated task detail can be opened from authenticated UI | Remove `ref-*` path from production route |
| `app/components/tasks/QuickCreateTaskModal.tsx` `handleLoadDemoData` | Explicit demo action mounted in authenticated task UI | G | Can seed demo records from a production-facing flow | Keep only in demo/marketing route or remove |
| `app/components/taskflow-ui.tsx` and `app/ui/[id]` | Screen atlas renderer imports legacy mock data | C | Demo content, not tenant data, if route remains isolated | Keep only as explicitly non-production demo/atlas route |
| `app/services/mock-data.ts` | Legacy source for `taskflow-ui.tsx`; also supplies `legacyProjects`/`legacyTasks` | C / G by consumer | Safe only for atlas; unsafe if imported by authenticated app | Restrict imports to `/ui` demo route |
| `app/components/settings/billing/useBillingManager.ts` | Mounted by authenticated `/app/settings/billing` | G | Hardcoded PRO plan, seats, renewal date, payment method and invoices; local fake updates | IMPLEMENT real billing UI using `db/billing.ts`/Stripe or remove route |
| `app/components/settings/billing/mockData.ts` | Billing manager and pricing modal data | G | Fake paid state and invoice records | Remove from authenticated billing path |
| `app/components/settings/permissions/usePermissionSettings.ts` | Mounted by authenticated permissions settings | G | Roles, matrix, overrides and save action are local; save only waits then toasts success | Implement server persistence/authorization or remove page |
| `app/components/settings/permissions/mockData.ts` | Source for system roles, project overrides and projects | G / E | Static permission labels are acceptable; mutable records are not | Keep static definitions only; implement real mutable backend |
| `app/components/settings/security/useSecurityManager.ts` | Mounted by authenticated security settings | G | MFA, sessions, connected accounts and logs use mock state; password change waits locally | Connect to Supabase Auth/API or remove unsupported controls |
| `app/components/settings/security/mockData.ts` | Source for fake MFA/sessions/security logs | G | Can falsely claim security controls are enabled or active | Remove from production security page |
| `app/components/settings/workspace/useWorkspaceSettings.ts` | Mounted by authenticated workspace settings | G | Save, transfer, export, DNS verification and delete are local/timeouts | Connect to workspace lifecycle APIs or remove controls |
| `app/components/settings/workspace/mockData.ts` | Source for fake members/export history/preset workspace state | G / E | Fake owner/export records are production-visible; preset logos may be static | Remove mutable mock records; retain only static logo catalog if needed |
| `app/components/settings/profile/useProfileSettings.ts` | Mounted by authenticated profile settings | G / E | Initial profile state comes from mock data; timezone catalog is static | Load profile from `/api/v1/profile`; keep timezone list as static config |
| `app/components/settings/profile/EmailChangeModal.tsx` | Real email OTP API has explicit fallback OTP generation/display | G | Network/provider failure can expose/generated OTP in UI | Fail closed; require real Resend/provider response |
| `app/components/settings/integrations/useIntegrationManager.ts` | Mounted by authenticated integrations settings | G | Integration state/actions are local mock state | Implement backend or remove authenticated integrations page |
| `app/components/settings/integrations/mockData.ts` | Source for integration configs/events | G / E | Event catalog is static; integration records are fabricated | Keep event catalog only; backend integration required |
| `app/components/settings/notifications/useNotificationPreferences.ts` | Mounted by authenticated notification settings | G | Preferences are initialized and saved locally | Implement server preference API or remove page |
| `app/components/settings/notifications/mockData.ts` | Source for matrix/default preference state | G / E | Static labels are safe; mutable preference state is not | Keep labels only; persist preferences server-side |
| `app/components/settings/workspace/BrandingIdentityCard.tsx` `mockPresetLogos` | Authenticated branding settings | E | Static preset catalog only | Keep if selection is persisted through real workspace API |
| `app/components/settings/profile/AvatarManagerCard.tsx` `PRESET_AVATARS` | Authenticated profile UI | E | Static avatar catalog, not backend state | Keep; persist selected value via real profile API |
| `app/components/calendar/useCalendarEngine.ts` localStorage view mode | Stores view preference only | E | Not a backend substitute | Keep |
| `app/components/my-tasks/useMyTasks.ts` localStorage view mode | Stores view preference only | E | Not tenant data | Keep |
| `app/components/projects/useProjectManagement.ts` localStorage view mode | Stores view preference only | E | Not tenant data | Keep |
| `app/api/v1/cloudinary/*` local-dev fallback comments | Auth path comments indicate local fallback behavior | H | Must verify implementation does not authenticate unauthenticated production requests | Review before staging; fail closed in production |
| `app/app/settings/profile/page.tsx` unauthenticated mock fallback | Fallback profile content | G | Authenticated route can show fabricated profile if auth boundary fails | Remove fallback; require authenticated profile/API response |
| `app/components/settings/workspace/useWorkspaceSettings.ts` DNS/export/delete timeouts | Fake success after timeout | G | Destructive/settings actions claim success without persistence | Implement API or disable controls |

## Core Flow Verdicts

| Flow | Status | Evidence | Required action |
|---|---|---|---|
| Auth | PASS at code-contract level; staging UNKNOWN | Supabase Auth routes and server session checks exist; E2E credentials unavailable | Validate with staging accounts later |
| Workspace | PASS for API/service layer; UI settings UNKNOWN/FAIL | Workspace APIs are real, but workspace settings manager is local mock state | Remove or connect settings controls |
| Members | FAIL | `/app/members` mounts `useTeamManagement`, which starts from mock members/invites and mutates locally | Implement real backend flow |
| Projects | FAIL for project management screen | `/app/projects` mounts `useProjectManagement`, initialized from mock projects | Implement real backend flow |
| Tasks | Mixed / FAIL for dashboard and My Tasks | Board service is real, but dashboard empty fallback, My Tasks, list and detail ref paths use fabricated records | Remove fallback and connect all authenticated views |
| Billing | FAIL for settings UI; PASS for entitlement service contract | `useBillingManager` hardcodes PRO/seats/invoices; `db/billing.ts` is real | Replace UI manager or remove page |
| Notifications | FAIL | Authenticated notification container starts from mock notifications | Implement server-backed state |
| Permissions | FAIL | Permission settings save is a timeout/local state operation | Implement backend or remove page |
| Settings/integrations | FAIL | Security, workspace, billing, integrations and notification settings contain local fake persistence | Remove from authenticated scope or implement real flows |
| Search | FAIL | Real tasks are merged with fabricated records and API errors become mock-capable empty results | Real tenant-scoped results only |

## Required Remediation Decisions

- Core tenant flows (members, projects, tasks, search, notifications): IMPLEMENT REAL BACKEND FLOW.
- Billing/security/workspace/permissions/integrations settings: REMOVE FROM AUTHENTICATED PRODUCTION SCOPE until real persistence exists, or implement real backend before release.
- Demo/atlas routes under `/ui`: KEEP ONLY AS TEST/DEMO CODE and ensure they cannot be reached as tenant state.
- Static catalogs (timezone, preset avatars/logos, webhook event names): KEEP as STATIC CONFIGURATION only.
- API/database errors: surface loading/error/empty state; never fall back to fabricated tenant data.

## Audit Limitations

- This audit classifies source and call paths statically. It does not claim staging/database behavior.
- Worktree contamination means ownership of many modified/untracked files cannot be proven from git history alone.
- No production mock code was silently replaced in Phase 3 because doing so without a complete backend contract would risk data integrity and tenant isolation.
