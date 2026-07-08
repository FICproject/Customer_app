import { create } from 'zustand';

export interface WishlistItem {
  id: string;
  name: string;
  price: string;
  category: string;
  image?: string;
  spec?: string;
}

interface WishlistState {
  wishlistItems: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  wishlistItems: [],
  toggleWishlist: (item) => set((state) => {
    const exists = state.wishlistItems.some((i) => i.id === item.id);
    if (exists) {
      return { wishlistItems: state.wishlistItems.filter((i) => i.id !== item.id) };
    }
    return { wishlistItems: [...state.wishlistItems, item] };
  }),
  removeFromWishlist: (id) => set((state) => ({
    wishlistItems: state.wishlistItems.filter((i) => i.id !== id),
  })),
  clearWishlist: () => set({ wishlistItems: [] }),
}));
