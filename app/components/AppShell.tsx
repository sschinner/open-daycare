"use client";

import type { ReactNode } from "react";
import type { Profile } from "@/utils/supabase/dal";
import { ProfileProvider } from "./ProfileProvider";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  profile: Profile;
  children: ReactNode;
};

export function AppShell({ profile, children }: AppShellProps) {
  return (
    <ProfileProvider profile={profile}>
      <div className="flex flex-1 min-h-screen bg-[#F6ECDF]">
        <Sidebar profile={profile} />
        <main className="flex-1 min-w-0 h-screen overflow-y-auto">{children}</main>
      </div>
    </ProfileProvider>
  );
}
