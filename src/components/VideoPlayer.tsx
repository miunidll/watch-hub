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

    const timer = setTimeout(() => {
      const player = playerRef.current?.plyr;
      if (!player) return;

      const setTime = () => {
        player.currentTime = initialTime;
      };

      // Try multiple approaches to ensure timestamp is set
      if (player.ready) {
        setTime();
      } else if (typeof player.on === 'function') {
        player.once('loadedmetadata', setTime);
        player.once('canplay', setTime);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [initialTime]);

  useEffect(() => {
    if (!onTimeUpdate) return;

    const timer = setTimeout(() => {
      const player = playerRef.current?.plyr;
      if (!player) return;

      const handleTimeUpdate = () => {
        const currentTime = player.currentTime;
        if (currentTime) {
          onTimeUpdate(currentTime);
        }
      };

      if (typeof player.on === 'function') {
        player.on('ready', () => {
          const mediaElement = player.media;
          if (mediaElement) {
            mediaElement.addEventListener('timeupdate', handleTimeUpdate);
          }
        });

        player.on('timeupdate', () => {
          handleTimeUpdate();
        });
      } else {
        const mediaElement = player.media;
        if (mediaElement) {
          mediaElement.addEventListener('timeupdate', handleTimeUpdate);
        }
      }
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
