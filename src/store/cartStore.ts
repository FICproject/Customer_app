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
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItems: [],
  addToCart: (item) => set((state) => {
    const existing = state.cartItems.find((i) => i.id === item.id);
    if (existing) {
      return { cartItems: state.cartItems };
    }
    return { cartItems: [...state.cartItems, { ...item, quantity: 1 }] };
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
