import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Search, LogIn } from 'lucide-react';
import ContentCard from '@/components/ContentCard';
import { contentData } from '@/data/content';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContent = contentData.filter(content =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
                <Film className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">MiuNet</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Watch unlimited movies & TV shows, the miuni way..</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 sm:px-8 py-12">
        <section>
          <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
          <p className="text-muted-foreground mb-8">Popular movies and TV shows you'll love</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredContent.length > 0 ? (
              filteredContent.map((content, index) => (
                <div 
                  key={content.id}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ContentCard content={content} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 sm:px-8 py-8">
          <p className="text-center text-muted-foreground text-sm">
            © 2025 MiuNet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
