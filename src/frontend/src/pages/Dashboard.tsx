import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  ArrowLeftRight,
  ChevronRight,
  History,
  LayoutDashboard,
  Package,
  PackageCheck,
  SlidersHorizontal,
  Truck,
  Warehouse,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useInventory } from "../store/inventoryStore";
import { useNav } from "../store/navContext";

const KPI_CONFIG = [
  {
    key: "totalProducts" as const,
    label: "Total Products",
    sublabel: "In catalogue",
    icon: Package,
    borderClass: "kpi-border-violet",
    iconBg: "oklch(0.52 0.28 290 / 0.12)",
    iconColor: "oklch(0.65 0.24 290)",
    valueColor: "oklch(0.35 0.20 290)",
    cardBg: "oklch(0.985 0.010 290)",
    cardBgHover: "oklch(0.975 0.015 290)",
    cardBorder: "oklch(0.85 0.022 290)",
    navTo: "/products",
  },
  {
    key: "lowStock" as const,
    label: "Low Stock",
    sublabel: "Below minimum",
    icon: AlertTriangle,
    borderClass: "kpi-border-amber",
    iconBg: "oklch(0.72 0.16 68 / 0.12)",
    iconColor: "oklch(0.58 0.18 68)",
    valueColor: "oklch(0.42 0.14 68)",
    cardBg: "oklch(0.988 0.008 68)",
    cardBgHover: "oklch(0.978 0.014 68)",
    cardBorder: "oklch(0.86 0.020 68)",
    navTo: "/products",
  },
  {
    key: "outOfStock" as const,
    label: "Out of Stock",
    sublabel: "Zero inventory",
    icon: XCircle,
    borderClass: "kpi-border-red",
    iconBg: "oklch(0.55 0.22 25 / 0.10)",
    iconColor: "oklch(0.55 0.22 25)",
    valueColor: "oklch(0.45 0.20 25)",
    cardBg: "oklch(0.988 0.008 25)",
    cardBgHover: "oklch(0.978 0.014 25)",
    cardBorder: "oklch(0.86 0.020 25)",
    navTo: "/products",
  },
  {
    key: "pendingReceipts" as const,
    label: "Pending Receipts",
    sublabel: "Awaiting validation",
    icon: PackageCheck,
    borderClass: "kpi-border-cyan",
    iconBg: "oklch(0.72 0.18 195 / 0.12)",
    iconColor: "oklch(0.60 0.18 195)",
    valueColor: "oklch(0.38 0.16 195)",
    cardBg: "oklch(0.988 0.008 195)",
    cardBgHover: "oklch(0.978 0.014 195)",
    cardBorder: "oklch(0.86 0.020 195)",
    navTo: "/receipts",
  },
  {
    key: "pendingDeliveries" as const,
    label: "Pending Deliveries",
    sublabel: "Awaiting validation",
    icon: Truck,
    borderClass: "kpi-border-sky",
    iconBg: "oklch(0.62 0.16 222 / 0.10)",
    iconColor: "oklch(0.55 0.18 222)",
    valueColor: "oklch(0.38 0.16 222)",
    cardBg: "oklch(0.988 0.007 222)",
    cardBgHover: "oklch(0.978 0.013 222)",
    cardBorder: "oklch(0.86 0.018 222)",
    navTo: "/deliveries",
  },
  {
    key: "pendingTransfers" as const,
    label: "Pending Transfers",
    sublabel: "In progress",
    icon: ArrowLeftRight,
    borderClass: "kpi-border-emerald",
    iconBg: "oklch(0.62 0.18 155 / 0.10)",
    iconColor: "oklch(0.58 0.18 155)",
    valueColor: "oklch(0.38 0.16 155)",
    cardBg: "oklch(0.988 0.008 155)",
    cardBgHover: "oklch(0.978 0.014 155)",
    cardBorder: "oklch(0.86 0.020 155)",
    navTo: "/transfers",
  },
];

