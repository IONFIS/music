import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from "./App.tsx"
import {BrowserRouter} from "react-router-dom"
import {ClerkProvider} from "@clerk/clerk-react"
import AuthProvider from "./providers/AuthProvider.tsx";
import MusicPlayer from './pages/home/components/MusicPlayer.tsx'
  import { Toaster } from 'sonner';


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
   
   <AuthProvider>
   <BrowserRouter> 
   <App />
    <Toaster />
   
   
   </BrowserRouter>
   <MusicPlayer/>

   </AuthProvider>
    

    
    </ClerkProvider>
  </StrictMode>,
)
