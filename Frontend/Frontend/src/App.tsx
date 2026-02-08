import { } from 'react';
import { AuthenticateWithRedirectCallback, } from "@clerk/clerk-react";
import './App.css'

import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import AuthCallbackPage from "./pages/auth-callback/authCallbackPage";



import MainLayout from './layout/MainLayout';
import ChatPage from './pages/chat/ChatPage';
import AlbumPage from './pages/album/AlbumPage';

import AdminPage from './pages/admin/AdminPage';
import SearchResultsPage from './pages/Search';



function App() {
  

 
 
  return (
    <>
    <div>
   



   
      
   
    
    <Routes>
      
      <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback
      signUpForceRedirectUrl={"/auth-callback"}/>}/>
      <Route path="/auth-Callback" element={<AuthCallbackPage/>}/>
      <Route path="/admin" element={<AdminPage/>}/>

      
      <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage/>}/>
        <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/chat" element={<ChatPage/>}/>
      <Route path="/album/:albumId" element={<AlbumPage/>}/>
      <Route path="*" element={<HomePage/>}/>
      </Route>
    </Routes>
   
    
     
     
    </div>
    </>
  )
}

export default App
