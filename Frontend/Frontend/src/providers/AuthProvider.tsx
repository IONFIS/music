
import React, { useEffect, useState } from 'react'
import{ Loader} from "lucide-react"
import { axiosInstance } from '@/lib/axios';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';

const updateApiToken = (token :String | null)=>{
    if(token )
        axiosInstance.defaults.headers.common['Authorization']=`Bearer${token}`
     else 
        delete axiosInstance.defaults.headers.common['Authorization']
    
};

const AuthProvider = ({children}:{children:React.ReactNode}) => {
    const {getToken,userId } =useAuth();
    const [loading, setLoading]= useState(true);
    const {checkAdminStatus,}=useAuthStore();
   const {initSocket,disconnectSocket}=useChatStore();
    useEffect(()=>{
        const initAuth = async () =>{
            try {
                const token = await getToken();
                updateApiToken(token);
                if(token){
                    await checkAdminStatus();
                    if(userId) initSocket(userId);

                }
                
            } catch (error) {
                updateApiToken(null);
                console.log("error in authProvider",error)
                
                
            } finally{
                setLoading(false);
            }
        }
        initAuth();
        return ()=>disconnectSocket();

    },[getToken,userId,checkAdminStatus,initSocket,disconnectSocket]);

    if(loading) return (
        <div className='h-screen w-full flex justify-center items-center'>
            <Loader className='size-16 text-emerald-600 animate-spin'/>
        </div>
    )
      
  return (
        <div>{children}</div>
  )
}

export default AuthProvider