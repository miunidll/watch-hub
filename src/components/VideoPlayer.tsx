import { useRef, useEffect } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

interface VideoPlayerProps {
  url: string;
  title: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
}

const VideoPlayer = ({ url, title, initialTime = 0, onTimeUpdate }: VideoPlayerProps) => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (initialTime <= 0) return;

    console.log('⏱️ Setting initial time to:', initialTime);

    let timeSet = false;

    const setInitialTimestamp = () => {
      const player = playerRef.current?.plyr;
      if (!player || timeSet) return;

      const setTime = () => {
        if (timeSet) return;
        
        try {
          player.currentTime = initialTime;
          timeSet = true;
          console.log('✅ Initial time set to:', initialTime);
        } catch (error) {
          console.error('❌ Error setting initial time:', error);
        }
      };

      // Try setting time on these events (only once each)
      const readyHandler = () => {
        setTime();
        player.off('ready', readyHandler);
      };
      
      const metadataHandler = () => {
        setTime();
        player.off('loadedmetadata', metadataHandler);
      };
      
      const canplayHandler = () => {
        setTime();
        player.off('canplay', canplayHandler);
      };

      player.on('ready', readyHandler);
      player.on('loadedmetadata', metadataHandler);
      player.on('canplay', canplayHandler);

      // Fallback timeouts
      setTimeout(setTime, 500);
      setTimeout(setTime, 1500);
    };

    const timer = setTimeout(setInitialTimestamp, 100);

    return () => {
      clearTimeout(timer);
      timeSet = true; // Prevent any pending callbacks
    };
  }, [initialTime]);

  useEffect(() => {
    if (!onTimeUpdate) return;

    console.log('🔧 VideoPlayer effect running...');

    const timer = setTimeout(() => {
      const player = playerRef.current?.plyr;
      
      if (!player) {
        console.log('❌ No player found!');
        return;
      }

      console.log('✅ Player found, setting up events...');

      let lastSaveTime = 0;
      const SAVE_INTERVAL = 3000; // Save at most every 3 seconds during playback

      const handleTimeUpdate = () => {
        const currentTime = player.currentTime;
        const now = Date.now();
        
        // Debounce saves during playback
        if (currentTime && now - lastSaveTime >= SAVE_INTERVAL) {
          lastSaveTime = now;
          onTimeUpdate(currentTime);
        }
      };

      const handlePause = () => {
        console.log('⏸️ PAUSE EVENT FIRED!');
        const currentTime = player.currentTime;
        console.log('⏸️ Current time on pause:', currentTime);
        if (currentTime) {
          // Always save on pause, ignore debounce
          onTimeUpdate(currentTime);
        }
      };

      const handleEnded = () => {
        console.log('🏁 ENDED EVENT FIRED!');
        const currentTime = player.currentTime;
        if (currentTime) {
          // Always save on end, ignore debounce
          onTimeUpdate(currentTime);
        }
      };

      // Use Plyr's event system
      player.on('timeupdate', handleTimeUpdate);
      player.on('pause', handlePause);
      player.on('ended', handleEnded);

      console.log('✅ All event listeners attached successfully');

      return () => {
        console.log('🧹 Cleaning up event listeners');
        player.off('timeupdate', handleTimeUpdate);
        player.off('pause', handlePause);
        player.off('ended', handleEnded);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [onTimeUpdate]);

  return (
    <div className="w-full rounded-lg overflow-hidden bg-black">
      <Plyr
        ref={playerRef}
        source={{
          type: 'video',
          title: title,
          sources: [
            {
              src: url,
              type: 'video/mp4',
            },
          ],
        }}
        options={{
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'settings',
            'fullscreen',
          ],
        }}
      />
    </div>
  );
};

export default VideoPlayer;
