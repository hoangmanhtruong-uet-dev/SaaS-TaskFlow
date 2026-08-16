"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  CreditCard,
  RefreshCw,
  Search,
} from "lucide-react";
import { useWorkspace } from "./providers/workspace-provider";
import { collaborationService } from "@/app/services/collaboration-service";
import { projectService } from "@/app/services/project-service";
import { taskService } from "@/app/services/task-service";
import { workspaceService } from "@/app/services/workspace-service";
import type { Member, Project, TaskSummary } from "@/app/types/domain";
import { Button, EmptyState, ErrorState, Field, ListSkeleton } from "./ui";
import { ProjectGrid, TaskList } from "./product-views";
import { useApiResource } from "@/app/hooks/use-api-resource";

export function SearchView() {
  const workspace = useWorkspace();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TaskSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function runSearch() {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setResults(await workspaceService.search(workspace.id, query));
    } catch (value) {
      setError(value instanceof Error ? value.message : "Không thể tìm kiếm");
    } finally {
      setLoading(false);
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await runSearch();
  }
  return (
    <div className="search-page">
      <form className="search-form" onSubmit={submit}>
        <label>
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tiêu đề công việc..."
            aria-label="Từ khóa tìm kiếm"
          />
        </label>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </Button>
      </form>
      {error ? (
        <ErrorState retry={() => void runSearch()} />
      ) : results === null ? (
        <EmptyState
          title="Nhập từ khóa tìm kiếm"
          body="Kết quả được giới hạn trong workspace và project bạn có quyền truy cập."
        />
      ) : results.length ? (
        <TaskList tasks={results} />
      ) : (
        <EmptyState
          title="Không có kết quả"
          body={`Không tìm thấy công việc phù hợp với “${query}”.`}
        />
      )}
    </div>
  );
}

