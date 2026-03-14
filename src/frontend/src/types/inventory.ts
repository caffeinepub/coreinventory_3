export type Warehouse = {
  id: string;
  name: string;
  location: string;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  warehouseId: string;
  currentStock: number;
  minStockThreshold: number;
  price: number;
  createdAt: string;
};

export type ReceiptItem = {
  productId: string;
  quantity: number;
  unitCost: number;
};

export type Receipt = {
  id: string;
  supplierName: string;
  warehouseId: string;
  status: "draft" | "validated";
  items: ReceiptItem[];
  createdAt: string;
  validatedAt?: string;
};

export type DeliveryItem = {
  productId: string;
  quantity: number;
};

export type DeliveryOrder = {
  id: string;
  customerName: string;
  warehouseId: string;
  status: "draft" | "validated";
  items: DeliveryItem[];
  createdAt: string;
  validatedAt?: string;
};

export type TransferItem = {
  productId: string;
  quantity: number;
};

export type Transfer = {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: "draft" | "validated";
  items: TransferItem[];
  createdAt: string;
  validatedAt?: string;
};

export type AdjustmentItem = {
  productId: string;
  systemQty: number;
  physicalQty: number;
  difference: number;
};

export type Adjustment = {
  id: string;
  warehouseId: string;
  status: "draft" | "applied";
  items: AdjustmentItem[];
  createdAt: string;
  appliedAt?: string;
};

export type MovementType =
  | "receipt"
  | "delivery"
  | "transfer_in"
  | "transfer_out"
  | "adjustment";

export type StockMovement = {
  id: string;
  productId: string;
  warehouseId: string;
  movementType: MovementType;
  quantity: number;
  referenceId: string;
  referenceType: string;
  userId: string;
  timestamp: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};
