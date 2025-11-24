import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

interface VideoPlayerProps {
  url: string;
  title: string;
}

const VideoPlayer = ({ url, title }: VideoPlayerProps) => {
  return (
    <div className="w-full rounded-lg overflow-hidden bg-black">
      <Plyr
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
