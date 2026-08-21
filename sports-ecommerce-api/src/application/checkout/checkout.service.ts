import { CartItem } from '../../domain/entities/cart.entity';
import { Product } from '../../domain/entities/product.entity';

export interface CheckoutValidationResult {
  total: number;
  items: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }>;
}

export class CheckoutService {
  validateCart(cart: CartItem[], catalog: Product[]): CheckoutValidationResult {
    const items = cart.map((item) => {
      const product = catalog.find((entry) => entry.id === item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.productId}`);
      }

      if (item.quantity > product.stock) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: product.price * item.quantity,
      };
    });

    return {
      total: items.reduce((sum, item) => sum + item.subtotal, 0),
      items,
    };
  }
}
