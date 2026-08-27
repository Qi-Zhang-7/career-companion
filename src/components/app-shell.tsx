import { AppNav } from "@/components/app-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="page-shell"><AppNav/><main className="ml-[246px] max-[980px]:ml-0 max-[980px]:pb-16">{children}</main></div>;
}
