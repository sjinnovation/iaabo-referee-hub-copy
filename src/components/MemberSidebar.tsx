import { AppSidebar } from "@/components/AppSidebar";
import { memberMenuItems } from "@/config/sidebarMenus";

export function MemberSidebar() {
  return <AppSidebar label="Member Portal" menuItems={memberMenuItems} showUserInfo />;
}
