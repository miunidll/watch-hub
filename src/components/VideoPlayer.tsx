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

    console.log('🔧 VideoPlayer: Initializing event listeners for new episode');

    let isActive = true;
    let listenersAttached = false;
    const cleanupFns: (() => void)[] = [];

    const attachListeners = () => {
      if (!isActive) {
        console.log('⚠️ Effect already cleaned up, aborting attach');
        return false;
      }

      const player = playerRef.current?.plyr;
      
      if (!player) {
        console.log('❌ No player found');
        return false;
      }

      if (listenersAttached) {
        console.log('⚠️ Listeners already attached to this player instance');
        return true;
      }

      console.log('✅ Attaching fresh event listeners');

      let lastSaveTime = 0;
      const SAVE_INTERVAL = 3000;

      const handleTimeUpdate = () => {
        if (!isActive) return;
        const currentTime = player.currentTime;
        const now = Date.now();
        
        if (currentTime && now - lastSaveTime >= SAVE_INTERVAL) {
          lastSaveTime = now;
          console.log('📹 Auto-save at:', currentTime.toFixed(2));
          onTimeUpdate(currentTime);
        }
      };

      const handlePause = () => {
        if (!isActive) return;
        console.log('⏸️ PAUSE - immediate save');
        const currentTime = player.currentTime;
        if (currentTime) {
          onTimeUpdate(currentTime);
        }
      };

      const handleEnded = () => {
        if (!isActive) return;
        console.log('🏁 ENDED - final save');
        const currentTime = player.currentTime;
        if (currentTime) {
          onTimeUpdate(currentTime);
        }
      };

      // Remove any old listeners first
      player.off('timeupdate');
      player.off('pause');
      player.off('ended');

      // Attach new listeners
      player.on('timeupdate', handleTimeUpdate);
      player.on('pause', handlePause);
      player.on('ended', handleEnded);
      
      listenersAttached = true;
      console.log('✅ Event listeners attached successfully');

      // Store cleanup
      cleanupFns.push(() => {
        console.log('🧹 Removing event listeners');
        player.off('timeupdate', handleTimeUpdate);
        player.off('pause', handlePause);
        player.off('ended', handleEnded);
      });

      return true;
    };

    // Immediate attempt
    const immediateSuccess = attachListeners();
    
    if (!immediateSuccess) {
      console.log('⏳ Waiting for player to be ready...');
      
      // Wait for ready event
      const player = playerRef.current?.plyr;
      if (player) {
        const readyHandler = () => {
          console.log('🎬 Player ready event fired');
          attachListeners();
        };
        
        player.once('ready', readyHandler);
        cleanupFns.push(() => player.off('ready', readyHandler));
      }
      
      // Backup retry attempts
      const retry1 = setTimeout(() => {
        if (!listenersAttached) {
          console.log('⏳ Retry attempt 1...');
          attachListeners();
        }
      }, 300);
      
      const retry2 = setTimeout(() => {
        if (!listenersAttached) {
          console.log('⏳ Retry attempt 2...');
          attachListeners();
        }
      }, 700);
      
      cleanupFns.push(() => {
        clearTimeout(retry1);
        clearTimeout(retry2);
      });
    }

    return () => {
      console.log('🧹 Cleaning up VideoPlayer effect');
      isActive = false;
      listenersAttached = false;
      cleanupFns.forEach(fn => fn());
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
