import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import type { AuthUser } from "../../types/inventory";
import Sidebar from "./Sidebar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/receipts": "Receipts",
  "/deliveries": "Delivery Orders",
  "/transfers": "Internal Transfers",
  "/adjustments": "Inventory Adjustments",
  "/stock-history": "Stock Movement History",
  "/warehouses": "Warehouses",
};

const PAGE_SUBTITLES: Record<string, string> = {
  "/dashboard": "Overview of your inventory metrics",
  "/products": "Manage your product catalogue",
  "/receipts": "Incoming stock from suppliers",
  "/deliveries": "Outgoing delivery orders",
  "/transfers": "Move stock between warehouses",
  "/adjustments": "Reconcile physical vs system stock",
  "/stock-history": "Full ledger of all stock movements",
  "/warehouses": "Manage your storage locations",
};

interface DashboardLayoutProps {
  user: AuthUser;
  onLogout: () => void;
  path: string;
  children: React.ReactNode;
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function DashboardLayout({
  user,
  onLogout,
  path,
  children,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = PAGE_TITLES[path] ?? "Dashboard";
  const pageSubtitle = PAGE_SUBTITLES[path] ?? "";
  const now = useClock();

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 xl:w-64 flex-shrink-0">
        <Sidebar user={user} onLogout={onLogout} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-64 bg-sidebar border-sidebar-border"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar
            user={user}
            onLogout={onLogout}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header — violet-tinted to bridge sidebar and content */}
        <header
          className="flex items-center justify-between h-16 px-4 lg:px-6 flex-shrink-0"
          style={{
            background: "oklch(0.97 0.009 290)",
            borderBottom: "1px solid oklch(0.87 0.015 290)",
            boxShadow:
              "0 1px 3px oklch(0.16 0.04 290 / 0.06), 0 2px 8px oklch(0.16 0.04 290 / 0.04)",
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden -ml-1"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-base font-bold text-foreground font-display leading-tight">
                {pageTitle}
              </h1>
              {pageSubtitle && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>
          {/* Date / time */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="font-medium">{dateStr}</span>
            <span className="opacity-40">·</span>
            <span>{timeStr}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
