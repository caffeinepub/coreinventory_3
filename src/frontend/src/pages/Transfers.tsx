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
import { CheckCircle, Eye, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInventory } from "../store/inventoryStore";
import type { TransferItem } from "../types/inventory";

interface LineItem extends TransferItem {
  _key: string;
}

export default function Transfers() {
  const {
    transfers,
    products,
    warehouses,
    addTransfer,
    validateTransfer,
    deleteTransfer,
  } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [fromWh, setFromWh] = useState("");
  const [toWh, setToWh] = useState("");
  const [lines, setLines] = useState<LineItem[]>([]);

  const sorted = useMemo(
    () => [...transfers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [transfers],
  );
  const viewTransfer = viewId ? transfers.find((t) => t.id === viewId) : null;

  const openCreate = () => {
    setFromWh("");
    setToWh("");
    setLines([]);
    setDialogOpen(true);
  };
  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { _key: Math.random().toString(36).slice(2), productId: "", quantity: 1 },
    ]);
  const updateLine = (
    key: string,
    field: keyof TransferItem,
    val: string | number,
  ) =>
    setLines((prev) =>
      prev.map((l) => (l._key === key ? { ...l, [field]: val } : l)),
    );
  const removeLine = (key: string) =>
    setLines((prev) => prev.filter((l) => l._key !== key));

  const handleCreate = () => {
    if (!fromWh) {
      toast.error("Select source warehouse");
      return;
    }
    if (!toWh) {
      toast.error("Select destination warehouse");
      return;
    }
    if (fromWh === toWh) {
      toast.error("Source and destination must be different");
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
    addTransfer({
      fromWarehouseId: fromWh,
      toWarehouseId: toWh,
      items: lines.map(({ _key: _, ...rest }) => rest),
    });
    toast.success("Transfer created");
    setDialogOpen(false);
  };

  const handleValidate = (id: string) => {
    validateTransfer(id);
    toast.success("Transfer validated — movements logged");
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
        <Button onClick={openCreate} data-ocid="transfers.add_button">
          <Plus className="w-4 h-4 mr-1.5" /> Create Transfer
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table data-ocid="transfers.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ID</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
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
                    data-ocid="transfers.empty_state"
                  >
                    No transfers
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((t, i) => {
                  const from = warehouses.find(
                    (w) => w.id === t.fromWarehouseId,
                  );
                  const to = warehouses.find((w) => w.id === t.toWarehouseId);
                  return (
                    <TableRow key={t.id} data-ocid={`transfers.item.${i + 1}`}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {t.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {from?.name ?? t.fromWarehouseId}
                      </TableCell>
                      <TableCell className="text-sm">
                        {to?.name ?? t.toWarehouseId}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {t.items.length}
                      </TableCell>
                      <TableCell>{statusBadge(t.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewId(t.id)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {t.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleValidate(t.id)}
                              data-ocid={`transfers.validate_button.${i + 1}`}
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
                              deleteTransfer(t.id);
                              toast.success("Transfer deleted");
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
        <DialogContent className="max-w-2xl" data-ocid="transfer_form.dialog">
          <DialogHeader>
            <DialogTitle>Create Internal Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>From Warehouse *</Label>
                <Select value={fromWh} onValueChange={setFromWh}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>To Warehouse *</Label>
                <Select value={toWh} onValueChange={setToWh}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses
                      .filter((w) => w.id !== fromWh)
                      .map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
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
                  No items added.
                </p>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lines.map((line) => (
                  <div
                    key={line._key}
                    className="grid grid-cols-[1fr_auto_auto] gap-2 items-center"
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
              data-ocid="transfer_form.submit_button"
            >
              Create Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewId} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
          </DialogHeader>
          {viewTransfer && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">From:</span>{" "}
                  <span className="font-medium">
                    {
                      warehouses.find(
                        (w) => w.id === viewTransfer.fromWarehouseId,
                      )?.name
                    }
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">To:</span>{" "}
                  <span className="font-medium">
                    {
                      warehouses.find(
                        (w) => w.id === viewTransfer.toWarehouseId,
                      )?.name
                    }
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium capitalize">
                    {viewTransfer.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-medium">
                    {new Date(viewTransfer.createdAt).toLocaleDateString()}
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
                  {viewTransfer.items.map((item) => {
                    const p = products.find((pr) => pr.id === item.productId);
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
            <Button variant="outline" onClick={() => setViewId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
