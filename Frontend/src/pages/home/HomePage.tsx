import Topbar from "@/Components/ui/Topbar";
import FeaturedSong from "./components/FeaturedSong";
import OldSong from "./components/OldSong";

import { ScrollArea, Scrollbar } from "@radix-ui/react-scroll-area";
import QuickPicks from "./components/Quickplay";
import BhaktiSongs from "./components/BhaktiSongs";
import NewSong from "./components/NewSong";
import HindiSong from "./components/HindiSong";
import EnglishSong from "./components/EnglishSong";
import Remix from "./components/Remix";

const HomePage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Topbar />
      <ScrollArea className="flex-1 overflow-y-auto scrollbar-hide">
  <div className="p-4 space-y-4">
    
    <FeaturedSong title="Featured Song" query="punjabi" />
    <QuickPicks title="Quick Picks" query="hitsong"   />
    <OldSong title="Old Songs" query="old" />
    <BhaktiSongs  title="Bhakti Songs" query="bhakti"/>
    <NewSong title="New Songs" query="new songs" />
    <HindiSong title="Romantic Songs" query="romantic" />
    <EnglishSong title="English Songs" query="english" />
    <Remix title="Remix songs" query="Remixhindi" />
  </div>
  <Scrollbar orientation="vertical" className="hidden" />
</ScrollArea>

   
    </div>
  );
};

export default HomePage;
