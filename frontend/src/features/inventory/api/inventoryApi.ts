import { api } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  unitPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  imageUrl: string;
  isActive: boolean;
  barcode: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  productCount: number;
  isActive: boolean;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  isActive: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  manager: string;
  phone: string;
  totalStock: number;
  isActive: boolean;
}

export interface StockItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: "purchase" | "sale" | "transfer" | "adjustment" | "return";
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  reference: string;
  createdBy: string;
}

export interface Adjustment {
  id: string;
  adjustmentNumber: string;
  date: string;
  warehouseId: string;
  warehouseName: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  items: AdjustmentItem[];
}

export interface AdjustmentItem {
  productId: string;
  productName: string;
  quantityBefore: number;
  quantityAfter: number;
  difference: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  brandId?: string;
  warehouseId?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const inventoryApi = {
  getProducts: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Product>>("/inventory/products", { params }),

  getProduct: (id: string) =>
    api.get<Product>(`/inventory/products/${id}`),

  createProduct: (data: Omit<Product, "id" | "stock">) =>
    api.post<Product>("/inventory/products", data),

  updateProduct: (id: string, data: Partial<Product>) =>
    api.put<Product>(`/inventory/products/${id}`, data),

  deleteProduct: (id: string) =>
    api.delete(`/inventory/products/${id}`),

  getCategories: () =>
    api.get<Category[]>("/inventory/categories"),

  createCategory: (data: Omit<Category, "id" | "productCount" | "children">) =>
    api.post<Category>("/inventory/categories", data),

  updateCategory: (id: string, data: Partial<Category>) =>
    api.put<Category>(`/inventory/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete(`/inventory/categories/${id}`),

  getBrands: () =>
    api.get<Brand[]>("/inventory/brands"),

  createBrand: (data: Omit<Brand, "id">) =>
    api.post<Brand>("/inventory/brands", data),

  getWarehouses: () =>
    api.get<Warehouse[]>("/inventory/warehouses"),

  createWarehouse: (data: Omit<Warehouse, "id" | "totalStock">) =>
    api.post<Warehouse>("/inventory/warehouses", data),

  updateWarehouse: (id: string, data: Partial<Warehouse>) =>
    api.put<Warehouse>(`/inventory/warehouses/${id}`, data),

  getStock: (params?: PaginationParams) =>
    api.get<PaginatedResponse<StockItem>>("/inventory/stock", { params }),

  getStockMovements: (params?: PaginationParams) =>
    api.get<PaginatedResponse<StockMovement>>("/inventory/stock-movements", { params }),

  createStockTransfer: (data: { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number; notes: string }) =>
    api.post<StockMovement>("/inventory/stock-transfers", data),

  getAdjustments: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Adjustment>>("/inventory/adjustments", { params }),

  createAdjustment: (data: { warehouseId: string; reason: string; items: { productId: string; quantityAfter: number }[] }) =>
    api.post<Adjustment>("/inventory/adjustments", data),

  approveAdjustment: (id: string) =>
    api.post<Adjustment>(`/inventory/adjustments/${id}/approve`),

  getLowStockProducts: () =>
    api.get<Product[]>("/inventory/products/low-stock"),
};
