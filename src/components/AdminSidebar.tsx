import { AppSidebar } from "@/components/AppSidebar";
import { adminMenuItems } from "@/config/sidebarMenus";
 
export function AdminSidebar() {
  return <AppSidebar label="Admin Panel" menuItems={adminMenuItems} showUserInfo />;
}
