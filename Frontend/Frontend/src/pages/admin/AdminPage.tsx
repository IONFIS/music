import { useAuthStore } from "@/stores/useAuthStore"
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";


const AdminPage = () => {
  const {isAdmin,isLoading}=useAuthStore();
  if(!isLoading && !isAdmin) return<div> You are not authorized</div>
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-800 text-zinc-100 p-8">
      <Header/>
      <DashboardStats/>

    </div>
  )
}

export default AdminPage