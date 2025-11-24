import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { contentData, TVShow, Episode, Season } from '@/data/content';
import VideoPlayer from '@/components/VideoPlayer';
import AutoplayCountdown from '@/components/AutoplayCountdown';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getWatchProgress } from '@/services/watchProgress';
import { watchProgressQueue } from '@/services/watchProgressQueue';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NextEpisodeInfo {
  episode: Episode;
  season: Season;
}
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { contentData, TVShow } from '@/data/content';
import VideoPlayer from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getWatchProgress } from '@/services/watchProgress';
import { watchProgressQueue } from '@/services/watchProgressQueue';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const TVShowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const show = contentData.find(c => c.id === id && c.type === 'tv') as TVShow;
  const { user } = useAuth();
  const [autoplay, setAutoplay] = useState(true);
  const [shouldAutostart, setShouldAutostart] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [nextEpisodeInfo, setNextEpisodeInfo] = useState<NextEpisodeInfo | null>(null);
  
  const [selectedSeason, setSelectedSeason] = useState(show?.seasons[0]);
  const [selectedEpisode, setSelectedEpisode] = useState(show?.seasons[0]?.episodes[0]);
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    const loadProgress = async () => {
      if (user && id && selectedSeason && selectedEpisode) {
        const progress = await getWatchProgress(user.uid, id, selectedSeason.id, selectedEpisode.id);
        if (progress && progress.episodeId === selectedEpisode.id) {
          setInitialTime(progress.timestamp);
          setShouldAutostart(false);
        } else {
          setInitialTime(0);
          setShouldAutostart(false);
        }
      }
    };
    loadProgress();
  }, [user, id, selectedSeason, selectedEpisode]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    if (user && id && selectedSeason && selectedEpisode) {
      watchProgressQueue.enqueue(user.uid, {
        contentId: id,
        contentType: 'tv',
        timestamp: currentTime,
        seasonId: selectedSeason.id,
        episodeId: selectedEpisode.id,
        updatedAt: Date.now(),
      });
    }
  }, [user, id, selectedSeason, selectedEpisode]);

  const handleEpisodeEnded = useCallback(() => {
    if (!selectedSeason || !selectedEpisode || !show || !autoplay) return;

    // Find current episode index
    const currentEpisodeIndex = selectedSeason.episodes.findIndex(
      ep => ep.id === selectedEpisode.id
    );

    // Check if there's a next episode in the current season
    if (currentEpisodeIndex < selectedSeason.episodes.length - 1) {
      const nextEpisode = selectedSeason.episodes[currentEpisodeIndex + 1];
      setNextEpisodeInfo({ episode: nextEpisode, season: selectedSeason });
      setShowCountdown(true);
      return;
    }

    // Check if there's a next season
    const currentSeasonIndex = show.seasons.findIndex(s => s.id === selectedSeason.id);
    if (currentSeasonIndex < show.seasons.length - 1) {
      const nextSeason = show.seasons[currentSeasonIndex + 1];
      const firstEpisode = nextSeason.episodes[0];
      
      setNextEpisodeInfo({ episode: firstEpisode, season: nextSeason });
      setShowCountdown(true);
      return;
    }

    // Last episode of the show
    toast({
      title: "Series Complete",
      description: "You've finished watching all episodes!",
    });
  }, [selectedSeason, selectedEpisode, show, toast, autoplay]);

  const handleCountdownComplete = useCallback(() => {
    if (!nextEpisodeInfo) return;

    const { episode, season } = nextEpisodeInfo;
    
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    setInitialTime(0);
    setShouldAutostart(true);
    setShowCountdown(false);
    setNextEpisodeInfo(null);

    toast({
      title: season.id !== selectedSeason?.id ? "Next Season" : "Next Episode",
      description: `S${season.number} E${episode.number}: ${episode.title}`,
    });
  }, [nextEpisodeInfo, selectedSeason, toast]);

  const handleCountdownCancel = useCallback(() => {
    setShowCountdown(false);
    setNextEpisodeInfo(null);
    
    toast({
      title: "Autoplay Cancelled",
      description: "Continue watching whenever you're ready.",
    });
  }, [toast]);

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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedEpisode.title} <span className="text-muted-foreground">({selectedEpisode.duration})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <Switch
                    id="autoplay"
                    checked={autoplay}
                    onCheckedChange={setAutoplay}
                  />
                  <Label htmlFor="autoplay" className="cursor-pointer text-sm">
                    Autoplay
                  </Label>
                </div>
              </div>
              <VideoPlayer
                key={`${id}-${selectedSeason.id}-${selectedEpisode.id}`}
                url={selectedEpisode.videoUrl} 
                title={selectedEpisode.title}
                initialTime={initialTime}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEpisodeEnded}
                autostart={shouldAutostart}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TVShowPage;
