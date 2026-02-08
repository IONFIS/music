import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {useState } from "react"
import { useUser } from "@clerk/clerk-react";
import { useChatStore } from "@/stores/useChatStore";
import { Send } from "lucide-react";

const MessageInput = () => {
    const [newMessage,setMessage]=useState("");
    const {user} = useUser();
    const {selectedUser,sendMessage} = useChatStore();
    const handleSend=()=>{
        if(!selectedUser || !user || !newMessage) return;
        sendMessage(selectedUser.clerkId,user.id,newMessage);
        setMessage("");
    }
  return (
    <div className=" p-4 mt-auto border-t border-zinc-800">
        <div className=" flex gap-2">
            <Input placeholder="Type a message" className="bg-zinc-500 border-none"
             onKeyDown={(e)=>e.key === "Enter" && handleSend()} value={newMessage} onChange={(e)=>setMessage(e.target.value)}/>
             <Button size={"icon"} onClick={handleSend} disabled={!newMessage.trim()} >
                <Send  className="size-4"/>

             </Button>

        </div>

    </div>
  )
}

export default MessageInput