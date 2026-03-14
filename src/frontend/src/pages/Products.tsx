import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInventory } from "../store/inventoryStore";
import type { Product } from "../types/inventory";
import { formatINR } from "../utils/currency";

type ProductForm = Omit<Product, "id" | "createdAt">;

const EMPTY_FORM: ProductForm = {
  name: "",
  sku: "",
  category: "",
  unitOfMeasure: "",
  warehouseId: "",
  currentStock: 0,
  minStockThreshold: 0,
  price: 0,
};

const CATEGORIES = [
  "Electronics",
  "Office Supplies",
  "Machinery",
  "Raw Materials",
  "Furniture",
  "Consumables",
  "Other",
];
const UNITS = [
  "Unit",
  "Pack",
  "Box",
  "Piece",
  "Roll",
  "Sheet",
  "Kg",
  "Liter",
  "Meter",
];

function stockBadge(stock: number, min: number) {
  if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
  if (stock <= min)
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
        Low Stock
      </Badge>
    );
  return (
    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
      In Stock
    </Badge>
  );
}

export default function Products() {
  const { products, warehouses, addProduct, updateProduct, deleteProduct } =
    useInventory();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterWh, setFilterWh] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (
          search &&
          !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.sku.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        if (filterCat !== "all" && p.category !== filterCat) return false;
        if (filterWh !== "all" && p.warehouseId !== filterWh) return false;
        return true;
      }),
    [products, search, filterCat, filterWh],
  );

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitOfMeasure: p.unitOfMeasure,
      warehouseId: p.warehouseId,
      currentStock: p.currentStock,
      minStockThreshold: p.minStockThreshold,
      price: p.price ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.sku || !form.category || !form.warehouseId) {
      toast.error("Please fill all required fields");
      return;
    }
    if (editId) {
      updateProduct(editId, form);
      toast.success("Product updated");
    } else {
      addProduct(form);
      toast.success("Product added");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct(deleteId);
    toast.success("Product deleted");
    setDeleteId(null);
  };

  const f = (field: keyof ProductForm, val: string | number) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="products.search_input"
          />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-44" data-ocid="products.category_select">
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
        <Select value={filterWh} onValueChange={setFilterWh}>
          <SelectTrigger className="w-44" data-ocid="products.warehouse_select">
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
          onClick={openAdd}
          data-ocid="products.add_button"
          className="flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table data-ocid="products.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>UoM</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Price (₹)</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Stock Value (₹)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="products.empty_state"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p, i) => {
                  const wh = warehouses.find((w) => w.id === p.warehouseId);
                  const isLow =
                    p.currentStock > 0 && p.currentStock <= p.minStockThreshold;
                  const isOut = p.currentStock === 0;
                  const price = p.price ?? 0;
                  const stockValue = price * p.currentStock;
                  return (
                    <TableRow
                      key={p.id}
                      data-ocid={`products.item.${i + 1}`}
                      className={
                        isOut ? "bg-destructive/5" : isLow ? "bg-yellow-50" : ""
                      }
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {p.sku}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-sm">{p.category}</TableCell>
                      <TableCell className="text-sm">
                        {p.unitOfMeasure}
                      </TableCell>
                      <TableCell className="text-sm">
                        {wh?.name ?? p.warehouseId}
                      </TableCell>
                      <TableCell
                        className="text-right font-mono font-semibold text-sm"
                        style={{ color: "oklch(0.55 0.20 145)" }}
                      >
                        {formatINR(price)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-sm">
                        {p.currentStock}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {p.minStockThreshold}
                      </TableCell>
                      <TableCell>
                        {stockBadge(p.currentStock, p.minStockThreshold)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {formatINR(stockValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(p)}
                            data-ocid={`products.edit_button.${i + 1}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(p.id)}
                            data-ocid={`products.delete_button.${i + 1}`}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="product_form.dialog">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => f("name", e.target.value)}
                placeholder={'e.g. MacBook Pro 14"'}
                data-ocid="product_form.name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>SKU / Code *</Label>
              <Input
                value={form.sku}
                onChange={(e) => f("sku", e.target.value)}
                placeholder="e.g. ELEC-001"
                data-ocid="product_form.sku_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => f("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit of Measure</Label>
              <Select
                value={form.unitOfMeasure}
                onValueChange={(v) => f("unitOfMeasure", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Warehouse *</Label>
              <Select
                value={form.warehouseId}
                onValueChange={(v) => f("warehouseId", v)}
              >
                <SelectTrigger>
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
            <div className="space-y-1.5">
              <Label>Selling Price (₹)</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={form.price}
                onChange={(e) => f("price", Number(e.target.value))}
                placeholder="e.g. 4999"
                data-ocid="product_form.price_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Initial Stock</Label>
              <Input
                type="number"
                min={0}
                value={form.currentStock}
                onChange={(e) => f("currentStock", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min Stock Threshold</Label>
              <Input
                type="number"
                min={0}
                value={form.minStockThreshold}
                onChange={(e) => f("minStockThreshold", Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="product_form.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} data-ocid="product_form.submit_button">
              {editId ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="product_form.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="product_form.delete_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
