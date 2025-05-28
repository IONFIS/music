import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";
import { useMusicStore } from "@/stores/musicStore";
import { useUser } from "@clerk/clerk-react";
import { Music, Users, HeadphonesIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ActivityData {
  id: string;
  name: string;
  artist: string;
  url: string;
  image: string;
  timestamp: number;
}

const FriendsActivity = () => {
  const { user } = useUser();
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
const isAdmin = user?.primaryEmailAddress?.emailAddress === adminEmail;


  const [activities, setUserActivities] = useState<Record<string, ActivityData | "Idle">>({});
  const socket = useChatStore.getState().socket;
  const { users, fetchUsers } = useChatStore();
  const playSong = useMusicStore((state) => state.playSong);

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
  }, [users.length, fetchUsers]);

  useEffect(() => {
    if (!socket) return;

    const handleActivityUpdate = (data: { userId: string; activity: ActivityData }) => {
      if (!data?.userId || !data?.activity) return;
      setUserActivities((prev) => ({
        ...prev,
        [data.userId]: data.activity,
      }));
    };

    const handleListenAlong = ({
      song,
      startAt,
    }: {
      song: ActivityData;
      startAt: number;
    }) => {
      const delay = Math.max(startAt - Date.now(), 0);
      setTimeout(() => playSong(song), delay);
    };

    socket.on("activity_updated", handleActivityUpdate);
    socket.on("listen_along", handleListenAlong);

    return () => {
      socket.off("activity_updated", handleActivityUpdate);
      socket.off("listen_along", handleListenAlong);
    };
  }, [socket, playSong]);

  const handleListenAlong = (activity: ActivityData) => {
    if (!socket) return;

    const songWithId = {
      ...activity,
      id: activity.id || `sync-${Date.now()}`,
    };

    const startAt = Date.now() + 500;
    socket.emit("listen_along", { song: songWithId, startAt });

    setTimeout(() => playSong(songWithId), 500);
  };

  const friends = Array.isArray(users) ? users : [];

  if (friends.length === 0) {
    return <div className="text-white p-4">No friends found.</div>;
  }

  return (
    <div className="h-full bg-zinc-900 rounded-lg flex flex-col">
      <div className="p-4 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Users className="size-5 shrink-0" />
          <h2 className="font-semibold text-white">What they're listening to</h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {friends.map((friend) => {
            const friendId = String(friend.clerkId).trim();
            const activity = activities[friendId];
            const isIdle = !activity || activity === "Idle";
            const canListen = typeof activity === "object";

            return (
              <div
                key={friendId}
                className="cursor-pointer hover:bg-zinc-800/50 p-3 rounded-md transition-colors flex items-center gap-3"
              >
                <Avatar className="size-10 border border-zinc-800">
                  <AvatarImage src={friend.imageUrl} alt={friend.fullName} />
                  <AvatarFallback>{friend.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-base">{friend.fullName}</span>
                    {!isIdle && <Music className="size-4 text-emerald-400 shrink-0" />}
                  </div>
                  <div className="mt-1 text-sm text-white font-medium truncate">
                    {!isIdle && typeof activity === "object"
                      ? `🎵 ${activity.name} - ${activity.artist}`
                      : "Idle"}
                  </div>
                </div>

                {canListen && isAdmin && (
                  <button
                    onClick={() => handleListenAlong(activity)}
                    className=" hover:bg-emerald-700 text-white text-xs px-3 py-1 rounded"
                  ><svg
  className="h-6 w-6"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={2}
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect x="4" y="10" width="3" height="4" rx="1.5" fill="currentColor">
    <animate attributeName="height" values="4;16;4" dur="1s" repeatCount="indefinite" />
    <animate attributeName="y" values="10;4;10" dur="1s" repeatCount="indefinite" />
  </rect>
  <rect x="10.5" y="10" width="3" height="4" rx="1.5" fill="currentColor">
    <animate attributeName="height" values="16;4;16" dur="1s" repeatCount="indefinite" begin="0.2s" />
    <animate attributeName="y" values="4;10;4" dur="1s" repeatCount="indefinite" begin="0.2s" />
  </rect>
  <rect x="17" y="10" width="3" height="4" rx="1.5" fill="currentColor">
    <animate attributeName="height" values="10;16;10" dur="1s" repeatCount="indefinite" begin="0.4s" />
    <animate attributeName="y" values="7;4;7" dur="1s" repeatCount="indefinite" begin="0.4s" />
  </rect>
</svg>

                    
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FriendsActivity;

export const LoginPrompt = () => (
  <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
    <div className="relative">
      <div
        className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full blur-lg opacity-75 animate-pulse"
        aria-hidden="true"
      />
      <div className="relative bg-zinc-900 rounded-full p-4">
        <HeadphonesIcon className="size-8 text-emerald-400" />
      </div>
    </div>

    <div className="space-y-2 max-w-[250px]">
      <h3 className="text-lg font-semibold text-white">See What Friends Are Playing</h3>
      <p className="text-sm text-zinc-400">
        Login to discover what music your friends are enjoying right now
      </p>
    </div>
  </div>
);
