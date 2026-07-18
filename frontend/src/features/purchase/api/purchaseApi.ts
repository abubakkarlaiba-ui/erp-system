import { api } from '@/lib/api';
import { PaginatedResponse, PaginationParams, Supplier, PurchaseRequest, PurchaseOrder, GoodsReceipt, VendorBill, PurchaseReturn } from '@/types';

export const purchaseApi = {
  suppliers: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<Supplier>>('/purchase/suppliers', { params }),
    getById: (id: string) =>
      api.get<Supplier>(`/purchase/suppliers/${id}`),
    create: (data: Partial<Supplier>) =>
      api.post<Supplier>('/purchase/suppliers', data),
    update: (id: string, data: Partial<Supplier>) =>
      api.put<Supplier>(`/purchase/suppliers/${id}`, data),
    delete: (id: string) =>
      api.delete(`/purchase/suppliers/${id}`),
  },

  requests: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<PurchaseRequest>>('/purchase/requests', { params }),
    create: (data: Partial<PurchaseRequest>) =>
      api.post<PurchaseRequest>('/purchase/requests', data),
    approve: (id: string) =>
      api.post<PurchaseRequest>(`/purchase/requests/${id}/approve`),
  },

  orders: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<PurchaseOrder>>('/purchase/orders', { params }),
    getById: (id: string) =>
      api.get<PurchaseOrder>(`/purchase/orders/${id}`),
    create: (data: Partial<PurchaseOrder>) =>
      api.post<PurchaseOrder>('/purchase/orders', data),
    update: (id: string, data: Partial<PurchaseOrder>) =>
      api.put<PurchaseOrder>(`/purchase/orders/${id}`, data),
    cancel: (id: string) =>
      api.post<PurchaseOrder>(`/purchase/orders/${id}/cancel`),
  },

  receipts: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<GoodsReceipt>>('/purchase/receipts', { params }),
    create: (data: Partial<GoodsReceipt>) =>
      api.post<GoodsReceipt>('/purchase/receipts', data),
  },

  bills: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<VendorBill>>('/purchase/bills', { params }),
    create: (data: Partial<VendorBill>) =>
      api.post<VendorBill>('/purchase/bills', data),
  },

  returns: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<PurchaseReturn>>('/purchase/returns', { params }),
    create: (data: Partial<PurchaseReturn>) =>
      api.post<PurchaseReturn>('/purchase/returns', data),
  },
};
