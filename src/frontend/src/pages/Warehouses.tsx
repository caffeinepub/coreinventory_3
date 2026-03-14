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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Pencil, Plus, Trash2, Warehouse } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInventory } from "../store/inventoryStore";
import type { Warehouse as WarehouseType } from "../types/inventory";

type FormState = {
  name: string;
  location: string;
  description: string;
};

const emptyForm: FormState = { name: "", location: "", description: "" };

export default function Warehouses() {
  const {
    warehouses,
    products,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
  } = useInventory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [deleteTarget, setDeleteTarget] = useState<WarehouseType | null>(null);

  const productCountFor = (warehouseId: string) =>
    products.filter((p) => p.warehouseId === warehouseId).length;

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  }

  function openEdit(w: WarehouseType) {
    setEditingId(w.id);
    setForm({ name: w.name, location: w.location, description: w.description });
    setErrors({});
    setDialogOpen(true);
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.location.trim()) e.location = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    if (editingId) {
      updateWarehouse(editingId, {
        name: form.name.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
      });
      toast.success("Warehouse updated successfully");
    } else {
      addWarehouse({
        name: form.name.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
      });
      toast.success("Warehouse added successfully");
    }
    setDialogOpen(false);
  }

  function handleDeleteClick(w: WarehouseType) {
    const count = productCountFor(w.id);
    if (count > 0) {
      toast.error(
        `Cannot delete "${w.name}" — it has ${count} product${count === 1 ? "" : "s"} assigned. Reassign them first.`,
      );
      return;
    }
    setDeleteTarget(w);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteWarehouse(deleteTarget.id);
    toast.success(`"${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6" data-ocid="warehouses.page">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.62 0.28 290), oklch(0.48 0.24 300))",
              boxShadow: "0 4px 14px oklch(0.52 0.28 290 / 0.35)",
            }}
          >
            <Warehouse className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold font-display leading-tight"
              style={{ color: "oklch(0.20 0.08 290)" }}
            >
              Warehouses
            </h1>
            <p className="text-sm text-muted-foreground">
              {warehouses.length} warehouse{warehouses.length === 1 ? "" : "s"}{" "}
              configured
            </p>
          </div>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="warehouses.add_button"
          className="gap-2 font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.45 0.24 300))",
            color: "white",
            boxShadow: "0 4px 14px oklch(0.52 0.28 290 / 0.35)",
            border: "none",
          }}
        >
          <Plus className="w-4 h-4" />
          Add Warehouse
        </Button>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: "oklch(0.88 0.02 290)",
          boxShadow: "0 2px 16px oklch(0.52 0.08 290 / 0.08)",
        }}
      >
        <Table data-ocid="warehouses.table">
          <TableHeader>
            <TableRow style={{ background: "oklch(0.97 0.01 290)" }}>
              <TableHead className="font-semibold text-xs uppercase tracking-wider py-4">
                Warehouse
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Location
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">
                Products
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.length === 0 ? (
              <TableRow data-ocid="warehouses.empty_state">
                <TableCell colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "oklch(0.94 0.02 290)" }}
                    >
                      <Warehouse
                        className="w-7 h-7"
                        style={{ color: "oklch(0.55 0.12 290)" }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        No warehouses yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Add your first warehouse to get started
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={openAdd}
                      className="gap-1.5 mt-1"
                      style={{
                        background: "oklch(0.55 0.28 290)",
                        color: "white",
                        border: "none",
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Warehouse
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              warehouses.map((w, idx) => {
                const count = productCountFor(w.id);
                const rowOcid = `warehouses.item.${idx + 1}`;
                return (
                  <TableRow
                    key={w.id}
                    data-ocid={rowOcid}
                    className="transition-colors duration-150 hover:bg-muted/30"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "oklch(0.52 0.28 290 / 0.10)" }}
                        >
                          <Warehouse
                            className="w-4 h-4"
                            style={{ color: "oklch(0.52 0.28 290)" }}
                          />
                        </div>
                        <span className="font-semibold text-sm">{w.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {w.location}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {w.description || (
                          <span className="italic opacity-50">—</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        style={{
                          background:
                            count > 0
                              ? "oklch(0.52 0.28 290 / 0.10)"
                              : "oklch(0.93 0.01 290)",
                          color:
                            count > 0
                              ? "oklch(0.40 0.22 290)"
                              : "oklch(0.50 0.04 290)",
                          border: "none",
                        }}
                      >
                        {count} product{count === 1 ? "" : "s"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(w)}
                          data-ocid={`warehouses.edit_button.${idx + 1}`}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-violet-50"
                          style={{ color: "oklch(0.52 0.22 290)" }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(w)}
                          data-ocid={`warehouses.delete_button.${idx + 1}`}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-red-50"
                          style={{ color: "oklch(0.50 0.20 25)" }}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          data-ocid="warehouses.dialog"
          style={{ borderRadius: "1rem" }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editingId ? "Edit Warehouse" : "Add Warehouse"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="wh-name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="wh-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Mumbai Central Warehouse"
                data-ocid="warehouses.name_input"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-location" className="text-sm font-medium">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="wh-location"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g. Mumbai, Maharashtra"
                data-ocid="warehouses.location_input"
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-desc" className="text-sm font-medium">
                Description
                <span className="text-muted-foreground font-normal ml-1">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="wh-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Brief description of this warehouse..."
                rows={3}
                data-ocid="warehouses.description_input"
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="warehouses.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              data-ocid="warehouses.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.45 0.24 300))",
                color: "white",
                border: "none",
              }}
            >
              {editingId ? "Save Changes" : "Add Warehouse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm" style={{ borderRadius: "1rem" }}>
          <DialogHeader>
            <DialogTitle className="font-display">
              Delete Warehouse?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="warehouses.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              data-ocid="warehouses.confirm_button"
              style={{
                background: "oklch(0.50 0.22 25)",
                color: "white",
                border: "none",
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
