import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Content } from '@/data/content';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ContentCardProps {
  content: Content;
  animationDelay?: number; // optional prop for fade-in animation
}

const ContentCard = ({ content, animationDelay = 0 }: ContentCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to be signed in to watch content. Please sign in or create an account.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/${content.type}/${content.id}`);
  };

  return (
    <a 
      href={`/${content.type}/${content.id}`}
      onClick={handleClick}
      className="group block overflow-hidden rounded-lg bg-card transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-fade-in cursor-pointer"
      style={{ animationDelay: `${animationDelay}s` }} // apply animation delay here
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={content.poster} 
          alt={content.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end">
          <div className="p-4 w-full">
            <div className="flex items-center gap-2 mb-2">
              <Play className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                {content.type === 'movie' ? 'Movie' : 'TV Show'} • {content.year}
              </span>
            </div>
            <h3 className="font-bold text-foreground text-lg line-clamp-2">{content.title}</h3>
          </div>
        </div>
      </div>
    </a>
  );
};

export default ContentCard;
