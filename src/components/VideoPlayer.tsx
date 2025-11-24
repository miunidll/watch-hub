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

    const setInitialTimestamp = () => {
      const player = playerRef.current?.plyr;
      if (!player) {
        console.log('❌ No player available for initial time');
        return;
      }

      const setTime = () => {
        try {
          player.currentTime = initialTime;
          console.log('✅ Initial time set to:', initialTime);
        } catch (error) {
          console.error('❌ Error setting initial time:', error);
        }
      };

      // Multiple attempts to ensure the time is set
      const attempts = [
        () => player.on('ready', setTime),
        () => player.on('loadedmetadata', setTime),
        () => player.on('canplay', setTime),
        () => setTimeout(setTime, 500),
        () => setTimeout(setTime, 1000),
        () => setTimeout(setTime, 2000)
      ];

      attempts.forEach(attempt => attempt());
    };

    const timer = setTimeout(setInitialTimestamp, 100);

    return () => clearTimeout(timer);
  }, [initialTime]);

  useEffect(() => {
    if (!onTimeUpdate) return;

    console.log('🔧 VideoPlayer effect running...');

    const timer = setTimeout(() => {
      const player = playerRef.current?.plyr;
      console.log('🎮 Player ref:', playerRef.current);
      console.log('🎮 Plyr instance:', player);
      
      if (!player) {
        console.log('❌ No player found!');
        return;
      }

      console.log('✅ Player found, setting up events...');
      console.log('🎮 Player has .on method?', typeof player.on === 'function');

      const handleTimeUpdate = () => {
        const currentTime = player.currentTime;
        if (currentTime) {
          onTimeUpdate(currentTime);
        }
      };

      const handlePause = () => {
        console.log('⏸️ PAUSE EVENT FIRED!');
        const currentTime = player.currentTime;
        console.log('⏸️ Current time on pause:', currentTime);
        if (currentTime) {
          onTimeUpdate(currentTime);
        }
      };

      const handleEnded = () => {
        console.log('🏁 ENDED EVENT FIRED!');
        const currentTime = player.currentTime;
        if (currentTime) {
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
