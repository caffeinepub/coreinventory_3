import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInventory } from "../store/inventoryStore";

const PAGE_SIZE = 10;

const MOVEMENT_COLORS: Record<string, string> = {
  receipt: "bg-emerald-100 text-emerald-700",
  delivery: "bg-blue-100 text-blue-700",
  transfer_in: "bg-violet-100 text-violet-700",
  transfer_out: "bg-orange-100 text-orange-700",
  adjustment: "bg-yellow-100 text-yellow-700",
};

const MOVEMENT_LABELS: Record<string, string> = {
  receipt: "Receipt",
  delivery: "Delivery",
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
  adjustment: "Adjustment",
};

type CategoryTab =
  | "all"
  | "receipt"
  | "delivery"
  | "transfer_in"
  | "transfer_out"
  | "adjustment";

const CATEGORY_TABS: {
  key: CategoryTab;
  label: string;
  color: string;
  activeColor: string;
}[] = [
  {
    key: "all",
    label: "All",
    color: "oklch(0.50 0.04 290)",
    activeColor: "oklch(0.62 0.28 290)",
  },
  {
    key: "receipt",
    label: "Receipts",
    color: "oklch(0.50 0.10 145)",
    activeColor: "oklch(0.55 0.18 145)",
  },
  {
    key: "delivery",
    label: "Delivery",
    color: "oklch(0.50 0.10 240)",
    activeColor: "oklch(0.55 0.18 240)",
  },
  {
    key: "transfer_in",
    label: "Transfer In",
    color: "oklch(0.50 0.10 290)",
    activeColor: "oklch(0.55 0.20 290)",
  },
  {
    key: "transfer_out",
    label: "Transfer Out",
    color: "oklch(0.50 0.10 50)",
    activeColor: "oklch(0.55 0.18 50)",
  },
  {
    key: "adjustment",
    label: "Adjustments",
    color: "oklch(0.50 0.10 75)",
    activeColor: "oklch(0.55 0.18 75)",
  },
];

export default function StockHistory() {
  const { movements, products, warehouses } = useInventory();
  const [search, setSearch] = useState("");
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("all");
  const [whFilter, setWh] = useState("all");
  const [page, setPage] = useState(1);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: movements.length };
    for (const m of movements) {
      counts[m.movementType] = (counts[m.movementType] ?? 0) + 1;
    }
    return counts;
  }, [movements]);

  const filtered = useMemo(() => {
    return [...movements]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .filter((m) => {
        if (categoryTab !== "all" && m.movementType !== categoryTab)
          return false;
        if (whFilter !== "all" && m.warehouseId !== whFilter) return false;
        if (search) {
          const prod = products.find((p) => p.id === m.productId);
          const q = search.toLowerCase();
          if (
            !prod?.name.toLowerCase().includes(q) &&
            !prod?.sku.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      });
  }, [movements, categoryTab, whFilter, search, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleWh = (v: string) => {
    setWh(v);
    setPage(1);
  };
  const handleCategoryTab = (v: CategoryTab) => {
    setCategoryTab(v);
    setPage(1);
  };

  const downloadCSV = () => {
    const headers = [
      "Date",
      "Time",
      "Product",
      "SKU",
      "Type",
      "Quantity",
      "Warehouse",
      "Reference",
      "User",
    ];
    const rows = filtered.map((m) => {
      const product = products.find((p) => p.id === m.productId);
      const warehouse = warehouses.find((w) => w.id === m.warehouseId);
      const d = new Date(m.timestamp);
      return [
        d.toLocaleDateString(),
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        product?.name ?? "Unknown",
        product?.sku ?? "",
        MOVEMENT_LABELS[m.movementType] ?? m.movementType,
        m.quantity,
        warehouse?.name ?? m.warehouseId,
        `${m.referenceType} #${m.referenceId.slice(0, 8).toUpperCase()}`,
        m.userId,
      ];
    });
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const categoryLabel =
      categoryTab === "all"
        ? "all"
        : (MOVEMENT_LABELS[categoryTab] ?? categoryTab)
            .toLowerCase()
            .replace(/ /g, "-");
    a.download = `stock-history-${categoryLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filtered.length} records`);
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map((cat) => {
          const isActive = categoryTab === cat.key;
          const count = categoryCounts[cat.key] ?? 0;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategoryTab(cat.key)}
              data-ocid={`history.category_tab_${cat.key}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border"
              style={{
                background: isActive ? `${cat.activeColor}` : "transparent",
                borderColor: isActive
                  ? cat.activeColor
                  : "oklch(0.80 0.02 290)",
                color: isActive ? "white" : cat.color,
                boxShadow: isActive ? `0 2px 8px ${cat.activeColor}40` : "none",
              }}
            >
              {cat.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  background: isActive
                    ? "oklch(1 0 0 / 0.25)"
                    : "oklch(0.92 0.02 290)",
                  color: isActive ? "white" : "oklch(0.40 0.04 290)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
            data-ocid="history.search_input"
          />
        </div>
        <Select value={whFilter} onValueChange={handleWh}>
          <SelectTrigger className="w-44" data-ocid="history.warehouse_select">
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
        <Button
          variant="outline"
          onClick={downloadCSV}
          className="gap-2 shrink-0"
          data-ocid="history.download_button"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table data-ocid="history.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date / Time</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="history.empty_state"
                  >
                    No stock movements found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((m) => {
                  const product = products.find((p) => p.id === m.productId);
                  const warehouse = warehouses.find(
                    (w) => w.id === m.warehouseId,
                  );
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <div>{new Date(m.timestamp).toLocaleDateString()}</div>
                        <div>
                          {new Date(m.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {product?.name ?? "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {product?.sku}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${MOVEMENT_COLORS[m.movementType] ?? ""}`}
                        >
                          {MOVEMENT_LABELS[m.movementType] ?? m.movementType}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono font-semibold text-sm ${m.quantity > 0 ? "text-emerald-600" : "text-destructive"}`}
                      >
                        {m.quantity > 0 ? "+" : ""}
                        {m.quantity}
                      </TableCell>
                      <TableCell className="text-sm">
                        {warehouse?.name ?? m.warehouseId}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {m.referenceType} #
                        {m.referenceId.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.userId}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
              entries
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                data-ocid="history.pagination_prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                data-ocid="history.pagination_next"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
