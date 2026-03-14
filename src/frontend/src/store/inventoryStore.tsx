import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  seedAdjustments,
  seedDeliveries,
  seedMovements,
  seedProducts,
  seedReceipts,
  seedTransfers,
  seedWarehouses,
} from "../data/seedData";
import type {
  Adjustment,
  DeliveryOrder,
  Product,
  Receipt,
  StockMovement,
  Transfer,
  Warehouse,
} from "../types/inventory";

const DATA_VERSION = "v8-inr";

function migrateIfNeeded() {
  const stored = localStorage.getItem("ci_data_version");
  if (stored !== DATA_VERSION) {
    const keys = [
      "ci_warehouses",
      "ci_products",
      "ci_receipts",
      "ci_deliveries",
      "ci_transfers",
      "ci_adjustments",
      "ci_movements",
    ];
    for (const k of keys) localStorage.removeItem(k);
    localStorage.setItem("ci_data_version", DATA_VERSION);
  }
}

migrateIfNeeded();

function genId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export interface InventoryContextValue {
  warehouses: Warehouse[];
  products: Product[];
  receipts: Receipt[];
  deliveries: DeliveryOrder[];
  transfers: Transfer[];
  adjustments: Adjustment[];
  movements: StockMovement[];

  // Warehouses
  addWarehouse: (w: Omit<Warehouse, "id">) => void;
  updateWarehouse: (
    id: string,
    updates: Partial<Omit<Warehouse, "id">>,
  ) => void;
  deleteWarehouse: (id: string) => void;

  // Products
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;

  // Receipts
  addReceipt: (r: Omit<Receipt, "id" | "createdAt" | "status">) => void;
  validateReceipt: (id: string) => void;
  deleteReceipt: (id: string) => void;

  // Deliveries
  addDelivery: (d: Omit<DeliveryOrder, "id" | "createdAt" | "status">) => void;
  validateDelivery: (id: string) => { success: boolean; error?: string };
  deleteDelivery: (id: string) => void;

  // Transfers
  addTransfer: (t: Omit<Transfer, "id" | "createdAt" | "status">) => void;
  validateTransfer: (id: string) => void;
  deleteTransfer: (id: string) => void;

  // Adjustments
  addAdjustment: (a: Omit<Adjustment, "id" | "createdAt" | "status">) => void;
  applyAdjustment: (id: string) => void;
  deleteAdjustment: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() =>
    load("ci_warehouses", seedWarehouses),
  );
  const [products, setProducts] = useState<Product[]>(() =>
    load("ci_products", seedProducts),
  );
  const [receipts, setReceipts] = useState<Receipt[]>(() =>
    load("ci_receipts", seedReceipts),
  );
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(() =>
    load("ci_deliveries", seedDeliveries),
  );
  const [transfers, setTransfers] = useState<Transfer[]>(() =>
    load("ci_transfers", seedTransfers),
  );
  const [adjustments, setAdjustments] = useState<Adjustment[]>(() =>
    load("ci_adjustments", seedAdjustments),
  );
  const [movements, setMovements] = useState<StockMovement[]>(() =>
    load("ci_movements", seedMovements),
  );

  useEffect(() => {
    localStorage.setItem("ci_warehouses", JSON.stringify(warehouses));
  }, [warehouses]);
  useEffect(() => {
    localStorage.setItem("ci_products", JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem("ci_receipts", JSON.stringify(receipts));
  }, [receipts]);
  useEffect(() => {
    localStorage.setItem("ci_deliveries", JSON.stringify(deliveries));
  }, [deliveries]);
  useEffect(() => {
    localStorage.setItem("ci_transfers", JSON.stringify(transfers));
  }, [transfers]);
  useEffect(() => {
    localStorage.setItem("ci_adjustments", JSON.stringify(adjustments));
  }, [adjustments]);
  useEffect(() => {
    localStorage.setItem("ci_movements", JSON.stringify(movements));
  }, [movements]);

  function getCurrentUserId(): string {
    try {
      const u = localStorage.getItem("ci_user");
      if (u) return (JSON.parse(u) as { id: string }).id;
    } catch {
      /* ignore */
    }
    return "unknown";
  }

  // Warehouses
  function addWarehouse(w: Omit<Warehouse, "id">) {
    setWarehouses((prev) => [...prev, { ...w, id: genId() }]);
  }
  function updateWarehouse(
    id: string,
    updates: Partial<Omit<Warehouse, "id">>,
  ) {
    setWarehouses((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    );
  }
  function deleteWarehouse(id: string) {
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
  }

  // Products
  function addProduct(p: Omit<Product, "id" | "createdAt">) {
    setProducts((prev) => [
      ...prev,
      { ...p, id: genId(), createdAt: new Date().toISOString() },
    ]);
  }
  function updateProduct(id: string, updates: Partial<Omit<Product, "id">>) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  }
  function deleteProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  // Receipts
  function addReceipt(r: Omit<Receipt, "id" | "createdAt" | "status">) {
    setReceipts((prev) => [
      ...prev,
      {
        ...r,
        id: genId(),
        status: "draft",
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  function validateReceipt(id: string) {
    const receipt = receipts.find((r) => r.id === id);
    if (!receipt || receipt.status !== "draft") return;
    const now = new Date().toISOString();
    const userId = getCurrentUserId();
    const newMovements: StockMovement[] = receipt.items.map((item) => ({
      id: genId(),
      productId: item.productId,
      warehouseId: receipt.warehouseId,
      movementType: "receipt" as const,
      quantity: item.quantity,
      referenceId: id,
      referenceType: "Receipt",
      userId,
      timestamp: now,
    }));
    setProducts((prev) =>
      prev.map((p) => {
        const item = receipt.items.find((i) => i.productId === p.id);
        return item
          ? { ...p, currentStock: p.currentStock + item.quantity }
          : p;
      }),
    );
    setMovements((prev) => [...prev, ...newMovements]);
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "validated" as const, validatedAt: now }
          : r,
      ),
    );
  }
  function deleteReceipt(id: string) {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  }

  // Deliveries
  function addDelivery(d: Omit<DeliveryOrder, "id" | "createdAt" | "status">) {
    setDeliveries((prev) => [
      ...prev,
      {
        ...d,
        id: genId(),
        status: "draft",
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  function validateDelivery(id: string): { success: boolean; error?: string } {
    const delivery = deliveries.find((d) => d.id === id);
    if (!delivery || delivery.status !== "draft")
      return { success: false, error: "Invalid delivery" };
    for (const item of delivery.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return { success: false, error: "Product not found" };
      if (product.currentStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}": available ${product.currentStock}, needed ${item.quantity}`,
        };
      }
    }
    const now = new Date().toISOString();
    const userId = getCurrentUserId();
    const newMovements: StockMovement[] = delivery.items.map((item) => ({
      id: genId(),
      productId: item.productId,
      warehouseId: delivery.warehouseId,
      movementType: "delivery" as const,
      quantity: -item.quantity,
      referenceId: id,
      referenceType: "Delivery",
      userId,
      timestamp: now,
    }));
    setProducts((prev) =>
      prev.map((p) => {
        const item = delivery.items.find((i) => i.productId === p.id);
        return item
          ? { ...p, currentStock: p.currentStock - item.quantity }
          : p;
      }),
    );
    setMovements((prev) => [...prev, ...newMovements]);
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: "validated" as const, validatedAt: now }
          : d,
      ),
    );
    return { success: true };
  }
  function deleteDelivery(id: string) {
    setDeliveries((prev) => prev.filter((d) => d.id !== id));
  }

  // Transfers
  function addTransfer(t: Omit<Transfer, "id" | "createdAt" | "status">) {
    setTransfers((prev) => [
      ...prev,
      {
        ...t,
        id: genId(),
        status: "draft",
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  function validateTransfer(id: string) {
    const transfer = transfers.find((t) => t.id === id);
    if (!transfer || transfer.status !== "draft") return;
    const now = new Date().toISOString();
    const userId = getCurrentUserId();
    const outMovements: StockMovement[] = transfer.items.map((item) => ({
      id: genId(),
      productId: item.productId,
      warehouseId: transfer.fromWarehouseId,
      movementType: "transfer_out" as const,
      quantity: -item.quantity,
      referenceId: id,
      referenceType: "Transfer",
      userId,
      timestamp: now,
    }));
    const inMovements: StockMovement[] = transfer.items.map((item) => ({
      id: genId(),
      productId: item.productId,
      warehouseId: transfer.toWarehouseId,
      movementType: "transfer_in" as const,
      quantity: item.quantity,
      referenceId: id,
      referenceType: "Transfer",
      userId,
      timestamp: now,
    }));
    setMovements((prev) => [...prev, ...outMovements, ...inMovements]);
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "validated" as const, validatedAt: now }
          : t,
      ),
    );
  }
  function deleteTransfer(id: string) {
    setTransfers((prev) => prev.filter((t) => t.id !== id));
  }

  // Adjustments
  function addAdjustment(a: Omit<Adjustment, "id" | "createdAt" | "status">) {
    setAdjustments((prev) => [
      ...prev,
      {
        ...a,
        id: genId(),
        status: "draft",
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  function applyAdjustment(id: string) {
    const adjustment = adjustments.find((a) => a.id === id);
    if (!adjustment || adjustment.status !== "draft") return;
    const now = new Date().toISOString();
    const userId = getCurrentUserId();
    const newMovements: StockMovement[] = adjustment.items
      .filter((item) => item.difference !== 0)
      .map((item) => ({
        id: genId(),
        productId: item.productId,
        warehouseId: adjustment.warehouseId,
        movementType: "adjustment" as const,
        quantity: item.difference,
        referenceId: id,
        referenceType: "Adjustment",
        userId,
        timestamp: now,
      }));
    setProducts((prev) =>
      prev.map((p) => {
        const item = adjustment.items.find((i) => i.productId === p.id);
        return item ? { ...p, currentStock: item.physicalQty } : p;
      }),
    );
    setMovements((prev) => [...prev, ...newMovements]);
    setAdjustments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "applied" as const, appliedAt: now } : a,
      ),
    );
  }
  function deleteAdjustment(id: string) {
    setAdjustments((prev) => prev.filter((a) => a.id !== id));
  }

  const value: InventoryContextValue = {
    warehouses,
    products,
    receipts,
    deliveries,
    transfers,
    adjustments,
    movements,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    addProduct,
    updateProduct,
    deleteProduct,
    addReceipt,
    validateReceipt,
    deleteReceipt,
    addDelivery,
    validateDelivery,
    deleteDelivery,
    addTransfer,
    validateTransfer,
    deleteTransfer,
    addAdjustment,
    applyAdjustment,
    deleteAdjustment,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx)
    throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
