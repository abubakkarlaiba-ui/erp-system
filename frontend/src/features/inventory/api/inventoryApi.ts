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
  type: string;
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
  status: string;
  items: AdjustmentItem[];
}

export interface AdjustmentItem {
  productId: string;
  productName: string;
  quantityBefore: number;
  quantityAfter: number;
  difference: number;
}

function mapProduct(raw: any): Product {
  return {
    id: String(raw.id),
    name: raw.name || "",
    sku: raw.sku || "",
    description: raw.description || "",
    categoryId: String(raw.category || ""),
    categoryName: raw.category_name || "",
    brandId: String(raw.brand || ""),
    brandName: raw.brand_name || "",
    unitPrice: Number(raw.selling_price) || 0,
    costPrice: Number(raw.cost_price) || 0,
    stock: Number(raw.current_stock) || 0,
    minStock: Number(raw.minimum_stock) || 0,
    maxStock: Number(raw.reorder_level) || 0,
    imageUrl: raw.image || "",
    isActive: Boolean(raw.is_active),
    barcode: raw.barcode || "",
  };
}

function mapCategory(raw: any): Category {
  return {
    id: String(raw.id),
    name: raw.name || "",
    parentId: raw.parent ? String(raw.parent) : null,
    description: raw.description || "",
    productCount: raw.product_count || 0,
    isActive: Boolean(raw.is_active),
    children: raw.children?.map(mapCategory),
  };
}

function mapBrand(raw: any): Brand {
  return {
    id: String(raw.id),
    name: raw.name || "",
    logo: raw.logo || "",
    isActive: Boolean(raw.is_active),
  };
}

function mapWarehouse(raw: any): Warehouse {
  return {
    id: String(raw.id),
    name: raw.name || "",
    code: raw.code || "",
    address: raw.address || "",
    city: raw.city || "",
    manager: raw.manager_name || "",
    phone: raw.phone || "",
    totalStock: raw.total_stock || 0,
    isActive: Boolean(raw.is_active),
  };
}

function mapStockItem(raw: any): StockItem {
  return {
    id: String(raw.id),
    productId: String(raw.product),
    productName: raw.product_name || "",
    sku: raw.product_sku || "",
    warehouseId: String(raw.warehouse),
    warehouseName: raw.warehouse_name || "",
    quantity: Number(raw.quantity) || 0,
    reservedQuantity: Number(raw.reserved_quantity) || 0,
    availableQuantity: Number(raw.available_quantity) || 0,
  };
}

function mapStockMovement(raw: any): StockMovement {
  return {
    id: String(raw.id),
    date: raw.date || raw.created_at || "",
    productId: String(raw.product),
    productName: raw.product_name || "",
    type: raw.movement_type || "",
    fromWarehouse: raw.from_warehouse_name || "",
    toWarehouse: raw.to_warehouse_name || "",
    quantity: Number(raw.quantity) || 0,
    reference: raw.reference || "",
    createdBy: raw.created_by_name || "",
  };
}

function toCreateProductPayload(data: Partial<Product>) {
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.sku !== undefined) payload.sku = data.sku;
  if (data.description !== undefined) payload.description = data.description;
  if (data.categoryId !== undefined) payload.category = data.categoryId ? Number(data.categoryId) : null;
  if (data.brandId !== undefined) payload.brand = data.brandId ? Number(data.brandId) : null;
  if (data.unitPrice !== undefined) payload.selling_price = data.unitPrice;
  if (data.costPrice !== undefined) payload.cost_price = data.costPrice;
  if (data.minStock !== undefined) payload.minimum_stock = data.minStock;
  if (data.maxStock !== undefined) payload.reorder_level = data.maxStock;
  if (data.barcode !== undefined) payload.barcode = data.barcode;
  if (data.isActive !== undefined) payload.is_active = data.isActive;
  return payload;
}

