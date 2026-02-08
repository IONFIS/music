import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";

const ChatHeader = () => {
    const { selectedUser, onlineUsers } = useChatStore();

    return (
        <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={selectedUser?.imageUrl ?? ""} />
                    <AvatarFallback className="text-sm">
                        {selectedUser?.fullName ? selectedUser.fullName[0] : "?"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-medium">
                        {selectedUser?.fullName ?? "Unknown User"}
                    </h2>
                    <p className="text-sm text-zinc-400">
                        {selectedUser?.clerkId && onlineUsers.has(selectedUser.clerkId) 
                            ? "Online Users" 
                            : "Offline Users"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
