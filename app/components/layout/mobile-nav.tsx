import { useState } from "react";
import { useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  LayoutDashboard,
  Search,
  FileText,
  Users,
  Settings,
  LogOut
} from "lucide-react";
import { Link, Form } from "react-router";
import { Separator } from "~/components/ui/separator";

interface MobileNavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  setOpen: (open: boolean) => void;
}

function MobileNavItem({ href, icon, children, setOpen }: MobileNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);
  
  return (
    <Link
      to={href}
      onClick={() => setOpen(false)}
      className={cn(
        "flex items-center px-4 py-3 rounded-lg transition-all duration-200",
        "text-foreground", // text-gray-600 dark:text-gray-300 を text-foreground に変更
        isActive 
          ? "bg-emerald-600 text-white dark:bg-emerald-700 dark:text-white border-l-4 border-emerald-400" 
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <span className={cn("mr-3", isActive ? "text-white" : "text-muted-foreground")}> {/* text-gray-500 dark:text-gray-400 を text-muted-foreground に変更 */}
        {icon}
      </span>
      <span className="font-medium">{children}</span>
    </Link>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">メニューを開く</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-xl font-semibold">LYNX</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-3">
            <MobileNavItem href="/" icon={<LayoutDashboard size={20} />} setOpen={setOpen}>
              Dashboard
            </MobileNavItem>
            <MobileNavItem href="/scrapying" icon={<Search size={20} />} setOpen={setOpen}>
              サイト分析
            </MobileNavItem>
            <MobileNavItem href="/content-management" icon={<FileText size={20} />} setOpen={setOpen}>
              コンテンツ管理
            </MobileNavItem>
            <MobileNavItem href="/reports/internal-links-map" icon={<FileText size={20} />} setOpen={setOpen}>
              Reports
            </MobileNavItem>
            
            <Separator className="my-4" />
            
            <MobileNavItem href="/users" icon={<Users size={20} />} setOpen={setOpen}>
              Users
            </MobileNavItem>
            <MobileNavItem href="/settings" icon={<Settings size={20} />} setOpen={setOpen}>
              Settings
            </MobileNavItem>
            
            <Form method="post" action="/logout" className="mt-4">
              <button
                type="submit"
                onClick={() => setOpen(false)}
                className="w-full flex items-center px-4 py-3 rounded-lg text-foreground hover:text-zinc-50 hover:bg-red-700 text-left" // text-gray-600 dark:text-gray-300 を text-foreground に変更
              >
                <LogOut size={20} className="mr-3 text-muted-foreground" /> {/* text-gray-500 dark:text-gray-400 を text-muted-foreground に変更 */}
                <span className="font-medium">Logout</span>
              </button>
            </Form>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
