import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { contentData, Movie } from '@/data/content';
import VideoPlayer from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getWatchProgress } from '@/services/watchProgress';
import { watchProgressQueue } from '@/services/watchProgressQueue';

const MoviePage = () => {
  const { id } = useParams();
  const movie = contentData.find(c => c.id === id && c.type === 'movie') as Movie;
  const { user } = useAuth();
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    if (movie) {
      document.title = `${movie.title} - Movie`;
    }
  }, [movie]);

  useEffect(() => {
    const loadProgress = async () => {
      if (user && id) {
        const progress = await getWatchProgress(user.uid, id);
        if (progress) {
          setInitialTime(progress.timestamp);
        }
      }
    };
    loadProgress();
  }, [user, id]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    if (user && id) {
      watchProgressQueue.enqueue(user.uid, {
        contentId: id,
        contentType: 'movie',
        timestamp: currentTime,
        updatedAt: Date.now(),
      });
    }
  }, [user, id]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 hidden lg:block">
            <img 
              src={movie.poster} 
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          <div className="lg:col-span-2 space-y-6 flex flex-col">
            <div>
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{movie.year}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {movie.duration}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
            </div>

            <div className="flex-1 flex-col hidden lg:flex">
              <h2 className="text-xl font-semibold mb-3">Trailer</h2>
              <div className="flex-1 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${movie.trailer}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Watch Now</h2>
          <VideoPlayer 
            url={movie.videoUrl} 
            title={movie.title}
            initialTime={initialTime}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default MoviePage;