export const inventoryApi = {
  getProducts: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/inventory/products/", { params });
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapProduct);
    return { data: results, count: data?.count ?? results.length };
  },

  getProduct: async (id: string) => {
    const { data } = await api.get<any>(`/inventory/products/${id}/`);
    return { data: mapProduct(data) };
  },

  createProduct: async (productData: Partial<Product>) => {
    const { data } = await api.post<any>("/inventory/products/", toCreateProductPayload(productData));
    return { data: mapProduct(data) };
  },

  updateProduct: async (id: string, productData: Partial<Product>) => {
    const { data } = await api.put<any>(`/inventory/products/${id}/`, toCreateProductPayload(productData));
    return { data: mapProduct(data) };
  },

  deleteProduct: async (id: string) => {
    const { data } = await api.delete(`/inventory/products/${id}/`);
    return data;
  },

  getCategories: async () => {
    const { data } = await api.get<any>("/inventory/categories/");
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapCategory);
    return { data: results };
  },

  createCategory: async (categoryData: Omit<Category, "id" | "productCount" | "children">) => {
    const { data } = await api.post<any>("/inventory/categories/", {
      name: categoryData.name,
      description: categoryData.description,
      parent: categoryData.parentId ? Number(categoryData.parentId) : null,
      is_active: categoryData.isActive,
    });
    return { data: mapCategory(data) };
  },

  updateCategory: async (id: string, categoryData: Partial<Category>) => {
    const payload: any = {};
    if (categoryData.name !== undefined) payload.name = categoryData.name;
    if (categoryData.description !== undefined) payload.description = categoryData.description;
    if (categoryData.parentId !== undefined) payload.parent = categoryData.parentId ? Number(categoryData.parentId) : null;
    if (categoryData.isActive !== undefined) payload.is_active = categoryData.isActive;
    const { data } = await api.put<any>(`/inventory/categories/${id}/`, payload);
    return { data: mapCategory(data) };
  },

  deleteCategory: async (id: string) => {
    const { data } = await api.delete(`/inventory/categories/${id}/`);
    return data;
  },

  getBrands: async () => {
    const { data } = await api.get<any>("/inventory/brands/");
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapBrand);
    return { data: results };
  },

  createBrand: async (brandData: Omit<Brand, "id">) => {
    const { data } = await api.post<any>("/inventory/brands/", {
      name: brandData.name,
      logo: brandData.logo,
      is_active: brandData.isActive,
    });
    return { data: mapBrand(data) };
  },

  getWarehouses: async () => {
    const { data } = await api.get<any>("/inventory/warehouses/");
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapWarehouse);
    return { data: results };
  },

  createWarehouse: async (warehouseData: Omit<Warehouse, "id" | "totalStock">) => {
    const { data } = await api.post<any>("/inventory/warehouses/", {
      name: warehouseData.name,
      code: warehouseData.code,
      address: warehouseData.address,
      city: warehouseData.city,
      phone: warehouseData.phone,
      is_active: warehouseData.isActive,
    });
    return { data: mapWarehouse(data) };
  },

  updateWarehouse: async (id: string, warehouseData: Partial<Warehouse>) => {
    const payload: any = {};
    if (warehouseData.name !== undefined) payload.name = warehouseData.name;
    if (warehouseData.code !== undefined) payload.code = warehouseData.code;
    if (warehouseData.address !== undefined) payload.address = warehouseData.address;
    if (warehouseData.city !== undefined) payload.city = warehouseData.city;
    if (warehouseData.phone !== undefined) payload.phone = warehouseData.phone;
    if (warehouseData.isActive !== undefined) payload.is_active = warehouseData.isActive;
    const { data } = await api.put<any>(`/inventory/warehouses/${id}/`, payload);
    return { data: mapWarehouse(data) };
  },

  getStock: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/inventory/stocks/", { params });
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapStockItem);
    return { data: results, count: data?.count ?? results.length };
  },

  getStockMovements: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/inventory/stock-movements/", { params });
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapStockMovement);
    return { data: results, count: data?.count ?? results.length };
  },

  createStockTransfer: async (transferData: { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number; notes: string }) => {
    const { data } = await api.post<any>("/inventory/stock-movements/", {
      product: Number(transferData.productId),
      movement_type: "transfer",
      from_warehouse: Number(transferData.fromWarehouseId),
      to_warehouse: Number(transferData.toWarehouseId),
      quantity: transferData.quantity,
      notes: transferData.notes,
    });
    return { data: mapStockMovement(data) };
  },

  getAdjustments: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/inventory/adjustments/", { params });
    const results = (data?.results ?? data?.data ?? data ?? []);
    return { data: results, count: data?.count ?? results.length };
  },

  createAdjustment: async (adjustmentData: { warehouseId: string; reason: string; items: { productId: string; quantityAfter: number }[] }) => {
    const { data } = await api.post<any>("/inventory/adjustments/", {
      warehouse: Number(adjustmentData.warehouseId),
      reason: adjustmentData.reason,
      items: adjustmentData.items.map((item) => ({
        product: Number(item.productId),
        quantity_after: item.quantityAfter,
      })),
    });
    return { data };
  },

  approveAdjustment: async (id: string) => {
    const { data } = await api.post<any>(`/inventory/adjustments/${id}/approve/`);
    return { data };
  },

  getLowStockProducts: async () => {
    const { data } = await api.get<any>("/inventory/stocks/low_stock/");
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapStockItem);
    return { data: results };
  },
};
