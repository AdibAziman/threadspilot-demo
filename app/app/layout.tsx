import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace-shell";

/**
 * The dashboard is the default screen, so its title lives here; every other
 * workspace route names itself in its own layout.
 */
export const metadata: Metadata = { title: "Dashboard · ThreadsPilot" };

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
