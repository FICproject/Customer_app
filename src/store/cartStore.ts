import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  category: string;
  quantity: number;
  image?: string;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItems: [],
  addToCart: (item) => set((state) => {
    const existing = state.cartItems.find((i) => i.id === item.id);
    const qtyToAdd = item.quantity && item.quantity > 0 ? item.quantity : 1;
    if (existing) {
      return {
        cartItems: state.cartItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qtyToAdd } : i
        ),
      };
    }
    return { cartItems: [...state.cartItems, { ...item, quantity: qtyToAdd }] };
  }),
  updateQuantity: (id, quantity) => set((state) => {
    if (quantity <= 0) {
      return { cartItems: state.cartItems.filter((i) => i.id !== id) };
    }
    return {
      cartItems: state.cartItems.map((i) =>
        i.id === id ? { ...i, quantity } : i
      ),
    };
  }),
  removeFromCart: (id) => set((state) => ({
    cartItems: state.cartItems.filter((i) => i.id !== id),
  })),
  clearCart: () => set({ cartItems: [] }),
}));
