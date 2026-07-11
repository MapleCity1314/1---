import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { AssistantDock } from "@/components/assistant-dock";
import { MobileTabBar } from "@/components/mobile-tabbar";
import { ChatProvider } from "./chat-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar email={user.email ?? ""} />
        <main className="relative flex-1 overflow-auto pb-14 lg:pb-0">
          {children}
        </main>
        <AssistantDock />
        <MobileTabBar />
      </div>
    </ChatProvider>
  );
}
