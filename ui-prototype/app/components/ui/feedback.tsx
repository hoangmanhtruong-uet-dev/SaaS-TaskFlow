import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "./button";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="feedback-state"><Inbox /><h2>{title}</h2><p>{body}</p></div>;
}
export function ErrorState({ retry }: { retry?: () => void }) {
  return <div className="feedback-state error"><AlertCircle /><h2>Không tải được dữ liệu</h2><p>Vui lòng thử lại. Dữ liệu của bạn chưa bị thay đổi.</p>{retry && <Button onClick={retry}>Thử lại</Button>}</div>;
}
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return <div className="skeleton-list" aria-label="Đang tải">{Array.from({ length: rows }, (_, index) => <span key={index} />)}</div>;
}
