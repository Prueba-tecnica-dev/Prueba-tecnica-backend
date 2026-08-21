export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Purchase {
  id: string;
  userId: string;
  items: PurchaseItem[];
  total: number;
  status: 'completed';
  createdAt: string;
}
