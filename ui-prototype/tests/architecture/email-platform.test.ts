import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { invitationEmail, membershipSuspendedEmail, passwordResetEmail, verificationEmail, workspaceDeletionScheduledEmail } from "../../app/lib/email-templates";

test("transactional email templates escape user-controlled content", () => {
  const invitation = invitationEmail({ inviterName: '<script>alert("x")</script>', workspaceName: "A & B", role: "MEMBER", inviteUrl: "https://example.com/invite/token?x=1&y=2", expiresAt: new Date("2026-08-21T12:00:00Z") });
  assert.doesNotMatch(invitation.html, /<script>/);
  assert.match(invitation.html, /A &amp; B/);
  assert.match(invitation.html, /x=1&amp;y=2/);
});

test("MVP email catalog covers auth, invitation, suspension, and deletion", () => {
  const templates = [
    verificationEmail({ name: "An", verificationUrl: "https://example.com/verify" }),
    passwordResetEmail({ name: "An", resetUrl: "https://example.com/reset" }),
    invitationEmail({ inviterName: "An", workspaceName: "TaskFlow", role: "ADMIN", inviteUrl: "https://example.com/invite", expiresAt: new Date("2026-08-21T12:00:00Z") }),
    membershipSuspendedEmail({ name: "An", workspaceName: "TaskFlow" }),
    workspaceDeletionScheduledEmail({ workspaceName: "TaskFlow", scheduledFor: new Date("2026-09-13T12:00:00Z"), settingsUrl: "https://example.com/settings" }),
  ];
  for (const template of templates) {
    assert.ok(template.subject.length > 5);
    assert.match(template.html, /TaskFlow/);
    assert.match(template.html, /<!doctype html>/);
  }
});

test("business email hooks use deterministic Resend idempotency keys", async () => {
  const routes = await Promise.all([
    readFile(new URL("../../app/api/v1/workspaces/[workspaceId]/invitations/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/api/v1/workspaces/[workspaceId]/members/[membershipId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/api/v1/workspaces/[workspaceId]/deletion-request/route.ts", import.meta.url), "utf8"),
  ]);
  for (const route of routes) {
    assert.match(route, /sendTransactionalEmail/);
    assert.match(route, /idempotencyKey/);
  }
});
