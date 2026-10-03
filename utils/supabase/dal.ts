import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";

export type UserRole = "staff" | "parent" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
};

export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, full_name, role")
    .eq("id", data.claims.sub)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return profile;
});

export const verifySession = cache(async (): Promise<Profile> => {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
});
