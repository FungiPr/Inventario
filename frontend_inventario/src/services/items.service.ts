import { api } from './api';
import type { Item, CreateItemDto } from '../types';

export const itemsService = {
  async getAll(): Promise<Item[]> {
    const response = await api.get<Item[]>('/items');
    return response.data;
  },

  async getOne(id: number): Promise<Item> {
    const response = await api.get<Item>(`/items/${id}`);
    return response.data;
  },

  async getLowStock(): Promise<Item[]> {
    const response = await api.get<Item[]>('/items/low-stock');
    return response.data;
  },

  async getStats(): Promise<any> {
    const response = await api.get('/items/stats');
    return response.data;
  },

  async create(data: CreateItemDto): Promise<Item> {
    const response = await api.post<Item>('/items', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateItemDto>): Promise<Item> {
    const response = await api.patch<Item>(`/items/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/items/${id}`);
  },
};