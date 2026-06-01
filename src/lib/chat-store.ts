import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setIsOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isOpen: false,
      isLoading: false,
      addMessage: (role, content) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              role,
              content,
              timestamp: Date.now(),
            },
          ],
        })),
      setIsOpen: (open) => set({ isOpen: open }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'ebookverse-chat',
      partialize: (state) => ({ messages: state.messages.slice(-20) }),
    }
  )
);
