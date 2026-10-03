"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { Profile } from "@/utils/supabase/dal";

const ProfileContext = createContext<Profile | null>(null);

type ProfileProviderProps = {
  profile: Profile;
  children: ReactNode;
};

export function ProfileProvider({ profile, children }: ProfileProviderProps) {
  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const profile = useContext(ProfileContext);

  if (!profile) {
    throw new Error("useProfile must be used inside a ProfileProvider");
  }

  return profile;
}

export function getFirstName(profile: Profile) {
  return profile.full_name.trim().split(" ")[0];
}

export function getInitial(profile: Profile) {
  return profile.full_name.trim().charAt(0).toUpperCase();
}
