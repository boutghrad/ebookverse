import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  discountPrice?: number;
  coverImage: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.bookId === item.bookId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.bookId === item.bookId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (bookId) => {
        set({ items: get().items.filter((i) => i.bookId !== bookId) });
      },
      updateQuantity: (bookId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.bookId !== bookId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.bookId === bookId ? { ...i, quantity } : i
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.discountPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'ebookverse-cart',
    }
  )
);

// Wishlist store
export interface WishlistItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  discountPrice?: number;
  coverImage: string;
  slug: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (bookId: string) => void;
  isInWishlist: (bookId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (!get().items.find((i) => i.bookId === item.bookId)) {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (bookId) => {
        set({ items: get().items.filter((i) => i.bookId !== bookId) });
      },
      isInWishlist: (bookId) => {
        return get().items.some((i) => i.bookId === bookId);
      },
    }),
    {
      name: 'ebookverse-wishlist',
    }
  )
);