export function ArchivedView() {
  const workspace = useWorkspace();
  const resource = useApiResource(async () => {
    const [projects, tasks] = await Promise.all([
      projectService.archived(workspace.id),
      taskService.archived(workspace.id),
    ]);
    return { projects, tasks };
  }, `archived:${workspace.id}`);
  const [error, setError] = useState("");
  if (resource.loading) return <ListSkeleton />;
  if (resource.error || !resource.data)
    return <ErrorState retry={resource.reload} />;
  async function restoreProject(project: Project) {
    try {
      await projectService.restore(workspace.id, project.id);
      resource.reload();
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Không thể khôi phục dự án",
      );
    }
  }
  async function restoreTask(task: TaskSummary) {
    try {
      await taskService.restore(workspace.id, task.id);
      resource.reload();
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Không thể khôi phục công việc",
      );
    }
  }
  const { projects, tasks } = resource.data;
  return (
    <div className="archived-stack">
      {error && <p className="form-error">{error}</p>}
      <section>
        <h2>Dự án đã lưu trữ</h2>
        {projects.length ? (
          <div className="restore-grid">
            {projects.map((project) => (
              <div key={project.id}>
                <ProjectGrid projects={[project]} />
                <Button
                  variant="secondary"
                  onClick={() => restoreProject(project)}
                >
                  <RefreshCw />
                  Khôi phục
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Không có dự án lưu trữ"
            body="Dự án đã archive sẽ xuất hiện tại đây."
          />
        )}
      </section>
      <section>
        <h2>Công việc đã lưu trữ</h2>
        {tasks.length ? (
          <div>
            {tasks.map((task) => (
              <div className="restore-row" key={task.id}>
                <TaskList tasks={[task]} />
                <Button variant="secondary" onClick={() => restoreTask(task)}>
                  <RefreshCw />
                  Khôi phục
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Không có công việc lưu trữ"
            body="Công việc đã archive sẽ xuất hiện tại đây."
          />
        )}
      </section>
    </div>
  );
}

function BillingSettings() {
  const workspace = useWorkspace();
  const resource = useApiResource(
    () => workspaceService.billing(workspace.id),
    `billing:${workspace.id}`,
  );
  const [seats, setSeats] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function redirectTo(action: () => Promise<{ url: string }>) {
    setBusy(true);
    setError("");
    try {
      window.location.assign((await action()).url);
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Không thể mở Stripe Billing",
      );
      setBusy(false);
    }
  }
  if (resource.loading)
    return (
      <section className="ui-card settings-section">
        <ListSkeleton rows={2} />
      </section>
    );
  if (resource.error || !resource.data)
    return (
      <section className="ui-card settings-section">
        <ErrorState retry={resource.reload} />
      </section>
    );
  const billing = resource.data;
  const minimumSeats = Math.max(
    1,
    billing.activeMembers + billing.pendingInvitations,
  );
  const selectedSeats = seats ?? minimumSeats;
  return (
    <section className="ui-card settings-section billing-settings">
      <header>
        <CreditCard />
        <div>
          <h2>Gói & thanh toán</h2>
          <p>
            Entitlement được đồng bộ từ Stripe webhook, không cấp quyền từ trang
            redirect.
          </p>
        </div>
        <strong className={`billing-plan ${billing.plan.toLowerCase()}`}>
          {billing.plan}
        </strong>
      </header>
      {error && <p className="form-error">{error}</p>}
      <div className="billing-metrics">
        <span>
          <small>Dự án</small>
          <strong>
            {billing.activeProjects}/{billing.projectLimit ?? "∞"}
          </strong>
        </span>
        <span>
          <small>Thành viên</small>
          <strong>
            {billing.activeMembers}/{billing.memberLimit}
          </strong>
        </span>
        <span>
          <small>Trạng thái</small>
          <strong>{billing.status ?? "free"}</strong>
        </span>
      </div>
      {billing.cancelAtPeriodEnd && billing.currentPeriodEnd && (
        <p className="billing-warning">
          Gói sẽ kết thúc vào{" "}
          {new Date(billing.currentPeriodEnd).toLocaleDateString("vi-VN")}.
        </p>
      )}
      {billing.lastInvoiceStatus === "payment_failed" && (
        <p className="form-error">
          Thanh toán gần nhất thất bại. Hãy cập nhật phương thức thanh toán
          trong Portal.
        </p>
      )}
      {billing.plan === "FREE" ? (
        <div className="billing-upgrade">
          <label className="field">
            <span>Số seat Pro</span>
            <input
              type="number"
              min={minimumSeats}
              max={999}
              value={selectedSeats}
              onChange={(event) => setSeats(Number(event.target.value))}
            />
          </label>
          <div>
            <strong>79.000đ / seat / tháng</strong>
            <small>Checkout chạy ở Stripe test mode trên staging.</small>
          </div>
          <Button
            disabled={busy}
            onClick={() =>
              redirectTo(() =>
                workspaceService.checkout(workspace.id, selectedSeats),
              )
            }
          >
            {busy ? "Đang mở..." : "Nâng cấp qua Stripe"}
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() =>
            redirectTo(() => workspaceService.billingPortal(workspace.id))
          }
        >
          {busy ? "Đang mở..." : "Quản lý trong Billing Portal"}
        </Button>
      )}
    </section>
  );
}

export function WorkspaceSettingsView() {
  const workspace = useWorkspace();
  const router = useRouter();
  const membersResource = useApiResource(
    () => collaborationService.members(workspace.id),
    `settings-members:${workspace.id}`,
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [targetOwner, setTargetOwner] = useState("");
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const members: Member[] = membersResource.data ?? [];
  const ownerTargets = members.filter(
    (member) =>
      member.role !== "OWNER" &&
      member.role !== "GUEST" &&
      member.status === "ACTIVE",
  );
  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage(success);
      router.refresh();
    } catch (value) {
      setMessage(
        value instanceof Error
          ? value.message
          : "Không thể thực hiện hành động",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await run(
      () =>
        workspaceService.update(workspace.id, {
          name: String(form.get("name")),
          slug: String(form.get("slug")),
        }),
      "Đã lưu cài đặt workspace.",
    );
  }
  return (
    <div className="settings-live">
      {message && <p className="settings-message">{message}</p>}
      <form
        className="production-form ui-card settings-section"
        onSubmit={save}
      >
        <h2>Thông tin chung</h2>
        <Field
          name="name"
          label="Tên workspace"
          defaultValue={workspace.name}
          required
        />
        <Field
          name="slug"
          label="Slug"
          defaultValue={workspace.slug}
          required
        />
        <Button type="submit" disabled={busy}>
          Lưu thay đổi
        </Button>
      </form>
      <section className="ui-card settings-section">
        <h2>Bảo mật tài khoản</h2>
        <p>Thiết lập TOTP MFA trước khi quản lý thành viên, ownership, billing hoặc xóa workspace.</p>
        <a className="ui-button secondary" href="/auth/mfa?next=/app/settings">Quản lý MFA</a>
      </section>
      {workspace.role === "OWNER" && <BillingSettings />}
      {workspace.role === "OWNER" && (
        <section className="ui-card settings-section">
          <h2>Chuyển ownership</h2>
          {membersResource.loading ? (
            <ListSkeleton rows={2} />
          ) : (
            <>
              <label className="field">
                <span>Owner mới</span>
                <select
                  value={targetOwner}
                  onChange={(event) => setTargetOwner(event.target.value)}
                >
                  <option value="">Chọn thành viên</option>
                  {ownerTargets.map((member) => (
                    <option value={member.id} key={member.id}>
                      {member.name} · {member.role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={transferConfirmed}
                  onChange={(event) =>
                    setTransferConfirmed(event.target.checked)
                  }
                />
                Tôi hiểu mình sẽ trở thành Admin sau khi chuyển quyền.
              </label>
              <Button
                disabled={busy || !targetOwner || !transferConfirmed}
                onClick={() =>
                  run(
                    () =>
                      workspaceService.transferOwnership(
                        workspace.id,
                        targetOwner,
                      ),
                    "Đã chuyển ownership.",
                  )
                }
              >
                Chuyển ownership
              </Button>
            </>
          )}
        </section>
      )}
      <section className="ui-card danger-settings">
        <AlertTriangle />
        <div>
          <h2>Vòng đời workspace</h2>
          <p>
            Archive chuyển workspace sang trạng thái lưu trữ. Yêu cầu xóa có
            thời gian chờ 30 ngày và có thể hủy.
          </p>
          {workspace.archivedAt ? (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() =>
                run(
                  () => workspaceService.archive(workspace.id, true),
                  "Đã khôi phục workspace.",
                )
              }
            >
              <RefreshCw />
              Khôi phục workspace
            </Button>
          ) : (
            <Button
              variant="danger"
              disabled={busy}
              onClick={() =>
                run(
                  () => workspaceService.archive(workspace.id),
                  "Đã lưu trữ workspace.",
                )
              }
            >
              <Archive />
              Lưu trữ workspace
            </Button>
          )}
          {workspace.role === "OWNER" && (
            <div className="deletion-request">
              <Field
                label={`Nhập “${workspace.name}” để yêu cầu xóa`}
                value={confirmDelete}
                onChange={(event) => setConfirmDelete(event.target.value)}
              />
              {workspace.deletionRequestedAt ? (
                <>
                  <p>
                    Đã yêu cầu xóa ngày{" "}
                    {new Date(workspace.deletionRequestedAt).toLocaleDateString(
                      "vi-VN",
                    )}
                    . Có thể hủy trong thời gian chờ.
                  </p>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => workspaceService.cancelDeletion(workspace.id),
                        "Đã hủy yêu cầu xóa.",
                      )
                    }
                  >
                    Hủy yêu cầu xóa
                  </Button>
                </>
              ) : (
                <Button
                  variant="danger"
                  disabled={busy || confirmDelete !== workspace.name}
                  onClick={() =>
                    run(
                      () =>
                        workspaceService.requestDeletion(
                          workspace.id,
                          confirmDelete,
                        ),
                      "Đã lên lịch xóa sau 30 ngày.",
                    )
                  }
                >
                  Yêu cầu xóa sau 30 ngày
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
