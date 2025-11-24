import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Content } from '@/data/content';

interface ContentCardProps {
  content: Content;
}

const ContentCard = ({ content }: ContentCardProps) => {
  return (
    <Link 
      to={`/${content.type}/${content.id}`}
      className="group relative overflow-hidden rounded-lg bg-card transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-fade-in"
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img 
          src={content.poster} 
          alt={content.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
        <div className="flex items-center gap-2 mb-2">
          <Play className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {content.type === 'movie' ? 'Movie' : 'TV Show'} • {content.year}
          </span>
        </div>
        <h3 className="font-bold text-foreground text-lg">{content.title}</h3>
      </div>
    </Link>
  );
};

export default ContentCard;
