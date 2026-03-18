import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  DollarSign,
  FileText,
  Megaphone,
  Bot,
  Settings,
  Link2,
  UserPlus,
  Mail,
  GitBranch,
  Book,
  BookOpen,
  FolderOpen,
  User,
  Award,
  Bell,
  HelpCircle,
  MapPin,
  UserCog,
} from "lucide-react";
import type { SidebarMenuItem } from "@/components/AppSidebar";

export const adminMenuItems: SidebarMenuItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  
  { title: "Users & Members", isLabel: true },
  { title: "Registrations", url: "/admin/registrations", icon: UserPlus },
  { title: "User Management", url: "/admin/users", icon: UserCog },
  { title: "Members", url: "/admin/members", icon: Users },

  { title: "Regions & Boards", isLabel: true },
  { title: "Regions", url: "/admin/regions", icon: MapPin },
  { title: "Boards & Secretaries", url: "/admin/boards", icon: Building2 },
  
  { title: "Training & Courses", isLabel: true },
  { title: "Training", url: "/admin/training", icon: GraduationCap },
  { title: "Course Management", url: "/admin/courses", icon: Book },
  { title: "Embedded Courses", url: "/admin/embedded-courses", icon: FolderOpen },
  { title: "Generic Certificate Template", url: "/admin/certificate-template", icon: Award },
  { title: "LearnDash Integration", url: "/admin/learndash", icon: Link2, hidden: true },
  
  { title: "Organization", isLabel: true, hidden: true },
  { title: "Finance & Dues", url: "/admin/finance", icon: DollarSign, hidden: true },
  { title: "Resources", url: "/admin/resources", icon: FileText, hidden: true },
  { title: "Communications", url: "/admin/communications", icon: Megaphone, hidden: true },
  { title: "Integrations", url: "/admin/integrations", icon: Link2, hidden: true },
  { title: "Integration Docs", url: "/admin/integration-docs", icon: Book, hidden: true },
  { title: "Email Templates", url: "/admin/email-templates", icon: Mail, hidden: true },
  { title: "Workflows", url: "/admin/workflows", icon: GitBranch, hidden: true },
  { title: "AI Assistant", url: "/admin/ai", icon: Bot, hidden: true },
  { title: "Settings", url: "/admin/settings", icon: Settings, hidden: true },
];

export const memberMenuItems: SidebarMenuItem[] = [
  { title: "Dashboard", url: "/member", icon: LayoutDashboard },
  { title: "Profile", url: "/member/profile", icon: User },
  { title: "Course Catalog", url: "/member/courses", icon: Book },
  { title: "Embedded Courses", url: "/member/embedded-courses", icon: BookOpen },
  { title: "My Courses", url: "/member/my-courses", icon: BookOpen },
  { title: "Training", url: "/member/training", icon: GraduationCap, hidden: true },
  { title: "Benefits", url: "/member/benefits", icon: Award, hidden: true },
  { title: "Resources", url: "/member/resources", icon: FileText, hidden: true },
  { title: "Notifications", url: "/member/notifications", icon: Bell, hidden: true },
  { title: "Support", url: "/member/support", icon: HelpCircle, hidden: true },
];

export const secretaryMenuItems: SidebarMenuItem[] = [
  { title: "Dashboard", url: "/secretary", icon: LayoutDashboard },
  { title: "Members", url: "/secretary/members", icon: Users },
  { title: "Dues", url: "/secretary/dues", icon: DollarSign },
  { title: "Training", url: "/secretary/training", icon: GraduationCap },
  { title: "Announcements", url: "/secretary/announcements", icon: Megaphone },
  { title: "AI Assistant", url: "/secretary/ai", icon: Bot, hidden: true },
];