const QUICK_ACCESS_MODULES = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    iconBg: "oklch(0.52 0.28 290 / 0.13)",
    iconColor: "oklch(0.55 0.26 290)",
    cardBg: "oklch(0.985 0.010 290)",
    hoverBorder: "oklch(0.65 0.24 290 / 0.5)",
    ocid: "dashboard.quickaccess.dashboard.button",
  },
  {
    label: "Products",
    icon: Package,
    path: "/products",
    iconBg: "oklch(0.65 0.24 290 / 0.12)",
    iconColor: "oklch(0.52 0.28 290)",
    cardBg: "oklch(0.985 0.010 290)",
    hoverBorder: "oklch(0.52 0.28 290 / 0.5)",
    ocid: "dashboard.quickaccess.products.button",
  },
  {
    label: "Receipts",
    icon: PackageCheck,
    path: "/receipts",
    iconBg: "oklch(0.72 0.18 195 / 0.12)",
    iconColor: "oklch(0.48 0.20 195)",
    cardBg: "oklch(0.988 0.008 195)",
    hoverBorder: "oklch(0.60 0.18 195 / 0.5)",
    ocid: "dashboard.quickaccess.receipts.button",
  },
  {
    label: "Deliveries",
    icon: Truck,
    path: "/deliveries",
    iconBg: "oklch(0.62 0.16 222 / 0.10)",
    iconColor: "oklch(0.45 0.20 222)",
    cardBg: "oklch(0.988 0.007 222)",
    hoverBorder: "oklch(0.55 0.18 222 / 0.5)",
    ocid: "dashboard.quickaccess.deliveries.button",
  },
  {
    label: "Transfers",
    icon: ArrowLeftRight,
    path: "/transfers",
    iconBg: "oklch(0.62 0.18 155 / 0.10)",
    iconColor: "oklch(0.45 0.20 155)",
    cardBg: "oklch(0.988 0.008 155)",
    hoverBorder: "oklch(0.58 0.18 155 / 0.5)",
    ocid: "dashboard.quickaccess.transfers.button",
  },
  {
    label: "Adjustments",
    icon: SlidersHorizontal,
    path: "/adjustments",
    iconBg: "oklch(0.72 0.16 68 / 0.12)",
    iconColor: "oklch(0.48 0.18 68)",
    cardBg: "oklch(0.988 0.008 68)",
    hoverBorder: "oklch(0.58 0.18 68 / 0.5)",
    ocid: "dashboard.quickaccess.adjustments.button",
  },
  {
    label: "Warehouses",
    icon: Warehouse,
    path: "/warehouses",
    iconBg: "oklch(0.55 0.22 25 / 0.10)",
    iconColor: "oklch(0.48 0.22 25)",
    cardBg: "oklch(0.988 0.008 25)",
    hoverBorder: "oklch(0.55 0.22 25 / 0.5)",
    ocid: "dashboard.quickaccess.warehouses.button",
  },
  {
    label: "Stock History",
    icon: History,
    path: "/stock-history",
    iconBg: "oklch(0.60 0.14 260 / 0.12)",
    iconColor: "oklch(0.45 0.16 260)",
    cardBg: "oklch(0.986 0.008 260)",
    hoverBorder: "oklch(0.55 0.16 260 / 0.5)",
    ocid: "dashboard.quickaccess.stock-history.button",
  },
];

