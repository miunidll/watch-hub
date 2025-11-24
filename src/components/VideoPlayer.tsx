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
    
    const player = playerRef.current?.plyr;
    
    if (!player) {
      console.warn('⚠️ VideoPlayer: No player instance found');
      return;
    }
    
    if (!onTimeUpdate) {
      console.log('ℹ️ VideoPlayer: No onTimeUpdate callback provided');
      return;
    }

    console.log('✅ VideoPlayer: Player instance found, setting up listener');

    const handleTimeUpdate = () => {
      const currentTime = player.currentTime;
      console.log('⏱️ VideoPlayer: timeupdate event fired', { currentTime });
      if (currentTime) {
        console.log('📤 VideoPlayer: Calling onTimeUpdate callback with time:', currentTime);
        onTimeUpdate(currentTime);
      }
    };

    // Wait for player to be ready before attaching listener
    const setupListener = () => {
      const mediaElement = player.media;
      console.log('🔍 VideoPlayer: Setting up listener', { hasMediaElement: !!mediaElement });
      
      if (mediaElement) {
        console.log('✅ VideoPlayer: Attaching timeupdate listener to media element');
        mediaElement.addEventListener('timeupdate', handleTimeUpdate);
        
        return () => {
          console.log('🧹 VideoPlayer: Cleaning up timeupdate listener');
          mediaElement.removeEventListener('timeupdate', handleTimeUpdate);
        };
      } else {
        console.error('❌ VideoPlayer: Media element not found!');
      }
    };

    // If player is already ready, setup immediately
    if (player.ready) {
      console.log('✅ VideoPlayer: Player already ready, setting up listener now');
      return setupListener();
    }

    // Otherwise wait for ready event
    console.log('⏳ VideoPlayer: Waiting for player ready event');
    player.on('ready', () => {
      console.log('✅ VideoPlayer: Player ready event fired');
      setupListener();
    });

    return () => {
      console.log('🧹 VideoPlayer: Cleaning up ready event listener');
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
