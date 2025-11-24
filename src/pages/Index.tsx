import { Film } from 'lucide-react';
import ContentCard from '@/components/ContentCard';
import { contentData } from '@/data/content';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
              <Film className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">StreamFlix</h1>
              <p className="text-sm text-muted-foreground">Watch unlimited movies & TV shows</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
          <p className="text-muted-foreground mb-8">Popular movies and TV shows you'll love</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {contentData.map((content, index) => (
              <div 
                key={content.id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ContentCard content={content} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground text-sm">
            © 2024 StreamFlix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
