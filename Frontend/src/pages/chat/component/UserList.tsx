import UsersListSkeleton from "@/Components/Skeleton/UsersSkeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect } from "react";

const UserList = () => {
  const { users, isLoading, fetchUsers, setSelectedUser } = useChatStore();

  // Fetch users when the component mounts
  useEffect(() => {
    if (users.length === 0) {
      console.log("📢 Fetching users because users list is empty");
      fetchUsers();
    }
  }, [users.length, fetchUsers]); // Ensure it runs when the component mounts

  console.log("Fetched Users:", users);

  // Check if 'users' is an array before calling map
  if (!Array.isArray(users)) {
    return <div>Error: Users is not an array</div>; // You can return a fallback UI here
  }

  return (
    <div className="border-r border-zinc-800">
      <div className="flex flex-col h-full">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div>
            {isLoading ? (
              <UsersListSkeleton />
            ) : users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center justify-center p-3 gap-3 rounded-lg cursor-pointer"
                >
                  <div className="relative">
                    <Avatar className="size-8 md:size-12">
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback className="text-sm">
                        {user.fullName ? user.fullName[0] : "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0 lg:block hidden">
                    <span className="font-medium truncate">{user.fullName || "Unknown User"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-zinc-400">No users found</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default UserList;
