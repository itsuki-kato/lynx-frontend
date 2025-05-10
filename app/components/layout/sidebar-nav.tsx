import { useLocation, Link } from "react-router";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  LayoutDashboard,
  Search,
  FileText,
  Users,
  Settings,
  LogOut,
  Link2 // アイコン候補 (または GitMerge, FileText など)
} from "lucide-react";
import { Form } from "react-router";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function NavItem({ href, icon, children }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);
  
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center px-4 py-2 rounded-lg transition-all duration-200",
        "text-foreground", // text-gray-600 dark:text-gray-300 を text-foreground に変更
        isActive 
          ? "bg-emerald-600 text-white dark:bg-emerald-700 dark:text-white border-l-4 border-emerald-400" 
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <span className={cn("mr-3", isActive ? "text-white" : "text-muted-foreground")}> {/* text-gray-500 dark:text-gray-400 を text-muted-foreground に変更 */}
        {icon}
      </span>
      {children}
    </Link>
  );
}

export function SidebarNav() {
  return (
    <aside className="text-sm bg-white dark:bg-gray-900 w-64 min-h-screen border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col fixed left-0 top-16 shadow-lg">
      <ScrollArea className="flex-grow py-4 px-2">
        <div className="flex-grow space-y-2">
          <NavItem href="/" icon={<LayoutDashboard size={18} />}>
            Dashboard
          </NavItem>
          <NavItem href="/scrapying" icon={<Search size={18} />}>
            サイト分析
          </NavItem>
          <NavItem href="/content-management" icon={<FileText size={18} />}>
            コンテンツ管理
          </NavItem>
          {/* 新しい画面へのリンクを追加 */}
          <NavItem href="/keyword-article-mapping" icon={<Link2 size={18} />}>
            記事・キーワード関連付け
          </NavItem>
          <NavItem href="/reports/internal-links-map" icon={<FileText size={18} />}>
            Reports
          </NavItem>
          
          <Separator className="my-4" />
          
          <NavItem href="/users" icon={<Users size={18} />}>
            Users
          </NavItem>
          <NavItem href="/settings" icon={<Settings size={18} />}>
            Settings
          </NavItem>
          
          <Form method="post" action="/logout" className="mt-4">
            <button
              type="submit"
              className="w-full flex items-center px-4 py-2 rounded-lg text-foreground hover:text-zinc-50 hover:bg-red-700 text-left" // text-gray-600 dark:text-gray-300 を text-foreground に変更
            >
              <LogOut size={18} className="mr-3 text-muted-foreground" /> {/* text-gray-500 dark:text-gray-400 を text-muted-foreground に変更 */}
              Logout
            </button>
          </Form>
        </div>
      </ScrollArea>
    </aside>
  );
}
