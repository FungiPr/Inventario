// Usuario
export interface User {
  id: number;
  email: string;
  displayName: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Respuesta de login/register
export interface AuthResponse {
  user: User;
  access_token: string;
}

// Categoría
export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// Item/Producto
export interface Item {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  currentStock: number;
  minStock: number;
  price: number | null;
  categoryId: number | null;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

// Movimiento de stock
export interface StockMovement {
  id: number;
  itemId: number;
  userId: number | null;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string | null;
  createdAt: string;
  item?: {
    id: number;
    name: string;
    sku: string | null;
  };
  user?: {
    id: number;
    displayName: string | null;
    email: string;
  };
}

// DTOs para crear/actualizar
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface CreateItemDto {
  name: string;
  description?: string;
  sku?: string;
  currentStock?: number;
  minStock?: number;
  price?: number;
  categoryId?: number;
}

export interface CreateStockMovementDto {
  itemId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reason?: string;
}