
import axios from "axios";

import {create} from "zustand";
interface useAuthStore {
    isAdmin: boolean,
    isLoading:boolean,
    error: string | null,

    checkAdminStatus:()=> Promise<void>;
    reset:()=> void;


}


export const useAuthStore = create<useAuthStore> ((set)=>({
    isAdmin:false,
    isLoading:false,
    error:null,

    checkAdminStatus: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/check`);
            console.log("API Response:", response.data); // Check what the API sends
            const isAdmin = response?.data?.admin;
            console.log("Setting isAdmin:", isAdmin); // Confirm what is being set
            set({ isAdmin: isAdmin ?? false });
            console.log("Updated Store:", useAuthStore.getState()); // Verify the store updates
        } catch (error: any) {
            console.error("Error fetching admin status:", error);
            set({ isAdmin: false, error: error?.response?.data?.message || "An error occurred" });
        } finally {
            set({ isLoading: false });
        }
    },
    
    
    reset:()=>{
        set({isAdmin:false,isLoading:false,error:null})
    }



}))