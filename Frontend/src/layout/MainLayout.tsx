import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/Components/ui/resizable";
import { Outlet, useLocation } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import { useUIStore } from "@/stores/uiStore";

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const {
    mobileSidebarOpen,
    closeMobileSidebar,
    mobileFriendsActivityOpen,
    closeMobileFriendsActivity,
  } = useUIStore();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-close sidebars on route change for mobile
  useEffect(() => {
    if (isMobile) {
      closeMobileSidebar();
      closeMobileFriendsActivity();
    }
  }, [location.pathname, isMobile, closeMobileSidebar, closeMobileFriendsActivity]);

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {isMobile && <div className="h-0" />} {/* topbar covers this space */}

      <ResizablePanelGroup direction="horizontal" className="flex flex-1 h-full overflow-hidden p-2">
        {(!isMobile || mobileSidebarOpen) && (
          <>
            <ResizablePanel
              defaultSize={20}
              minSize={isMobile ? 0 : 10}
              maxSize={30}
              className={isMobile ? "absolute z-1 bg-zinc-900 h-full left-0 top-17 w-30 shadow-lg" : ""}
            >
              <div className="h-full">
                <LeftSidebar />
              </div>
            </ResizablePanel>
            {!isMobile && <ResizableHandle className="w-2 bg-black rounded-lg transition-colors" />}
          </>
        )}

        <ResizablePanel defaultSize={isMobile ? 100 : 60}>
          <Outlet />
        </ResizablePanel>

        {!isMobile && (
          <>
            <ResizableHandle className="w-2 bg-black rounded-lg transition-colors" />
            <ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
              <FriendsActivity />
            </ResizablePanel>
          </>
        )}

        {/* FriendsActivity mobile panel */}
        {isMobile && mobileFriendsActivityOpen && (
          <ResizablePanel
            defaultSize={70}
            minSize={0}
            maxSize={100}
            className="absolute z-1 bg-zinc-900 h-full right-0 top-18 w-70 shadow-lg"
          >
            <FriendsActivity />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default MainLayout;
