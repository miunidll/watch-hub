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

  // Track fullscreen state in a ref that persists across renders
  const wasFullscreenRef = useRef(false);

  // Monitor fullscreen changes and store in ref
  useEffect(() => {
    const attachFullscreenListeners = () => {
      const player = playerRef.current?.plyr;
      if (!player || typeof player.on !== 'function') return;

      const handleFullscreenChange = () => {
        const isFullscreen = player.fullscreen?.active || false;
        wasFullscreenRef.current = isFullscreen;
      };

      player.on('enterfullscreen', handleFullscreenChange);
      player.on('exitfullscreen', handleFullscreenChange);

      return () => {
        try {
          if (typeof player.off === 'function') {
            player.off('enterfullscreen', handleFullscreenChange);
            player.off('exitfullscreen', handleFullscreenChange);
          }
        } catch (e) {}
      };
    };

    // Try to attach immediately
    const cleanup = attachFullscreenListeners();
    
    // Also try after delays to catch when player becomes ready
    const timer1 = setTimeout(attachFullscreenListeners, 100);
    const timer2 = setTimeout(attachFullscreenListeners, 500);

    return () => {
      if (cleanup) cleanup();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Update video source when URL changes without recreating player
  useEffect(() => {
    const player = playerRef.current?.plyr;
    if (!player || !url) return;

    // Only update if the source is different
    const currentSource = player.source?.sources?.[0]?.src;
    if (currentSource !== url) {
      const shouldRestoreFullscreen = wasFullscreenRef.current;
      
      console.log('🔄 Changing video source. Was fullscreen:', shouldRestoreFullscreen);
      
      player.source = {
        type: 'video',
        title: title,
        sources: [
          {
            src: url,
            type: 'video/mp4',
          },
        ],
      };
      
      // Restore fullscreen if it was active
      if (shouldRestoreFullscreen) {
        const restoreFullscreen = () => {
          if (player.fullscreen && !player.fullscreen.active) {
            console.log('📺 Restoring fullscreen');
            player.fullscreen.enter();
          }
        };
        
        // Multiple attempts with different timing
        setTimeout(restoreFullscreen, 100);
        setTimeout(restoreFullscreen, 300);
        setTimeout(restoreFullscreen, 600);
        setTimeout(restoreFullscreen, 1000);
        
        // Also try on canplay event
        const canplayHandler = () => {
          console.log('🎬 Canplay - restoring fullscreen');
          restoreFullscreen();
          player.off('canplay', canplayHandler);
        };
        player.on('canplay', canplayHandler);
      }
    }
  }, [url, title]);

  useEffect(() => {
    if (!autostart) return;

    console.log('Autostart effect triggered for URL:', url);
    let executed = false;

    const startPlayback = () => {
      if (executed) return;
      
      const player = playerRef.current?.plyr;
      if (!player) {
        console.log('Player not ready for autostart');
        return;
      }

      const attemptPlay = () => {
        if (executed) return;
        executed = true;
        try {
          console.log('Attempting to play...');
          const promise = player.play();
          if (promise !== undefined) {
            promise
              .then(() => console.log('Autoplay started successfully'))
              .catch((error) => console.log('Autoplay failed:', error));
          } else {
            console.log('Play initiated (no promise)');
          }
        } catch (error) {
          console.log('Autoplay error:', error);
        }
      };

      const readyHandler = () => {
        console.log('Player ready event fired');
        attemptPlay();
        try {
          player.off('ready', readyHandler);
        } catch (e) {}
      };

      if (player.ready) {
        console.log('Player already ready, playing immediately');
        attemptPlay();
      } else {
        console.log('Waiting for player ready event');
        try {
          player.on('ready', readyHandler);
        } catch (e) {
          console.log('Could not attach ready handler');
        }
      }

      // Fallback attempts
      setTimeout(() => {
        if (!executed) {
          console.log('Fallback play attempt 1');
          attemptPlay();
        }
      }, 300);
      
      setTimeout(() => {
        if (!executed) {
          console.log('Fallback play attempt 2');
          attemptPlay();
        }
      }, 800);
    };

    const timer = setTimeout(startPlayback, 100);

    return () => {
      clearTimeout(timer);
      executed = true;
    };
  }, [autostart, url]);

  useEffect(() => {
    if (!onTimeUpdate && !onEnded) return;

    let isActive = true;
    const cleanupFns: (() => void)[] = [];

    const attachListeners = () => {
      if (!isActive) return;
      
      const ref = playerRef.current;
      if (!ref || !ref.plyr) {
        return;
      }

      const player = ref.plyr;
      
      if (typeof player.on !== 'function') {
        return;
      }

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
        const currentTime = player.currentTime;
        if (currentTime && onTimeUpdate) {
          onTimeUpdate(currentTime);
        }
        if (onEnded) {
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
