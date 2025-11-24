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
    if (playerRef.current?.plyr && initialTime > 0) {
      playerRef.current.plyr.currentTime = initialTime;
    }
  }, [initialTime, url]);

  useEffect(() => {
    console.log('🎬 VideoPlayer: useEffect running', { hasOnTimeUpdate: !!onTimeUpdate });
    
    if (!onTimeUpdate) {
      console.log('ℹ️ VideoPlayer: No onTimeUpdate callback provided');
      return;
    }

    // Small delay to ensure player is initialized
    const timer = setTimeout(() => {
      const player = playerRef.current?.plyr;
      
      if (!player) {
        console.warn('⚠️ VideoPlayer: No player instance found after delay');
        return;
      }

      console.log('✅ VideoPlayer: Player instance found', { 
        hasOnMethod: typeof player.on === 'function',
        hasMedia: !!player.media 
      });

      const handleTimeUpdate = () => {
        const currentTime = player.currentTime;
        console.log('⏱️ VideoPlayer: timeupdate event fired', { currentTime });
        if (currentTime) {
          console.log('📤 VideoPlayer: Calling onTimeUpdate callback with time:', currentTime);
          onTimeUpdate(currentTime);
        }
      };

      // Use Plyr's on method to listen for ready event
      if (typeof player.on === 'function') {
        console.log('✅ VideoPlayer: Using Plyr .on() method');
        player.on('ready', () => {
          console.log('✅ VideoPlayer: Player ready event fired');
          const mediaElement = player.media;
          
          if (mediaElement) {
            console.log('✅ VideoPlayer: Attaching timeupdate listener to media element');
            mediaElement.addEventListener('timeupdate', handleTimeUpdate);
          }
        });

        // Also listen for timeupdate directly on the player
        player.on('timeupdate', (event) => {
          console.log('⏱️ VideoPlayer: Plyr timeupdate event', { currentTime: player.currentTime });
          handleTimeUpdate();
        });
      } else {
        // Fallback: directly attach to media element
        console.log('⚠️ VideoPlayer: Plyr .on() not available, using direct listener');
        const mediaElement = player.media;
        if (mediaElement) {
          console.log('✅ VideoPlayer: Attaching timeupdate listener to media element');
          mediaElement.addEventListener('timeupdate', handleTimeUpdate);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      console.log('🧹 VideoPlayer: Cleanup');
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
