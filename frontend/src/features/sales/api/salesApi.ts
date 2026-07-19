import { api } from '@/lib/api';
import { PaginatedResponse, PaginationParams, Customer, Lead, Opportunity, Quotation, SalesOrder, SalesReturn } from '@/types';

export const salesApi = {
  customers: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<Customer>>('/sales/customers/', { params }),
    getById: (id: string) =>
      api.get<Customer>(`/sales/customers/${id}/`),
    create: (data: Partial<Customer>) =>
      api.post<Customer>('/sales/customers/', data),
    update: (id: string, data: Partial<Customer>) =>
      api.put<Customer>(`/sales/customers/${id}/`, data),
    delete: (id: string) =>
      api.delete(`/sales/customers/${id}/`),
  },

  leads: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<Lead>>('/sales/leads/', { params }),
    getById: (id: string) =>
      api.get<Lead>(`/sales/leads/${id}/`),
    create: (data: Partial<Lead>) =>
      api.post<Lead>('/sales/leads/', data),
    update: (id: string, data: Partial<Lead>) =>
      api.put<Lead>(`/sales/leads/${id}/`, data),
    delete: (id: string) =>
      api.delete(`/sales/leads/${id}/`),
  },

  opportunities: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<Opportunity>>('/sales/opportunities/', { params }),
    create: (data: Partial<Opportunity>) =>
      api.post<Opportunity>('/sales/opportunities/', data),
    update: (id: string, data: Partial<Opportunity>) =>
      api.put<Opportunity>(`/sales/opportunities/${id}/`, data),
  },

  quotations: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<Quotation>>('/sales/quotations/', { params }),
    getById: (id: string) =>
      api.get<Quotation>(`/sales/quotations/${id}/`),
    create: (data: Partial<Quotation>) =>
      api.post<Quotation>('/sales/quotations/', data),
    update: (id: string, data: Partial<Quotation>) =>
      api.put<Quotation>(`/sales/quotations/${id}/`, data),
    send: (id: string) =>
      api.post<Quotation>(`/sales/quotations/${id}/send/`),
    accept: (id: string) =>
      api.post<Quotation>(`/sales/quotations/${id}/accept/`),
    reject: (id: string) =>
      api.post<Quotation>(`/sales/quotations/${id}/reject/`),
  },

  orders: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<SalesOrder>>('/sales/sales-orders/', { params }),
    getById: (id: string) =>
      api.get<SalesOrder>(`/sales/sales-orders/${id}/`),
    create: (data: Partial<SalesOrder>) =>
      api.post<SalesOrder>('/sales/sales-orders/', data),
    update: (id: string, data: Partial<SalesOrder>) =>
      api.put<SalesOrder>(`/sales/sales-orders/${id}/`, data),
    cancel: (id: string) =>
      api.post<SalesOrder>(`/sales/sales-orders/${id}/cancel/`),
  },

  returns: {
    get: (params?: PaginationParams) =>
      api.get<PaginatedResponse<SalesReturn>>('/sales/sales-returns/', { params }),
    create: (data: Partial<SalesReturn>) =>
      api.post<SalesReturn>('/sales/sales-returns/', data),
  },
};
