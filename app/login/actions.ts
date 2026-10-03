"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type LoginState = {
  error: string | null;
};

const INITIAL_ERROR = "Completá el email y la contraseña.";
const INVALID_CREDENTIALS = "Email o contraseña incorrectos.";

// Only same-origin relative paths, so `next` can never become an open redirect.
function safeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  const [pathname] = value.split("?");

  return pathname === "/login" ? "/" : value;
}

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: INITIAL_ERROR };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: INVALID_CREDENTIALS };
  }

  revalidatePath("/", "layout");
  redirect(next);
}
