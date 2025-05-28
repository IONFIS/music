import { create } from "zustand";
import { useChatStore } from "./useChatStore";

interface Song {
  id: string;
  name: string;
  url: string;
  artist: string;
  image: string;
}

interface MusicStore {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  fetchedSongs: Record<string, Song[]>;
  setSongs: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  cacheSongs: (query: string, songs: Song[]) => void;
  getSongs: (query: string) => Song[] | null;
  playSong: (song: Song) => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
  setQueue: (songs: Song[]) => void;
  initListenAlong: () => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  currentSong: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  fetchedSongs: {},

  setSongs: (songs) => set({ queue: songs }),
  setQueue: (songs) => set({ queue: songs }),
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),

  cacheSongs: (query, songs) =>
    set((state) => ({
      fetchedSongs: { ...state.fetchedSongs, [query]: songs },
    })),

  getSongs: (query) => get().fetchedSongs[query] || null,

  playSong: (song) => {
    const { queue } = get();
    let index = queue.findIndex((s) => s.id === song.id);
    let updatedQueue = [...queue];

    if (index === -1) {
      updatedQueue.push(song);
      index = updatedQueue.length - 1;
    }

    set({
      queue: updatedQueue,
      currentSong: song,
      currentIndex: index,
      isPlaying: true,
    });

    const socket = useChatStore.getState().socket;
    if (socket && socket.auth?.userId) {
      socket.emit("activity_updated", {
        userId: socket.auth.userId,
        activity: {
          name: song.name,
          artist: song.artist || "Unknown",
          url: song.url,
          image: song.image,
          timestamp: Date.now(),
        },
      });
    }
  },

  playNextSong: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSong = queue[nextIndex];

      set({
        currentSong: nextSong,
        currentIndex: nextIndex,
        isPlaying: true,
      });

      const socket = useChatStore.getState().socket;
      if (socket && socket.auth?.userId) {
        socket.emit("activity_updated", {
          userId: socket.auth.userId,
          activity: {
            name: nextSong.name,
            artist: nextSong.artist || "Unknown",
            url: nextSong.url,
            image: nextSong.image,
            timestamp: Date.now(),
          },
        });
      }
    }
  },

  playPreviousSong: () => {
    const { queue, currentIndex } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevSong = queue[prevIndex];

      set({
        currentSong: prevSong,
        currentIndex: prevIndex,
        isPlaying: true,
      });

      const socket = useChatStore.getState().socket;
      if (socket && socket.auth?.userId) {
        socket.emit("activity_updated", {
          userId: socket.auth.userId,
          activity: {
            name: prevSong.name,
            artist: prevSong.artist || "Unknown",
            url: prevSong.url,
            image: prevSong.image,
            timestamp: Date.now(),
          },
        });
      }
    }
  },

  initListenAlong: () => {
    const socket = useChatStore.getState().socket;

    if (!socket) {
      console.warn("⚠️ Socket not available yet for listen_along.");
      return;
    }

    socket.off("listen_along"); // Prevent multiple bindings
    socket.on("listen_along", ({ song, startAt }: { song: Song; startAt: number }) => {
      const delay = startAt - Date.now();
      const songWithId = {
        ...song,
        id: song.id || `sync-${Date.now()}`,
      };

      if (delay > 0) {
        setTimeout(() => get().playSong(songWithId), delay);
      } else {
        get().playSong(songWithId);
      }
    });
  },
}));
