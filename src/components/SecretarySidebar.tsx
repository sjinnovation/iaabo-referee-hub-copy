import { AppSidebar } from "@/components/AppSidebar";
import { secretaryMenuItems } from "@/config/sidebarMenus";

export function SecretarySidebar() {
  return <AppSidebar label="Secretary Panel" menuItems={secretaryMenuItems} />;
}
