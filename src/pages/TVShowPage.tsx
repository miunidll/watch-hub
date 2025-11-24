import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { contentData, TVShow } from '@/data/content';
import VideoPlayer from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { saveWatchProgress, getWatchProgress } from '@/services/watchProgress';

const TVShowPage = () => {
  const { id } = useParams();
  const show = contentData.find(c => c.id === id && c.type === 'tv') as TVShow;
  const { user } = useAuth();
  
  const [selectedSeason, setSelectedSeason] = useState(show?.seasons[0]);
  const [selectedEpisode, setSelectedEpisode] = useState(show?.seasons[0]?.episodes[0]);
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    const loadProgress = async () => {
      if (user && id && selectedSeason && selectedEpisode) {
        const progress = await getWatchProgress(user.uid, id, selectedSeason.id, selectedEpisode.id);
        if (progress && progress.episodeId === selectedEpisode.id) {
          setInitialTime(progress.timestamp);
        } else {
          setInitialTime(0);
        }
      }
    };
    loadProgress();
  }, [user, id, selectedSeason, selectedEpisode]);

  const handleTimeUpdate = useCallback(async (currentTime: number) => {
    if (user && id && selectedSeason && selectedEpisode) {
      const docId = `${user.uid}_${id}_${selectedSeason.id}_${selectedEpisode.id}`;
      console.log('💾 Saving TV progress:', { 
        seasonId: selectedSeason.id,
        episodeId: selectedEpisode.id, 
        currentTime,
        docId
      });
      
      const result = await saveWatchProgress(user.uid, {
        contentId: id,
        contentType: 'tv',
        timestamp: currentTime,
        seasonId: selectedSeason.id,
        episodeId: selectedEpisode.id,
        updatedAt: Date.now(),
      });
      
      if (result.success) {
        console.log('✅ TV progress saved successfully');
      } else {
        console.error('❌ Failed to save TV progress:', result.error);
      }
    } else {
      console.warn('⚠️ Missing data for save:', {
        hasUser: !!user,
        hasId: !!id,
        hasSeason: !!selectedSeason,
        hasEpisode: !!selectedEpisode
      });
    }
  }, [user, id, selectedSeason, selectedEpisode]);

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">TV Show not found</h1>
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
          <div className="lg:col-span-1">
            <img 
              src={show.poster} 
              alt={show.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{show.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{show.year}</span>
                <span>•</span>
                <span>{show.seasons.length} Season{show.seasons.length > 1 ? 's' : ''}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{show.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Trailer</h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${show.trailer}`}
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
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-2xl font-bold">Watch Now</h2>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <Select 
                value={selectedSeason?.id} 
                onValueChange={async (value) => {
                  const season = show.seasons.find(s => s.id === value);
                  if (season) {
                    setSelectedSeason(season);
                    setSelectedEpisode(season.episodes[0]);
                    
                    // Load progress for the first episode of the new season
                    if (user && id) {
                      const progress = await getWatchProgress(user.uid, id, season.id, season.episodes[0].id);
                      setInitialTime(progress?.timestamp || 0);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {show.seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      Season {season.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedEpisode?.id} 
                onValueChange={async (value) => {
                  const episode = selectedSeason?.episodes.find(e => e.id === value);
                  if (episode && selectedSeason) {
                    setSelectedEpisode(episode);
                    
                    // Load progress for the newly selected episode
                    if (user && id) {
                      const progress = await getWatchProgress(user.uid, id, selectedSeason.id, episode.id);
                      setInitialTime(progress?.timestamp || 0);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select episode" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSeason?.episodes.map((episode) => (
                    <SelectItem key={episode.id} value={episode.id}>
                      Episode {episode.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEpisode && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {selectedEpisode.title} <span className="text-muted-foreground">({selectedEpisode.duration})</span>
              </h3>
              <VideoPlayer 
                key={`${id}-${selectedSeason.id}-${selectedEpisode.id}`}
                url={selectedEpisode.videoUrl}
                title={selectedEpisode.title}
                initialTime={initialTime}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TVShowPage;