export default function Dashboard() {
  const { products, receipts, deliveries, transfers, warehouses } =
    useInventory();
  const { navigate } = useNav();
  const [filterWarehouse, setFilterWarehouse] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [hoveredKpi, setHoveredKpi] = useState<string | null>(null);
  const [hoveredOp, setHoveredOp] = useState<string | null>(null);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filterWarehouse !== "all" && p.warehouseId !== filterWarehouse)
        return false;
      if (filterCategory !== "all" && p.category !== filterCategory)
        return false;
      return true;
    });
  }, [products, filterWarehouse, filterCategory]);

  const kpis = useMemo(() => {
    const totalProducts = filteredProducts.length;
    const lowStock = filteredProducts.filter(
      (p) => p.currentStock > 0 && p.currentStock <= p.minStockThreshold,
    ).length;
    const outOfStock = filteredProducts.filter(
      (p) => p.currentStock === 0,
    ).length;
    const inStock = totalProducts - lowStock - outOfStock;
    return {
      totalProducts,
      lowStock,
      outOfStock,
      inStock,
      pendingReceipts: receipts.filter((r) => r.status === "draft").length,
      pendingDeliveries: deliveries.filter((d) => d.status === "draft").length,
      pendingTransfers: transfers.filter((t) => t.status === "draft").length,
    };
  }, [filteredProducts, receipts, deliveries, transfers]);

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (p) => p.currentStock > 0 && p.currentStock <= p.minStockThreshold,
      ),
    [products],
  );

  const total = kpis.totalProducts || 1;
  const stockDistribution = [
    {
      label: "In Stock",
      count: kpis.inStock,
      pct: Math.round((kpis.inStock / total) * 100),
      color: "oklch(0.62 0.18 155)",
      bg: "oklch(0.62 0.18 155 / 0.12)",
      textColor: "oklch(0.32 0.16 155)",
    },
    {
      label: "Low Stock",
      count: kpis.lowStock,
      pct: Math.round((kpis.lowStock / total) * 100),
      color: "oklch(0.72 0.16 68)",
      bg: "oklch(0.72 0.16 68 / 0.12)",
      textColor: "oklch(0.36 0.14 68)",
    },
    {
      label: "Out of Stock",
      count: kpis.outOfStock,
      pct: Math.round((kpis.outOfStock / total) * 100),
      color: "oklch(0.55 0.22 25)",
      bg: "oklch(0.55 0.22 25 / 0.10)",
      textColor: "oklch(0.38 0.20 25)",
    },
  ];

  const opRows = [
    {
      label: "Pending Receipts",
      value: kpis.pendingReceipts,
      icon: PackageCheck,
      color: "oklch(0.60 0.18 195)",
      bg: "oklch(0.72 0.18 195 / 0.10)",
      hoverBg: "oklch(0.72 0.18 195 / 0.18)",
      navTo: "/receipts",
      ocid: "dashboard.summary.receipts.button",
    },
    {
      label: "Pending Deliveries",
      value: kpis.pendingDeliveries,
      icon: Truck,
      color: "oklch(0.55 0.18 222)",
      bg: "oklch(0.62 0.16 222 / 0.10)",
      hoverBg: "oklch(0.62 0.16 222 / 0.18)",
      navTo: "/deliveries",
      ocid: "dashboard.summary.deliveries.button",
    },
    {
      label: "Pending Transfers",
      value: kpis.pendingTransfers,
      icon: ArrowLeftRight,
      color: "oklch(0.58 0.18 155)",
      bg: "oklch(0.62 0.18 155 / 0.10)",
      hoverBg: "oklch(0.62 0.18 155 / 0.18)",
      navTo: "/transfers",
      ocid: "dashboard.summary.transfers.button",
    },
  ];

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      {/* Low stock alert banner */}
      {lowStockProducts.length > 0 && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3.5 border"
          style={{
            background: "oklch(0.97 0.015 68 / 0.7)",
            borderColor: "oklch(0.72 0.16 68 / 0.35)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "oklch(0.72 0.16 68 / 0.15)" }}
          >
            <AlertTriangle
              className="w-4 h-4"
              style={{ color: "oklch(0.52 0.18 68)" }}
            />
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "oklch(0.32 0.14 68)" }}
            >
              {lowStockProducts.length} product
              {lowStockProducts.length === 1 ? "" : "s"} below minimum threshold
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.42 0.12 68)" }}
            >
              {lowStockProducts
                .slice(0, 3)
                .map((p) => p.name)
                .join(", ")}
              {lowStockProducts.length > 3
                ? ` and ${lowStockProducts.length - 3} more`
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_CONFIG.map((cfg) => {
          const Icon = cfg.icon;
          const value = kpis[cfg.key];
          const isHovered = hoveredKpi === cfg.key;
          return (
            <button
              key={cfg.key}
              type="button"
              className={`border rounded-xl card-shadow overflow-hidden ${cfg.borderClass} cursor-pointer select-none text-left w-full`}
              style={{
                transition:
                  "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
                transform: isHovered
                  ? "translateY(-2px) scale(1.01)"
                  : "translateY(0) scale(1)",
                boxShadow: isHovered
                  ? "0 8px 24px oklch(0.52 0.28 290 / 0.15)"
                  : undefined,
                background: isHovered ? cfg.cardBgHover : cfg.cardBg,
                borderColor: cfg.cardBorder,
              }}
              onClick={() => navigate(cfg.navTo)}
              onMouseEnter={() => setHoveredKpi(cfg.key)}
              onMouseLeave={() => setHoveredKpi(null)}
              data-ocid={`dashboard.kpi.${cfg.key}.button`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider leading-tight mb-1"
                      style={{ color: "oklch(0.42 0.04 290)" }}
                    >
                      {cfg.sublabel}
                    </p>
                    <p
                      className="text-3xl font-bold font-display leading-none"
                      style={{ color: cfg.valueColor }}
                    >
                      {value}
                    </p>
                    <p
                      className="text-xs font-medium mt-1.5"
                      style={{ color: "oklch(0.40 0.04 290)" }}
                    >
                      {cfg.label}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cfg.iconBg }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: cfg.iconColor }}
                      />
                    </div>
                    <ChevronRight
                      className="w-3.5 h-3.5 mt-1"
                      style={{
                        color: cfg.iconColor,
                        opacity: isHovered ? 1 : 0,
                        transition: "opacity 0.15s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Filter by:
        </span>
        <Select value={filterWarehouse} onValueChange={setFilterWarehouse}>
          <SelectTrigger
            className="w-44"
            data-ocid="dashboard.warehouse_select"
          >
            <SelectValue placeholder="All Warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44" data-ocid="dashboard.category_select">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stock Overview + Operations Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          className="lg:col-span-2 card-shadow"
          style={{
            background: "oklch(0.985 0.006 290)",
            borderColor: "oklch(0.87 0.016 290)",
          }}
          data-ocid="dashboard.stock_overview.card"
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold font-display">
              Stock Status Overview
            </CardTitle>
            <p className="text-xs text-muted-foreground -mt-1">
              Distribution across all filtered products
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {stockDistribution.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm font-bold"
                      style={{ color: item.textColor }}
                    >
                      {item.count}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: item.bg, color: item.textColor }}
                    >
                      {item.pct}%
                    </span>
                  </div>
                </div>
                <div
                  className="h-2.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.90 0.010 290)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card
          className="card-shadow"
          style={{
            background: "oklch(0.985 0.006 290)",
            borderColor: "oklch(0.87 0.016 290)",
          }}
          data-ocid="dashboard.summary.card"
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold font-display">
              Operations Summary
            </CardTitle>
            <p className="text-xs text-muted-foreground -mt-1">
              Pending actions requiring attention
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {opRows.map((op) => {
              const OpIcon = op.icon;
              const isHov = hoveredOp === op.label;
              return (
                <button
                  key={op.label}
                  type="button"
                  className="flex items-center gap-3 p-3 rounded-xl w-full text-left select-none"
                  style={{
                    background: isHov ? op.hoverBg : op.bg,
                    transition: "background 0.15s ease, transform 0.12s ease",
                    transform: isHov ? "translateX(3px)" : "translateX(0)",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(op.navTo)}
                  onMouseEnter={() => setHoveredOp(op.label)}
                  onMouseLeave={() => setHoveredOp(null)}
                  data-ocid={op.ocid}
                >
                  <OpIcon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: op.color }}
                  />
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {op.label}
                  </span>
                  <span
                    className="text-lg font-bold font-display"
                    style={{ color: op.color }}
                  >
                    {op.value}
                  </span>
                  <ChevronRight
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{
                      color: op.color,
                      opacity: isHov ? 1 : 0,
                      transition: "opacity 0.15s ease",
                    }}
                  />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Module Grid */}
      <div data-ocid="dashboard.quickaccess.section">
        <div className="mb-4">
          <h2 className="text-sm font-semibold font-display text-foreground">
            Quick Access
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Jump to any module instantly
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACCESS_MODULES.map((mod) => {
            const ModIcon = mod.icon;
            const isHov = hoveredModule === mod.label;
            return (
              <button
                key={mod.path}
                type="button"
                className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border w-full"
                style={{
                  background: isHov ? mod.iconBg : mod.cardBg,
                  borderColor: isHov
                    ? mod.hoverBorder
                    : "oklch(0.87 0.016 290)",
                  transition:
                    "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
                  transform: isHov
                    ? "translateY(-3px) scale(1.02)"
                    : "translateY(0) scale(1)",
                  boxShadow: isHov
                    ? `0 8px 20px ${mod.iconBg}`
                    : "0 1px 3px oklch(0.5 0.1 290 / 0.08)",
                  cursor: "pointer",
                }}
                onClick={() => navigate(mod.path)}
                onMouseEnter={() => setHoveredModule(mod.label)}
                onMouseLeave={() => setHoveredModule(null)}
                data-ocid={mod.ocid}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: mod.iconBg }}
                >
                  <ModIcon
                    className="w-5 h-5"
                    style={{ color: mod.iconColor }}
                  />
                </div>
                <span
                  className="text-xs font-semibold leading-tight"
                  style={{
                    color: isHov ? mod.iconColor : "oklch(0.32 0.06 290)",
                    transition: "color 0.15s ease",
                  }}
                >
                  {mod.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
