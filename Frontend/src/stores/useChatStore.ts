import { create } from "zustand";
import { io } from "socket.io-client";
import axios from "axios";
import { useMusicStore } from "./musicStore";  // <-- import music store

// Interface Definitions
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  _id: string;
  clerkId: string;
  fullName: string;
  imageUrl: string;
}

interface Song {
  id: string;
  name: string;
  url: string;
  artist: string;
  image: string;
}

interface ChatStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  socket: any;
  isConnected: boolean;
  onlineUsers: Set<string>;
  userActivities: Map<string, string>;
  messages: Message[];
  selectedUser: User | null;

  fetchUsers: () => Promise<void>;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
  sendMessage: (receiverId: string, senderId: string, content: string) => void;
  fetchMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  initializeUsers: () => Promise<void>;
}


const socket = io(import.meta.env.VITE_API_BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});

// Utility function to update messages in state & localStorage
const updateMessages = (set: any, newMessages: Message[]) => {
  localStorage.setItem("chat_messages", JSON.stringify(newMessages));
  set({ messages: newMessages });
};

export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  socket: socket,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: JSON.parse(localStorage.getItem("chat_messages") || "[]"),
  selectedUser: null,

  setSelectedUser: (user) => set({ selectedUser: user }),

  fetchUsers: async () => {
    console.log("🚀 Fetching users...");
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users`);
      console.log("✅ Users fetched:", response.data);
      set({ users: response.data });
      localStorage.setItem("users", JSON.stringify(response.data));
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    }
  },

  initSocket: (userId) => {
    if (!get().isConnected) {
      socket.auth = { userId };
      socket.connect();
      socket.emit("user_connected", userId);

      socket.on("users_online", (users: string[]) => {
        set({ onlineUsers: new Set(users) });
      });

      socket.on("activities", (activities: [string, string][]) => {
        set({ userActivities: new Map(activities) });
      });

      socket.on("user_connected", (userId: string) => {
        set((state) => ({ onlineUsers: new Set([...state.onlineUsers, userId]) }));
      });

      socket.on("user_disconnected", (userId: string) => {
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(userId);
          return { onlineUsers: newOnlineUsers };
        });
      });

      socket.on("receive_message", (message: Message) => {
        set((state) => {
          const updatedMessages = [...state.messages, message];
          updateMessages(set, updatedMessages);
          return { messages: updatedMessages };
        });
      });

      socket.on("message_sent", (message: Message) => {
        set((state) => {
          const updatedMessages = [...state.messages, message];
          updateMessages(set, updatedMessages);
          return { messages: updatedMessages };
        });
      });

      socket.on("activity_updated", ({ userId, activity }) => {
        set((state) => {
          const newActivities = new Map(state.userActivities);
          newActivities.set(userId, activity);
          return { userActivities: newActivities };
        });
      });

      // <-- Listen Along: trigger music playback via music store
      socket.on("listen_along", ({ song, startAt }: { song: Song; startAt: number }) => {
        console.log("🔊 Listen along event received:", song, startAt);
        const delay = startAt - Date.now();
        if (delay > 0) {
          setTimeout(() => {
            useMusicStore.getState().playSong(song);
          }, delay);
        } else {
          useMusicStore.getState().playSong(song);
        }
      });

      set({ isConnected: true });
    }
  },

  disconnectSocket: () => {
    if (get().isConnected) {
      socket.disconnect();
      set({ isConnected: false });
    }
  },

  sendMessage: async (receiverId, senderId, content) => {
    const socket = get().socket;
    if (!socket) return;

    const message: Message = {
      id: Math.random().toString(36).substring(7),
      senderId,
      receiverId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => {
      const updatedMessages = [...state.messages, message];
      updateMessages(set, updatedMessages);
      return { messages: updatedMessages };
    });

    socket.emit("send_message", { receiverId, senderId, content });
  },

  fetchMessages: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/messages/${userId}`);
      const messages = response.data;
      updateMessages(set, messages);
      set({ messages });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch messages" });
    } finally {
      set({ isLoading: false });
    }
  },

  initializeUsers: async () => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      set({ users: JSON.parse(storedUsers) });
    } else {
      await get().fetchUsers();
    }
  },
}));

// Initialize users on store creation
useChatStore.getState().initializeUsers();
