import { useRef, useEffect } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

interface VideoPlayerProps {
  url: string;
  title: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  autostart?: boolean;
}

const VideoPlayer = ({ url, title, initialTime = 0, onTimeUpdate, onEnded, autostart = false }: VideoPlayerProps) => {
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
    if (!autostart) return;

    let autostartExecuted = false;

    const startPlayback = () => {
      if (autostartExecuted) return;
      
      const player = playerRef.current?.plyr;
      if (!player) return;

      const attemptPlay = () => {
        if (autostartExecuted) return;
        try {
          player.play();
          autostartExecuted = true;
          console.log('Autoplay started successfully');
        } catch (error) {
          console.log('Autoplay failed:', error);
        }
      };

      const readyHandler = () => {
        attemptPlay();
        player.off('ready', readyHandler);
      };

      if (player.ready) {
        attemptPlay();
      } else {
        player.on('ready', readyHandler);
      }

      setTimeout(attemptPlay, 100);
      setTimeout(attemptPlay, 500);
    };

    const timer = setTimeout(startPlayback, 200);

    return () => {
      clearTimeout(timer);
      autostartExecuted = true;
    };
  }, [autostart]);

  useEffect(() => {
    if (!onTimeUpdate && !onEnded) return;

    let isActive = true;
    const cleanupFns: (() => void)[] = [];

    const attachListeners = () => {
      if (!isActive) return;
      
      const ref = playerRef.current;
      if (!ref || !ref.plyr) {
        console.log('Player ref not ready yet');
        return;
      }

      const player = ref.plyr;
      
      if (typeof player.on !== 'function') {
        console.log('Player.on is not a function');
        return;
      }

      console.log('Attaching player event listeners');

      let lastSaveTime = 0;
      const SAVE_INTERVAL = 3000;

      const handleTimeUpdate = () => {
        if (!isActive || !onTimeUpdate) return;
        const currentTime = player.currentTime;
        const now = Date.now();
        
        if (currentTime && now - lastSaveTime >= SAVE_INTERVAL) {
          lastSaveTime = now;
          onTimeUpdate(currentTime);
        }
      };

      const handlePause = () => {
        if (!isActive || !onTimeUpdate) return;
        const currentTime = player.currentTime;
        if (currentTime) {
          onTimeUpdate(currentTime);
        }
      };

      const handleEnded = () => {
        if (!isActive) return;
        console.log('Video ended event fired!');
        const currentTime = player.currentTime;
        if (currentTime && onTimeUpdate) {
          onTimeUpdate(currentTime);
        }
        if (onEnded) {
          console.log('Calling onEnded callback');
          onEnded();
        }
      };

      // Remove any existing listeners first
      try {
        player.off('timeupdate', handleTimeUpdate);
        player.off('pause', handlePause);
        player.off('ended', handleEnded);
      } catch (error) {
        // Ignore
      }

      // Attach new listeners
      if (onTimeUpdate) {
        player.on('timeupdate', handleTimeUpdate);
        player.on('pause', handlePause);
      }
      
      if (onEnded) {
        player.on('ended', handleEnded);
        console.log('Attached ended event listener');
      }

      // Store cleanup function
      cleanupFns.push(() => {
        try {
          if (player && typeof player.off === 'function') {
            player.off('timeupdate', handleTimeUpdate);
            player.off('pause', handlePause);
            player.off('ended', handleEnded);
          }
        } catch (error) {
          // Ignore
        }
      });
    };

    // Try to attach immediately
    attachListeners();
    
    // Also try after short delays to catch when player becomes ready
    const timer1 = setTimeout(attachListeners, 100);
    const timer2 = setTimeout(attachListeners, 500);
    const timer3 = setTimeout(attachListeners, 1000);
    
    cleanupFns.push(() => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    });

    return () => {
      isActive = false;
      cleanupFns.forEach(fn => {
        try {
          fn();
        } catch (error) {
          // Ignore
        }
      });
    };
  }, [onTimeUpdate, onEnded]);

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
