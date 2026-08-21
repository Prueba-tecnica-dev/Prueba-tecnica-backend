const test = require('node:test');
const assert = require('node:assert/strict');

const { CartService } = require('../src/application/cart/cart.service');
const { CheckoutService } = require('../src/application/checkout/checkout.service');

const products = [
  {
    id: 'p1',
    name: 'Running Shoe',
    category: 'running',
    price: 120,
    stock: 2,
    imageUrl: 'https://images.example.com/shoe.png',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Gym Bottle',
    category: 'fitness',
    price: 20,
    stock: 5,
    imageUrl: 'https://images.example.com/bottle.png',
    createdAt: new Date().toISOString(),
  },
];

const cartService = new CartService();
const checkoutService = new CheckoutService();

test('add item to cart and compute total', () => {
  const cart = [];
  const updated = cartService.addItem(cart, products[0], 1);

  assert.equal(updated.length, 1);
  assert.equal(updated[0].quantity, 1);
  assert.equal(cartService.getTotal(updated, products), 120);
});

test('checkout validates stock and returns total', () => {
  const cart = [
    { productId: 'p1', quantity: 3 },
  ];

  assert.throws(
    () => checkoutService.validateCart(cart, products),
    /stock/i,
  );

  const validCart = [
    { productId: 'p2', quantity: 2 },
  ];

  const result = checkoutService.validateCart(validCart, products);
  assert.equal(result.total, 40);
  assert.equal(result.items.length, 1);
});
