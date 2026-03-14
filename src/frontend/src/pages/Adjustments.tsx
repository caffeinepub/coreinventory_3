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
import { CheckCircle, Eye, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInventory } from "../store/inventoryStore";
import type { AdjustmentItem } from "../types/inventory";

interface AdjLine extends AdjustmentItem {
  _key: string;
}

export default function Adjustments() {
  const {
    adjustments,
    products,
    warehouses,
    addAdjustment,
    applyAdjustment,
    deleteAdjustment,
  } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [whId, setWhId] = useState("");
  const [lines, setLines] = useState<AdjLine[]>([]);

  const sorted = useMemo(
    () =>
      [...adjustments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [adjustments],
  );
  const viewAdj = viewId ? adjustments.find((a) => a.id === viewId) : null;

  const warehouseProducts = useMemo(
    () => (whId ? products.filter((p) => p.warehouseId === whId) : []),
    [products, whId],
  );

  const handleSelectWarehouse = (id: string) => {
    setWhId(id);
    const whProds = products.filter((p) => p.warehouseId === id);
    setLines(
      whProds.map((p) => ({
        _key: p.id,
        productId: p.id,
        systemQty: p.currentStock,
        physicalQty: p.currentStock,
        difference: 0,
      })),
    );
  };

  const updatePhysical = (key: string, val: number) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l._key !== key) return l;
        const diff = val - l.systemQty;
        return { ...l, physicalQty: val, difference: diff };
      }),
    );
  };

  const handleCreate = () => {
    if (!whId) {
      toast.error("Select a warehouse");
      return;
    }
    if (lines.length === 0) {
      toast.error("No products in selected warehouse");
      return;
    }
    addAdjustment({
      warehouseId: whId,
      items: lines.map(({ _key: _, ...rest }) => rest),
    });
    toast.success("Adjustment created");
    setDialogOpen(false);
  };

  const handleApply = (id: string) => {
    applyAdjustment(id);
    toast.success("Adjustment applied — stock updated");
  };

  const statusBadge = (status: string) =>
    status === "applied" ? (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Applied
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        Draft
      </Badge>
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setWhId("");
            setLines([]);
            setDialogOpen(true);
          }}
          data-ocid="adjustments.add_button"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Adjustment
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table data-ocid="adjustments.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ID</TableHead>
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
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="adjustments.empty_state"
                  >
                    No adjustments
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((a, i) => {
                  const wh = warehouses.find((w) => w.id === a.warehouseId);
                  return (
                    <TableRow
                      key={a.id}
                      data-ocid={`adjustments.item.${i + 1}`}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {a.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {wh?.name ?? a.warehouseId}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {a.items.length}
                      </TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewId(a.id)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {a.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleApply(a.id)}
                              data-ocid={`adjustments.apply_button.${i + 1}`}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Apply
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              deleteAdjustment(a.id);
                              toast.success("Adjustment deleted");
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
        <DialogContent className="max-w-2xl" data-ocid="adjustment_form.dialog">
          <DialogHeader>
            <DialogTitle>Create Inventory Adjustment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Warehouse *</Label>
              <Select value={whId} onValueChange={handleSelectWarehouse}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select warehouse" />
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
            {whId && (
              <div className="space-y-2">
                <Label>Physical Count</Label>
                <p className="text-xs text-muted-foreground">
                  Enter the actual physical quantity for each product. The
                  system will calculate the difference.
                </p>
                {warehouseProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                    No products in this warehouse
                  </p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">
                            System Qty
                          </TableHead>
                          <TableHead className="text-right w-36">
                            Physical Qty
                          </TableHead>
                          <TableHead className="text-right">
                            Difference
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lines.map((line) => {
                          const p = products.find(
                            (pr) => pr.id === line.productId,
                          );
                          return (
                            <TableRow key={line._key}>
                              <TableCell className="text-sm">
                                <div className="font-medium">{p?.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {p?.sku}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                {line.systemQty}
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  min={0}
                                  className="w-24 text-sm text-right ml-auto"
                                  value={line.physicalQty}
                                  onChange={(e) =>
                                    updatePhysical(
                                      line._key,
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell
                                className={`text-right font-mono font-semibold text-sm ${
                                  line.difference > 0
                                    ? "text-emerald-600"
                                    : line.difference < 0
                                      ? "text-destructive"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {line.difference > 0 ? "+" : ""}
                                {line.difference}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              data-ocid="adjustment_form.submit_button"
            >
              Create Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewId} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adjustment Details</DialogTitle>
          </DialogHeader>
          {viewAdj && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Warehouse:</span>{" "}
                  <span className="font-medium">
                    {warehouses.find((w) => w.id === viewAdj.warehouseId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium capitalize">
                    {viewAdj.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-medium">
                    {new Date(viewAdj.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">System</TableHead>
                    <TableHead className="text-right">Physical</TableHead>
                    <TableHead className="text-right">Diff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewAdj.items.map((item) => {
                    const p = products.find((pr) => pr.id === item.productId);
                    return (
                      <TableRow key={item.productId}>
                        <TableCell className="text-sm">
                          {p?.name ?? item.productId}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {item.systemQty}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {item.physicalQty}
                        </TableCell>
                        <TableCell
                          className={`text-right text-sm font-semibold ${
                            item.difference > 0
                              ? "text-emerald-600"
                              : item.difference < 0
                                ? "text-destructive"
                                : "text-muted-foreground"
                          }`}
                        >
                          {item.difference > 0 ? "+" : ""}
                          {item.difference}
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
