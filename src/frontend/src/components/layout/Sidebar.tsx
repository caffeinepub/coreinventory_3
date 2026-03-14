import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftRight,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  PackageCheck,
  SlidersHorizontal,
  Truck,
  Warehouse,
} from "lucide-react";
import { useNav } from "../../store/navContext";
import type { AuthUser } from "../../types/inventory";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  {
    label: "Products",
    path: "/products",
    icon: Package,
    ocid: "nav.products_link",
  },
  {
    label: "Receipts",
    path: "/receipts",
    icon: PackageCheck,
    ocid: "nav.receipts_link",
  },
  {
    label: "Deliveries",
    path: "/deliveries",
    icon: Truck,
    ocid: "nav.deliveries_link",
  },
  {
    label: "Transfers",
    path: "/transfers",
    icon: ArrowLeftRight,
    ocid: "nav.transfers_link",
  },
  {
    label: "Adjustments",
    path: "/adjustments",
    icon: SlidersHorizontal,
    ocid: "nav.adjustments_link",
  },
  {
    label: "Warehouses",
    path: "/warehouses",
    icon: Warehouse,
    ocid: "nav.warehouses_link",
  },
  {
    label: "Stock History",
    path: "/stock-history",
    icon: History,
    ocid: "nav.history_link",
  },
];

interface SidebarProps {
  user: AuthUser;
  onLogout: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({ user, onLogout, onNavigate }: SidebarProps) {
  const { path, navigate } = useNav();

  const handleNav = (to: string) => {
    navigate(to);
    onNavigate?.();
  };

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "oklch(0.11 0.065 290)" }}
    >
      {/* Brand header */}
      <div
        className="sidebar-brand-gradient px-5 pt-6 pb-5 flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(0.20 0.07 290)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/stockflow-logo-transparent.dim_400x100.png"
            alt="StockFlow"
            className="h-28 w-auto object-contain"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 pb-2 overflow-y-auto scrollbar-thin">
        <p
          className="text-[10px] font-semibold tracking-widest uppercase px-3 mb-3"
          style={{ color: "oklch(0.40 0.05 290)" }}
        >
          Main Menu
        </p>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              path === item.path ||
              (path === "/" && item.path === "/dashboard");
            return (
              <button
                type="button"
                key={item.path}
                onClick={() => handleNav(item.path)}
                data-ocid={item.ocid}
                className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden group"
                style={{
                  background: isActive ? "oklch(0.22 0.10 290)" : "transparent",
                  color: isActive
                    ? "oklch(0.97 0.005 290)"
                    : "oklch(0.60 0.04 290)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.17 0.07 290)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.85 0.01 290)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.60 0.04 290)";
                  }
                }}
              >
                {/* Active accent bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                    style={{
                      background:
                        "linear-gradient(180deg, oklch(0.78 0.20 195), oklch(0.60 0.22 290))",
                    }}
                  />
                )}
                <Icon
                  className="w-4 h-4 flex-shrink-0 transition-colors duration-200"
                  style={{
                    color: isActive
                      ? "oklch(0.78 0.20 195)"
                      : "oklch(0.45 0.05 290)",
                  }}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "oklch(0.78 0.20 195)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User card */}
      <div
        className="px-3 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid oklch(0.18 0.06 290)" }}
      >
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5"
          style={{ background: "oklch(0.17 0.07 290)" }}
        >
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback
              className="text-xs font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.26 290), oklch(0.45 0.22 300))",
                color: "white",
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "oklch(0.93 0.01 290)" }}
            >
              {user.name}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "oklch(0.45 0.04 290)" }}
            >
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          data-ocid="nav.logout_button"
          className="w-full justify-start gap-2 h-9 text-xs font-medium transition-colors duration-200"
          style={{ color: "oklch(0.45 0.04 290)" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
