import { api } from './api';
import type { StockMovement, CreateStockMovementDto } from '../types';

export const stockMovementsService = {
  async getAll(): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>('/stock-movements');
    return response.data;
  },

  async getByItem(itemId: number): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>(`/stock-movements/by-item/${itemId}`);
    return response.data;
  },

  async getMyMovements(): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>('/stock-movements/my-movements');
    return response.data;
  },

  async getStats(): Promise<any> {
    const response = await api.get('/stock-movements/stats');
    return response.data;
  },

  async create(data: CreateStockMovementDto): Promise<StockMovement> {
    const response = await api.post<StockMovement>('/stock-movements', data);
    return response.data;
  },
};