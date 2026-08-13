"use client";
import { createContext, useContext } from "react";
import type { Workspace } from "@/app/types/domain";
const WorkspaceContext = createContext<Workspace | null>(null);
export function WorkspaceProvider({ workspace, children }: { workspace: Workspace; children: React.ReactNode }) { return <WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>; }
export function useWorkspace() { const value = useContext(WorkspaceContext); if (!value) throw new Error("WorkspaceProvider is missing"); return value; }
