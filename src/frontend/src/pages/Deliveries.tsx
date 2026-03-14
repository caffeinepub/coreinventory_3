import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  CheckCircle,
  Download,
  Eye,
  PackageCheck,
  Plus,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInventory } from "../store/inventoryStore";
import type {
  DeliveryItem,
  DeliveryOrder,
  Receipt,
  ReceiptItem,
} from "../types/inventory";
import { formatINR } from "../utils/currency";

// ── helpers ──────────────────────────────────────────────────────────────────

interface InLineItem extends ReceiptItem {
  _key: string;
}
interface OutLineItem extends DeliveryItem {
  _key: string;
}

type Tab = "in" | "out";

const statusBadge = (status: string) =>
  status === "validated" ? (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      Validated
    </Badge>
  ) : (
    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
      Draft
    </Badge>
  );

const inrFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function downloadDeliveryIn(
  receipt: Receipt,
  warehouseName: string,
  productNames: Record<string, string>,
) {
  const grandTotal = receipt.items.reduce(
    (s, i) => s + i.quantity * i.unitCost,
    0,
  );
  const rows = receipt.items
    .map(
      (item) => `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${productNames[item.productId] ?? item.productId}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${inrFmt.format(item.unitCost)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${inrFmt.format(item.quantity * item.unitCost)}</td>
      </tr>`,
    )
    .join("");
  const html = deliveryHtmlTemplate({
    title: `Delivery In #${receipt.id.slice(0, 8).toUpperCase()}`,
    type: "DELIVERY IN",
    refLabel: "Supplier",
    refValue: receipt.supplierName,
    warehouse: warehouseName,
    date: new Date(receipt.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    items: receipt.items.length,
    status: receipt.status,
    rows,
    totalRow: `<tr class="total-row"><td colspan="3" style="text-align:right;padding-right:12px;">Grand Total</td><td style="text-align:right;">${inrFmt.format(grandTotal)}</td></tr>`,
    extraHeaders: `<th style="text-align:center">Qty</th><th style="text-align:right">Unit Cost (&#8377;)</th><th style="text-align:right">Total (&#8377;)</th>`,
  });
  triggerDownload(
    html,
    `delivery-in-${receipt.id.slice(0, 8).toUpperCase()}.html`,
  );
}

function downloadDeliveryOut(
  delivery: DeliveryOrder,
  warehouseName: string,
  productNames: Record<string, string>,
) {
  const rows = delivery.items
    .map(
      (item) => `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${productNames[item.productId] ?? item.productId}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      </tr>`,
    )
    .join("");
  const html = deliveryHtmlTemplate({
    title: `Delivery Out #${delivery.id.slice(0, 8).toUpperCase()}`,
    type: "DELIVERY OUT",
    refLabel: "Customer",
    refValue: delivery.customerName,
    warehouse: warehouseName,
    date: new Date(delivery.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    items: delivery.items.length,
    status: delivery.status,
    rows,
    totalRow: "",
    extraHeaders: `<th style="text-align:center">Qty</th>`,
  });
  triggerDownload(
    html,
    `delivery-out-${delivery.id.slice(0, 8).toUpperCase()}.html`,
  );
}

function deliveryHtmlTemplate(opts: {
  title: string;
  type: string;
  refLabel: string;
  refValue: string;
  warehouse: string;
  date: string;
  items: number;
  status: string;
  rows: string;
  totalRow: string;
  extraHeaders: string;
}) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><title>${opts.title}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; padding: 48px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
.brand { font-size: 22px; font-weight: 700; color: #6d28d9; }
.ref-id { font-size: 13px; color: #6b7280; font-family: monospace; margin-top: 4px; }
.type-tag { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; background: #ede9fe; color: #6d28d9; margin-bottom: 6px; }
.badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
.badge-draft { background: #fef9c3; color: #854d0e; }
.badge-validated { background: #d1fae5; color: #065f46; }
.meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 32px; }
.meta-item label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
.meta-item span { font-size: 14px; font-weight: 600; }
table { width: 100%; border-collapse: collapse; }
thead tr { background: #6d28d9; color: #fff; }
thead th { padding: 12px; text-align: left; font-size: 13px; font-weight: 600; }
tbody tr:last-child td { border-bottom: none; }
.total-row td { padding: 14px 12px; font-weight: 700; font-size: 15px; border-top: 2px solid #6d28d9; }
.footer { margin-top: 48px; text-align: center; font-size: 12px; color: #9ca3af; }
</style></head><body>
<div class="header">
  <div>
    <div class="brand">CoreInventory</div>
    <div style="margin-top:6px"><span class="type-tag">${opts.type}</span></div>
    <div class="ref-id">${opts.title}</div>
  </div>
  <span class="badge badge-${opts.status}">${opts.status.charAt(0).toUpperCase() + opts.status.slice(1)}</span>
</div>
<div class="meta">
  <div class="meta-item"><label>${opts.refLabel}</label><span>${opts.refValue}</span></div>
  <div class="meta-item"><label>Warehouse</label><span>${opts.warehouse}</span></div>
  <div class="meta-item"><label>Date</label><span>${opts.date}</span></div>
  <div class="meta-item"><label>Items</label><span>${opts.items} line item${opts.items !== 1 ? "s" : ""}</span></div>
</div>
<table>
  <thead><tr><th>Product</th>${opts.extraHeaders}</tr></thead>
  <tbody>${opts.rows}${opts.totalRow}</tbody>
</table>
<div class="footer">Generated by CoreInventory &mdash; ${new Date().toLocaleString("en-IN")}</div>
</body></html>`;
}

function triggerDownload(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Deliveries() {
  const {
    receipts,
    deliveries,
    products,
    warehouses,
    addReceipt,
    validateReceipt,
    deleteReceipt,
    addDelivery,
    validateDelivery,
    deleteDelivery,
  } = useInventory();

  const [tab, setTab] = useState<Tab>("out");

  // --- Delivery In (receipts) state ---
  const [inDialogOpen, setInDialogOpen] = useState(false);
  const [inViewId, setInViewId] = useState<string | null>(null);
  const [inSupplier, setInSupplier] = useState("");
  const [inWhId, setInWhId] = useState("");
  const [inLines, setInLines] = useState<InLineItem[]>([]);

  // --- Delivery Out state ---
  const [outDialogOpen, setOutDialogOpen] = useState(false);
  const [outViewId, setOutViewId] = useState<string | null>(null);
  const [outCustomer, setOutCustomer] = useState("");
  const [outWhId, setOutWhId] = useState("");
  const [outLines, setOutLines] = useState<OutLineItem[]>([]);

  const sortedIn = useMemo(
    () => [...receipts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [receipts],
  );
  const sortedOut = useMemo(
    () =>
      [...deliveries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [deliveries],
  );

  const productNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) map[p.id] = p.name;
    return map;
  }, [products]);

  const viewInReceipt = inViewId
    ? receipts.find((r) => r.id === inViewId)
    : null;
  const viewOutDelivery = outViewId
    ? deliveries.find((d) => d.id === outViewId)
    : null;

  // In handlers
  const openCreateIn = () => {
    setInSupplier("");
    setInWhId("");
    setInLines([]);
    setInDialogOpen(true);
  };
  const addInLine = () =>
    setInLines((p) => [
      ...p,
      {
        _key: Math.random().toString(36).slice(2),
        productId: "",
        quantity: 1,
        unitCost: 0,
      },
    ]);
  const updateInLine = (
    key: string,
    field: keyof ReceiptItem,
    val: string | number,
  ) =>
    setInLines((p) =>
      p.map((l) => (l._key === key ? { ...l, [field]: val } : l)),
    );
  const removeInLine = (key: string) =>
    setInLines((p) => p.filter((l) => l._key !== key));
  const handleCreateIn = () => {
    if (!inSupplier.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    if (!inWhId) {
      toast.error("Please select a warehouse");
      return;
    }
    if (inLines.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    for (const l of inLines) {
      if (!l.productId) {
        toast.error("Select a product for every line");
        return;
      }
      if (l.quantity <= 0) {
        toast.error("Quantity must be > 0");
        return;
      }
    }
    addReceipt({
      supplierName: inSupplier.trim(),
      warehouseId: inWhId,
      items: inLines.map(({ _key: _, ...rest }) => rest),
    });
    toast.success("Delivery In created");
    setInDialogOpen(false);
  };

  // Out handlers
  const openCreateOut = () => {
    setOutCustomer("");
    setOutWhId("");
    setOutLines([]);
    setOutDialogOpen(true);
  };
  const addOutLine = () =>
    setOutLines((p) => [
      ...p,
      { _key: Math.random().toString(36).slice(2), productId: "", quantity: 1 },
    ]);
  const updateOutLine = (
    key: string,
    field: keyof DeliveryItem,
    val: string | number,
  ) =>
    setOutLines((p) =>
      p.map((l) => (l._key === key ? { ...l, [field]: val } : l)),
    );
  const removeOutLine = (key: string) =>
    setOutLines((p) => p.filter((l) => l._key !== key));
  const handleCreateOut = () => {
    if (!outCustomer.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!outWhId) {
      toast.error("Please select a warehouse");
      return;
    }
    if (outLines.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    for (const l of outLines) {
      if (!l.productId) {
        toast.error("Select a product for every line");
        return;
      }
      if (l.quantity <= 0) {
        toast.error("Quantity must be > 0");
        return;
      }
    }
    addDelivery({
      customerName: outCustomer.trim(),
      warehouseId: outWhId,
      items: outLines.map(({ _key: _, ...rest }) => rest),
    });
    toast.success("Delivery Out created");
    setOutDialogOpen(false);
  };
  const handleValidateOut = (id: string) => {
    const result = validateDelivery(id);
    if (result.success) toast.success("Delivery validated — stock updated");
    else toast.error(result.error ?? "Validation failed");
  };

  // ── Tab UI ────────────────────────────────────────────────────────────────
  const tabBase =
    "relative flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200";
  const tabActive = "text-white";
  const tabInactive = "text-muted-foreground hover:text-foreground";

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl w-fit"
        style={{ background: "oklch(0.14 0.06 290 / 0.5)" }}
      >
        <button
          type="button"
          className={`${tabBase} ${tab === "in" ? tabActive : tabInactive}`}
          style={
            tab === "in"
              ? {
                  background:
                    "linear-gradient(135deg, oklch(0.62 0.28 290), oklch(0.48 0.24 300))",
                  boxShadow: "0 2px 12px oklch(0.52 0.28 290 / 0.4)",
                }
              : {}
          }
          onClick={() => setTab("in")}
          data-ocid="deliveries.tab_in"
        >
          <PackageCheck className="w-4 h-4" />
          Delivery In
          <span
            className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
            style={{
              background:
                tab === "in"
                  ? "oklch(1 0 0 / 0.2)"
                  : "oklch(0.55 0.22 290 / 0.15)",
              color: tab === "in" ? "white" : "oklch(0.62 0.22 290)",
            }}
          >
            {sortedIn.length}
          </span>
        </button>
        <button
          type="button"
          className={`${tabBase} ${tab === "out" ? tabActive : tabInactive}`}
          style={
            tab === "out"
              ? {
                  background:
                    "linear-gradient(135deg, oklch(0.62 0.28 290), oklch(0.48 0.24 300))",
                  boxShadow: "0 2px 12px oklch(0.52 0.28 290 / 0.4)",
                }
              : {}
          }
          onClick={() => setTab("out")}
          data-ocid="deliveries.tab_out"
        >
          <Truck className="w-4 h-4" />
          Delivery Out
          <span
            className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
            style={{
              background:
                tab === "out"
                  ? "oklch(1 0 0 / 0.2)"
                  : "oklch(0.55 0.22 290 / 0.15)",
              color: tab === "out" ? "white" : "oklch(0.62 0.22 290)",
            }}
          >
            {sortedOut.length}
          </span>
        </button>
      </div>

      {/* ── DELIVERY IN ─────────────────────────────────────────────────── */}
      {tab === "in" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Delivery In</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inbound stock from suppliers
              </p>
            </div>
            <Button onClick={openCreateIn} data-ocid="delivery_in.add_button">
              <Plus className="w-4 h-4 mr-1.5" /> Create Delivery In
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <Table data-ocid="delivery_in.table">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedIn.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-muted-foreground"
                        data-ocid="delivery_in.empty_state"
                      >
                        No inbound deliveries yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedIn.map((r, i) => {
                      const wh = warehouses.find((w) => w.id === r.warehouseId);
                      return (
                        <TableRow
                          key={r.id}
                          data-ocid={`delivery_in.item.${i + 1}`}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {r.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {r.supplierName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {wh?.name ?? r.warehouseId}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {r.items.length}
                          </TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setInViewId(r.id)}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                                onClick={() => {
                                  downloadDeliveryIn(
                                    r,
                                    wh?.name ?? r.warehouseId,
                                    productNames,
                                  );
                                  toast.success("Downloaded");
                                }}
                                data-ocid={`delivery_in.download_button.${i + 1}`}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                              {r.status === "draft" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => {
                                    validateReceipt(r.id);
                                    toast.success("Validated — stock updated");
                                  }}
                                  data-ocid={`delivery_in.validate_button.${i + 1}`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />{" "}
                                  Validate
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  deleteReceipt(r.id);
                                  toast.success("Deleted");
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Delivery In Create Dialog */}
          <Dialog open={inDialogOpen} onOpenChange={setInDialogOpen}>
            <DialogContent
              className="max-w-2xl"
              data-ocid="delivery_in_form.dialog"
            >
              <DialogHeader>
                <DialogTitle>Create Delivery In</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Supplier Name *</Label>
                    <Input
                      value={inSupplier}
                      onChange={(e) => setInSupplier(e.target.value)}
                      placeholder="e.g. TechSource India"
                      data-ocid="delivery_in_form.supplier_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Warehouse *</Label>
                    <Select value={inWhId} onValueChange={setInWhId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name} — {w.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Line Items</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addInLine}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                    </Button>
                  </div>
                  {inLines.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                      No items added.
                    </p>
                  )}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {inLines.map((line) => (
                      <div
                        key={line._key}
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center"
                      >
                        <Select
                          value={line.productId}
                          onValueChange={(v) =>
                            updateInLine(line._key, "productId", v)
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={1}
                          className="w-20 text-sm"
                          placeholder="Qty"
                          value={line.quantity}
                          onChange={(e) =>
                            updateInLine(
                              line._key,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                        />
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          className="w-28 text-sm"
                          placeholder="Cost (₹)"
                          value={line.unitCost}
                          onChange={(e) =>
                            updateInLine(
                              line._key,
                              "unitCost",
                              Number(e.target.value),
                            )
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeInLine(line._key)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateIn}
                  data-ocid="delivery_in_form.submit_button"
                >
                  Create Delivery In
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delivery In View Dialog */}
          <Dialog
            open={!!inViewId}
            onOpenChange={(open) => !open && setInViewId(null)}
          >
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Delivery In Details</DialogTitle>
              </DialogHeader>
              {viewInReceipt && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Supplier:</span>{" "}
                      <span className="font-medium">
                        {viewInReceipt.supplierName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Warehouse:</span>{" "}
                      <span className="font-medium">
                        {
                          warehouses.find(
                            (w) => w.id === viewInReceipt.warehouseId,
                          )?.name
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>{" "}
                      <span className="font-medium capitalize">
                        {viewInReceipt.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      <span className="font-medium">
                        {new Date(viewInReceipt.createdAt).toLocaleDateString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewInReceipt.items.map((item) => {
                        const p = products.find(
                          (pr) => pr.id === item.productId,
                        );
                        return (
                          <TableRow key={item.productId}>
                            <TableCell className="text-sm">
                              {p?.name ?? item.productId}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {formatINR(item.unitCost)}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              {formatINR(item.quantity * item.unitCost)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setInViewId(null)}>
                  Close
                </Button>
                {viewInReceipt && (
                  <Button
                    onClick={() => {
                      const wh = warehouses.find(
                        (w) => w.id === viewInReceipt.warehouseId,
                      );
                      downloadDeliveryIn(
                        viewInReceipt,
                        wh?.name ?? viewInReceipt.warehouseId,
                        productNames,
                      );
                      toast.success("Downloaded");
                    }}
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.45 0.25 300))",
                    }}
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Download
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ── DELIVERY OUT ─────────────────────────────────────────────────── */}
      {tab === "out" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Delivery Out</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Outbound stock to customers
              </p>
            </div>
            <Button onClick={openCreateOut} data-ocid="delivery_out.add_button">
              <Plus className="w-4 h-4 mr-1.5" /> Create Delivery Out
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <Table data-ocid="delivery_out.table">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOut.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-muted-foreground"
                        data-ocid="delivery_out.empty_state"
                      >
                        No outbound deliveries yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedOut.map((d, i) => {
                      const wh = warehouses.find((w) => w.id === d.warehouseId);
                      return (
                        <TableRow
                          key={d.id}
                          data-ocid={`delivery_out.item.${i + 1}`}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {d.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {d.customerName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {wh?.name ?? d.warehouseId}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {d.items.length}
                          </TableCell>
                          <TableCell>{statusBadge(d.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(d.createdAt).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setOutViewId(d.id)}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                                onClick={() => {
                                  downloadDeliveryOut(
                                    d,
                                    wh?.name ?? d.warehouseId,
                                    productNames,
                                  );
                                  toast.success("Downloaded");
                                }}
                                data-ocid={`delivery_out.download_button.${i + 1}`}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                              {d.status === "draft" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => handleValidateOut(d.id)}
                                  data-ocid={`delivery_out.validate_button.${i + 1}`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />{" "}
                                  Validate
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  deleteDelivery(d.id);
                                  toast.success("Deleted");
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Delivery Out Create Dialog */}
          <Dialog open={outDialogOpen} onOpenChange={setOutDialogOpen}>
            <DialogContent
              className="max-w-2xl"
              data-ocid="delivery_out_form.dialog"
            >
              <DialogHeader>
                <DialogTitle>Create Delivery Out</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Customer Name *</Label>
                    <Input
                      value={outCustomer}
                      onChange={(e) => setOutCustomer(e.target.value)}
                      placeholder="e.g. Tata Group"
                      data-ocid="delivery_out_form.customer_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Warehouse *</Label>
                    <Select value={outWhId} onValueChange={setOutWhId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name} — {w.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Line Items</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOutLine}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                    </Button>
                  </div>
                  {outLines.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                      No items added.
                    </p>
                  )}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {outLines.map((line) => (
                      <div
                        key={line._key}
                        className="grid grid-cols-[1fr_auto_auto] gap-2 items-center"
                      >
                        <Select
                          value={line.productId}
                          onValueChange={(v) =>
                            updateOutLine(line._key, "productId", v)
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.sku}) — Stock: {p.currentStock}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={1}
                          className="w-24 text-sm"
                          placeholder="Qty"
                          value={line.quantity}
                          onChange={(e) =>
                            updateOutLine(
                              line._key,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeOutLine(line._key)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOutDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateOut}
                  data-ocid="delivery_out_form.submit_button"
                >
                  Create Delivery Out
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delivery Out View Dialog */}
          <Dialog
            open={!!outViewId}
            onOpenChange={(open) => !open && setOutViewId(null)}
          >
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Delivery Out Details</DialogTitle>
              </DialogHeader>
              {viewOutDelivery && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer:</span>{" "}
                      <span className="font-medium">
                        {viewOutDelivery.customerName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Warehouse:</span>{" "}
                      <span className="font-medium">
                        {
                          warehouses.find(
                            (w) => w.id === viewOutDelivery.warehouseId,
                          )?.name
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>{" "}
                      <span className="font-medium capitalize">
                        {viewOutDelivery.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      <span className="font-medium">
                        {new Date(viewOutDelivery.createdAt).toLocaleDateString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewOutDelivery.items.map((item) => {
                        const p = products.find(
                          (pr) => pr.id === item.productId,
                        );
                        return (
                          <TableRow key={item.productId}>
                            <TableCell className="text-sm">
                              {p?.name ?? item.productId}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {item.quantity}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOutViewId(null)}>
                  Close
                </Button>
                {viewOutDelivery && (
                  <Button
                    onClick={() => {
                      const wh = warehouses.find(
                        (w) => w.id === viewOutDelivery.warehouseId,
                      );
                      downloadDeliveryOut(
                        viewOutDelivery,
                        wh?.name ?? viewOutDelivery.warehouseId,
                        productNames,
                      );
                      toast.success("Downloaded");
                    }}
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.45 0.25 300))",
                    }}
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Download
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
