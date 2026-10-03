"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Profile } from "@/utils/supabase/dal";
import { ProfileProvider } from "./ProfileProvider";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  profile: Profile;
  children: ReactNode;
};

type ComposerContextValue = {
  isComposerOpen: boolean;
  openComposer: () => void;
  closeComposer: () => void;
};

const ComposerContext = createContext<ComposerContextValue | null>(null);

export function useComposer() {
  const composer = useContext(ComposerContext);

  if (!composer) {
    throw new Error("useComposer must be used inside an AppShell");
  }

  return composer;
}

export function AppShell({ profile, children }: AppShellProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <ProfileProvider profile={profile}>
      <ComposerContext.Provider
        value={{
          isComposerOpen,
          openComposer: () => setIsComposerOpen(true),
          closeComposer: () => setIsComposerOpen(false),
        }}
      >
        <div className="flex flex-1 min-h-screen bg-[#F6ECDF]">
          <Sidebar profile={profile} onNewPost={() => setIsComposerOpen(true)} />
          <main className="flex-1 min-w-0 h-screen overflow-y-auto">{children}</main>
        </div>
      </ComposerContext.Provider>
    </ProfileProvider>
  );
}
