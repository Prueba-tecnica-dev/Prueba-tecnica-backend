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
