import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
  active: "feed" | "kids";
  onNewPost?: () => void;
  children: ReactNode;
};

export function AppLayout({ active, onNewPost, children }: AppLayoutProps) {
  return (
    <div className="flex flex-1 min-h-screen bg-[#F6ECDF]">
      <Sidebar active={active} onNewPost={onNewPost} />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">{children}</main>
    </div>
  );
}