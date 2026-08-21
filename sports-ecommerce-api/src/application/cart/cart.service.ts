import { CartItem } from '../../domain/entities/cart.entity';
import { Product } from '../../domain/entities/product.entity';

export class CartService {
  addItem(cart: CartItem[], product: Product, quantity: number): CartItem[] {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const existing = cart.find((item) => item.productId === product.id);

    if (existing) {
      return cart.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + safeQuantity }
          : item,
      );
    }

    return [...cart, { productId: product.id, quantity: safeQuantity }];
  }

  removeItem(cart: CartItem[], productId: string): CartItem[] {
    return cart.filter((item) => item.productId !== productId);
  }

  updateQuantity(cart: CartItem[], productId: string, quantity: number): CartItem[] {
    if (quantity <= 0) {
      return this.removeItem(cart, productId);
    }

    return cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    );
  }

  getTotal(cart: CartItem[], catalog: Product[] = []): number {
    if (!cart.length) {
      return 0;
    }

    return cart.reduce((sum, item) => {
      const product = catalog.find((entry) => entry.id === item.productId);
      if (!product) {
        return sum;
      }

      return sum + product.price * item.quantity;
    }, 0);
  }
}
