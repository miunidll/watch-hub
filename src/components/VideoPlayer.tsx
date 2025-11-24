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

    console.log('🔧 VideoPlayer: Initializing event listeners');

    let attached = false;
    let cleanupFunctions: (() => void)[] = [];

    const attachListeners = () => {
      const player = playerRef.current?.plyr;
      
      if (!player) {
        console.log('❌ No player found, will retry...');
        return false;
      }

      if (attached) {
        console.log('⚠️ Listeners already attached, skipping');
        return true;
      }

      console.log('✅ Player ready, attaching event listeners');

      let lastSaveTime = 0;
      const SAVE_INTERVAL = 3000;

      const handleTimeUpdate = () => {
        const currentTime = player.currentTime;
        const now = Date.now();
        
        if (currentTime && now - lastSaveTime >= SAVE_INTERVAL) {
          lastSaveTime = now;
          console.log('📹 Auto-save at:', currentTime.toFixed(2));
          onTimeUpdate(currentTime);
        }
      };

      const handlePause = () => {
        console.log('⏸️ PAUSE - immediate save');
        const currentTime = player.currentTime;
        if (currentTime) {
          onTimeUpdate(currentTime);
        }
      };

      const handleEnded = () => {
        console.log('🏁 ENDED - final save');
        const currentTime = player.currentTime;
        if (currentTime) {
          onTimeUpdate(currentTime);
        }
      };

      // Attach listeners
      player.on('timeupdate', handleTimeUpdate);
      player.on('pause', handlePause);
      player.on('ended', handleEnded);
      
      attached = true;
      console.log('✅ Event listeners successfully attached');

      // Store cleanup function
      cleanupFunctions.push(() => {
        console.log('🧹 Removing event listeners');
        player.off('timeupdate', handleTimeUpdate);
        player.off('pause', handlePause);
        player.off('ended', handleEnded);
        attached = false;
      });

      return true;
    };

    // Try multiple times with increasing delays
    const attempts = [
      setTimeout(() => {
        if (!attachListeners()) {
          console.log('⏳ First attempt failed, waiting for ready event...');
          const player = playerRef.current?.plyr;
          if (player) {
            player.on('ready', attachListeners);
            cleanupFunctions.push(() => player.off('ready', attachListeners));
          }
        }
      }, 50),
      setTimeout(attachListeners, 200),
      setTimeout(attachListeners, 500)
    ];

    return () => {
      console.log('🧹 VideoPlayer cleanup');
      attempts.forEach(clearTimeout);
      cleanupFunctions.forEach(cleanup => cleanup());
      attached = false;
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
