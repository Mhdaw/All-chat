
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {AppSidebar} from "@/components/app-sidebar"

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isCollapsed = true;

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
