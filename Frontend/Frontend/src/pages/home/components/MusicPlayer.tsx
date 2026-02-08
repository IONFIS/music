import React, { useEffect, useRef, useState } from "react";
import { useMusicStore } from "@/stores/musicStore";
import { useUser } from "@clerk/clerk-react";
import { useChatStore } from "@/stores/useChatStore";

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

interface Song {
  name: string;
  artist: string;
  url: string;
  image?: string; // New image field
}

const MusicPlayer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = useMusicStore((state) => state.currentSong);
  const playNextSong = useMusicStore((state) => state.playNextSong);
  const playPreviousSong = useMusicStore((state) => state.playPreviousSong);
  const currentIndex = useMusicStore((state) => state.currentIndex);
  const queue = useMusicStore((state) => state.queue);

  const { user } = useUser();
  const socket = useChatStore.getState().socket;

  useEffect(() => {
    if (!socket || !user || !currentSong) return;
    const activity = `Playing ${currentSong.name} by ${currentSong.artist}`;
    socket.emit("update_activity", { userId: user.id, activity });
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current && currentSong?.url) {
      audioRef.current.src = currentSong.url;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Audio play error:", err));
    }
  }, [currentSong]);

  const handleNext = () => {
    if (currentIndex < queue.length - 1) playNextSong();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) playPreviousSong();
  };

  const handleSongEnd = () => {
    setIsPlaying(false);
    if (currentIndex < queue.length - 1) playNextSong();
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleDownload = async (song: Song) => {
    try {
      const response = await fetch(song.url);
      if (!response.ok) throw new Error("Failed to download song.");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${song.name}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <>
      {!isVisible && (
        <button
          className="fixed bottom-4 right-4 bg-[#ec4ffa] text-white p-3 rounded-full shadow-lg hover:bg-[#c33bd8] transition-transform transform hover:scale-110 z-50"
          onClick={() => setIsVisible(true)}
          aria-label="Open music player"
        >
          {isPlaying ? (
            <div className="flex gap-[2px] items-end">
              <span className="bg-white w-[2px] h-3 rounded-sm animate-pulse" />
              <span className="bg-white w-[2px] h-5 rounded-sm animate-[pulse_1s_ease-in-out_infinite]" />
              <span className="bg-white w-[2px] h-2 rounded-sm animate-pulse" />
            </div>
          ) : (
            "🎵"
          )}
        </button>
      )}

      <div
        className={`fixed bottom-0 right-0 sm:w-[80vw] w-full bg-black text-white p-4 flex flex-col sm:flex-row gap-4 justify-between items-center transition-transform duration-800 ease-in-out z-40 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {currentSong ? (
          <div className="flex flex-row sm:flex-row items-center gap-4 flex-1">
            {currentSong.image && (
              <img
                src={currentSong.image}
                alt="Album Art"
                className="w-20 h-20 rounded-md object-cover shadow-md"
              />
            )}
            <div className="w-full">
              <h3 className="text-lg font-bold">{currentSong.name}</h3>
              <p className="text-sm text-gray-400">{currentSong.artist}</p>
              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleSongEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 accent-white"
                />
                <span className="text-xs">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="flex-1">No song playing</p>
        )}

        <div className="flex gap-4 flex-wrap justify-center sm:justify-start items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            className={`p-2 rounded-md ${
              currentIndex > 0
                ? "bg-white text-black hover:bg-[#ec4ffa]"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            aria-label="Previous song"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handlePlayPause}
            className="p-2 rounded-md bg-white text-black hover:bg-[#ec4ffa]"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-6.518-3.75A1 1 0 007 8.168v7.664a1 1 0 001.234.97l6.518-3.75a1 1 0 000-1.716z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex >= queue.length - 1}
            className={`p-2 rounded-md ${
              currentIndex < queue.length - 1
                ? "bg-white text-black hover:bg-[#ec4ffa]"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            aria-label="Next song"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {currentSong?.url && (
            <button
              onClick={() => handleDownload(currentSong)}
              className="p-2 rounded-md bg-white text-black hover:bg-green-800"
              aria-label="Download song"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
            </button>
          )}

          <button
            onClick={() => setIsVisible(false)}
            className="p-2 rounded-md bg-white text-black hover:bg-red-200"
            aria-label="Close music player"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;



// import { useMusicStore } from "@/stores/musicStore";
// import { useEffect, useRef } from "react"

// const MusicPlayer = () => {
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const prevSongRef = useRef<string | null>(null);
//   const {currentSong, isPlaying,playNext}= useMusicStore();

//   useEffect(()=>{
//     if(isPlaying)audioRef.current?.play();
//     else audioRef.current?.pause();

//   },[isPlaying])

//   useEffect(()=>{
//     const audio = audioRef.current;
//     const handleEnded=()=>{
//       playNext()
//     }
//     audio?.addEventListener("ended",handleEnded)
//   },[playNext])

//   useEffect(()=>{
//     if(!audioRef.current || !currentSong)return;
//     const audio= audioRef.current;
//     const isSongChange = prevSongRef.current !== currentSong?.url;
//     if(isSongChange){
//       audio.src = currentSong?.url;
//       audio.currentTime=0;
//       prevSongRef.current = currentSong?.url;
//       if(isPlaying) audio.play();
//     }
//   },[currentSong,isPlaying])

  
//   return<audio ref={audioRef} />;
// }

// export default MusicPlayer