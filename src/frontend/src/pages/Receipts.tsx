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
import { CheckCircle, Download, Eye, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInventory } from "../store/inventoryStore";
import type { Receipt, ReceiptItem } from "../types/inventory";
import { formatINR } from "../utils/currency";

interface LineItem extends ReceiptItem {
  _key: string;
}

function downloadReceipt(
  receipt: Receipt,
  warehouseName: string,
  productNames: Record<string, string>,
) {
  const grandTotal = receipt.items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  );
  const inrFmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  const rows = receipt.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${productNames[item.productId] ?? item.productId}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${inrFmt.format(item.unitCost)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${inrFmt.format(item.quantity * item.unitCost)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${receipt.id.slice(0, 8).toUpperCase()}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .brand { font-size: 22px; font-weight: 700; color: #6d28d9; }
    .receipt-id { font-size: 13px; color: #6b7280; font-family: monospace; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .badge-draft { background: #fef9c3; color: #854d0e; }
    .badge-validated { background: #d1fae5; color: #065f46; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 32px; }
    .meta-item label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
    .meta-item span { font-size: 14px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #6d28d9; color: #fff; }
    thead th { padding: 12px; text-align: left; font-size: 13px; font-weight: 600; }
    thead th:last-child, thead th:nth-child(3) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    tbody tr:last-child td { border-bottom: none; }
    .total-row td { padding: 14px 12px; font-weight: 700; font-size: 15px; border-top: 2px solid #6d28d9; }
    .footer { margin-top: 48px; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">CoreInventory</div>
      <div class="receipt-id">Receipt #${receipt.id.slice(0, 8).toUpperCase()}</div>
    </div>
    <span class="badge badge-${receipt.status}">${receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}</span>
  </div>
  <div class="meta">
    <div class="meta-item"><label>Supplier</label><span>${receipt.supplierName}</span></div>
    <div class="meta-item"><label>Warehouse</label><span>${warehouseName}</span></div>
    <div class="meta-item"><label>Date</label><span>${new Date(receipt.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span></div>
    <div class="meta-item"><label>Items</label><span>${receipt.items.length} line item${receipt.items.length !== 1 ? "s" : ""}</span></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Cost (₹)</th>
        <th style="text-align:right">Total (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td colspan="3" style="text-align:right;padding-right:12px;">Grand Total</td>
        <td style="text-align:right;">${inrFmt.format(grandTotal)}</td>
      </tr>
    </tbody>
  </table>
  <div class="footer">Generated by CoreInventory &mdash; ${new Date().toLocaleString("en-IN")}</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${receipt.id.slice(0, 8).toUpperCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Receipts() {
  const {
    receipts,
    products,
    warehouses,
    addReceipt,
    validateReceipt,
    deleteReceipt,
  } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [supplier, setSupplier] = useState("");
  const [whId, setWhId] = useState("");
  const [lines, setLines] = useState<LineItem[]>([]);

  const sorted = useMemo(
    () => [...receipts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [receipts],
  );
  const viewReceipt = viewId ? receipts.find((r) => r.id === viewId) : null;

  const productNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) map[p.id] = p.name;
    return map;
  }, [products]);

  const openCreate = () => {
    setSupplier("");
    setWhId("");
    setLines([]);
    setDialogOpen(true);
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        _key: Math.random().toString(36).slice(2),
        productId: "",
        quantity: 1,
        unitCost: 0,
      },
    ]);
  };

  const updateLine = (
    key: string,
    field: keyof ReceiptItem,
    val: string | number,
  ) => {
    setLines((prev) =>
      prev.map((l) => (l._key === key ? { ...l, [field]: val } : l)),
    );
  };

  const removeLine = (key: string) =>
    setLines((prev) => prev.filter((l) => l._key !== key));

  const handleCreate = () => {
    if (!supplier.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    if (!whId) {
      toast.error("Please select a warehouse");
      return;
    }
    if (lines.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    for (const l of lines) {
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
      supplierName: supplier.trim(),
      warehouseId: whId,
      items: lines.map(({ _key: _, ...rest }) => rest),
    });
    toast.success("Receipt created");
    setDialogOpen(false);
  };

  const handleValidate = (id: string) => {
    validateReceipt(id);
    toast.success("Receipt validated — stock updated");
  };

  const handleDownload = (r: (typeof receipts)[number]) => {
    const wh = warehouses.find((w) => w.id === r.warehouseId);
    downloadReceipt(r, wh?.name ?? r.warehouseId, productNames);
    toast.success("Receipt downloaded");
  };

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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} data-ocid="receipts.add_button">
          <Plus className="w-4 h-4 mr-1.5" /> Create Receipt
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table data-ocid="receipts.table">
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
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="receipts.empty_state"
                  >
                    No receipts yet
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((r, i) => {
                  const wh = warehouses.find((w) => w.id === r.warehouseId);
                  return (
                    <TableRow key={r.id} data-ocid={`receipts.item.${i + 1}`}>
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
                            onClick={() => setViewId(r.id)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                            onClick={() => handleDownload(r)}
                            title="Download receipt"
                            data-ocid={`receipts.download_button.${i + 1}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          {r.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleValidate(r.id)}
                              data-ocid={`receipts.validate_button.${i + 1}`}
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
                              toast.success("Receipt deleted");
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

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" data-ocid="receipt_form.dialog">
          <DialogHeader>
            <DialogTitle>Create Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Supplier Name *</Label>
                <Input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. TechSource India"
                  data-ocid="receipt_form.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Warehouse *</Label>
                <Select value={whId} onValueChange={setWhId}>
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
                  onClick={addLine}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                </Button>
              </div>
              {lines.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                  No items added. Click &quot;Add Item&quot; to start.
                </p>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lines.map((line) => (
                  <div
                    key={line._key}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center"
                  >
                    <Select
                      value={line.productId}
                      onValueChange={(v) =>
                        updateLine(line._key, "productId", v)
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
                      className="w-24 text-sm"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(
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
                      placeholder="Unit Cost (₹)"
                      value={line.unitCost}
                      onChange={(e) =>
                        updateLine(
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
                      onClick={() => removeLine(line._key)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              data-ocid="receipt_form.submit_button"
            >
              Create Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewId} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {viewReceipt && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Supplier:</span>{" "}
                  <span className="font-medium">
                    {viewReceipt.supplierName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Warehouse:</span>{" "}
                  <span className="font-medium">
                    {
                      warehouses.find((w) => w.id === viewReceipt.warehouseId)
                        ?.name
                    }
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium capitalize">
                    {viewReceipt.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-medium">
                    {new Date(viewReceipt.createdAt).toLocaleDateString(
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
                  {viewReceipt.items.map((item) => {
                    const p = products.find((pr) => pr.id === item.productId);
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
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-right font-semibold text-sm"
                    >
                      Grand Total
                    </TableCell>
                    <TableCell className="text-right font-bold text-sm">
                      {formatINR(
                        viewReceipt.items.reduce(
                          (sum, item) => sum + item.quantity * item.unitCost,
                          0,
                        ),
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewId(null)}
              data-ocid="receipts.close_button"
            >
              Close
            </Button>
            {viewReceipt && (
              <Button
                onClick={() => handleDownload(viewReceipt)}
                data-ocid="receipts.download_button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.45 0.25 300))",
                }}
              >
                <Download className="w-4 h-4 mr-1.5" /> Download Receipt
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
