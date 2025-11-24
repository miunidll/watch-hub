import { useRef, useEffect } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

interface VideoPlayerProps {
  url: string;
  title: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

const VideoPlayer = ({ url, title, initialTime = 0, onTimeUpdate, onEnded }: VideoPlayerProps) => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (initialTime <= 0) return;

    let timeSet = false;

    const setInitialTimestamp = () => {
      const player = playerRef.current?.plyr;
      if (!player || timeSet) return;

      const setTime = () => {
        if (timeSet) return;
        
        try {
          player.currentTime = initialTime;
          timeSet = true;
        } catch (error) {
          // Silently fail
        }
      };

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

      setTimeout(setTime, 500);
      setTimeout(setTime, 1500);
    };

    const timer = setTimeout(setInitialTimestamp, 100);

    return () => {
      clearTimeout(timer);
      timeSet = true;
    };
  }, [initialTime]);

  useEffect(() => {
    if (!onTimeUpdate) return;

    let isActive = true;
    let listenersAttached = false;
    const cleanupFns: (() => void)[] = [];

    const attachListeners = () => {
      if (!isActive) return false;

      const player = playerRef.current?.plyr;
      
      if (!player) return false;

      if (typeof player.on !== 'function' || typeof player.off !== 'function') {
        return false;
      }

      if (listenersAttached) return true;

      let lastSaveTime = 0;
      const SAVE_INTERVAL = 3000;

      const handleTimeUpdate = () => {
        if (!isActive) return;
        const currentTime = player.currentTime;
        const now = Date.now();
        
        if (currentTime && now - lastSaveTime >= SAVE_INTERVAL) {
          lastSaveTime = now;
          onTimeUpdate(currentTime);
        }
      };

      const handlePause = () => {
        if (!isActive) return;
        const currentTime = player.currentTime;
        if (currentTime) {
          onTimeUpdate(currentTime);
        }
      };

      const handleEnded = () => {
        if (!isActive) return;
        const currentTime = player.currentTime;
        if (currentTime && onTimeUpdate) {
          onTimeUpdate(currentTime);
        }
        if (onEnded) {
          onEnded();
        }
      };

      try {
        if (typeof player.off === 'function') {
          player.off('timeupdate');
          player.off('pause');
          player.off('ended');
        }
      } catch (error) {
        // Ignore
      }

      player.on('timeupdate', handleTimeUpdate);
      player.on('pause', handlePause);
      player.on('ended', handleEnded);
      
      listenersAttached = true;

      cleanupFns.push(() => {
        try {
          const currentPlayer = playerRef.current?.plyr;
          if (currentPlayer && typeof currentPlayer.off === 'function') {
            currentPlayer.off('timeupdate', handleTimeUpdate);
            currentPlayer.off('pause', handlePause);
            currentPlayer.off('ended', handleEnded);
          }
        } catch (error) {
          // Ignore
        }
      });

      return true;
    };

    const immediateSuccess = attachListeners();
    
    if (!immediateSuccess) {
      const player = playerRef.current?.plyr;
      if (player && typeof player.once === 'function') {
        const readyHandler = () => attachListeners();
        
        player.once('ready', readyHandler);
        cleanupFns.push(() => {
          try {
            const p = playerRef.current?.plyr;
            if (p && typeof p.off === 'function') {
              p.off('ready', readyHandler);
            }
          } catch (e) {
            // Ignore
          }
        });
      }
      
      const retry1 = setTimeout(() => {
        if (!listenersAttached && isActive) attachListeners();
      }, 300);
      
      const retry2 = setTimeout(() => {
        if (!listenersAttached && isActive) attachListeners();
      }, 700);
      
      cleanupFns.push(() => {
        clearTimeout(retry1);
        clearTimeout(retry2);
      });
    }

    return () => {
      isActive = false;
      listenersAttached = false;
      cleanupFns.forEach(fn => {
        try {
          fn();
        } catch (error) {
          // Ignore
        }
      });
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
