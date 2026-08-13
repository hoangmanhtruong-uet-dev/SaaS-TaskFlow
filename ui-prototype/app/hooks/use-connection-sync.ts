"use client";
import { useEffect, useState } from "react";
export function useConnectionSync(refetch: () => void, intervalMs = 20000) {
  const [state, setState] = useState<"connected" | "disconnected" | "reconnecting">("connected");
  useEffect(() => {
    const offline = () => setState("disconnected");
    const online = () => { setState("reconnecting"); Promise.resolve().then(refetch).finally(() => setState("connected")); };
    const timer = window.setInterval(() => { if (navigator.onLine && document.visibilityState === "visible") refetch(); }, intervalMs);
    window.addEventListener("offline", offline); window.addEventListener("online", online);
    if (!navigator.onLine) setTimeout(offline, 0);
    return () => { clearInterval(timer); window.removeEventListener("offline", offline); window.removeEventListener("online", online); };
  }, [refetch, intervalMs]);
  return state;
}
