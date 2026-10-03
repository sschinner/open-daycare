import { verifySession } from "@/utils/supabase/dal";
import { AppShell } from "@/app/components/AppShell";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const profile = await verifySession();

  return <AppShell profile={profile}>{children}</AppShell>;
}
