import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Tv, Search, LogIn, LogOut } from 'lucide-react';
import ContentCard from '@/components/ContentCard';
import { contentData } from '@/data/content';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type FilterType = 'all' | 'movie' | 'tv';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { user, logOut } = useAuth();

  const handleLogout = async () => {
    await logOut();
  };

  const filteredContent = contentData.filter(content => {
    const matchesFilter = filter === 'all' || content.type === filter;
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Site Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 sm:px-8 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
              <Film className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MiuNet</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Watch unlimited movies & TV shows, the miuni way..
              </p>
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
            {user ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LogOut className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll need to sign in again to watch movies and TV shows.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 sm:px-8 py-12">
        <section>
          <h2 className="text-3xl font-bold mb-2">
            {filter === 'all' ? 'Trending Now' : filter === 'movie' ? 'Movies' : 'TV Shows'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {filter === 'all'
              ? "Popular movies and TV shows you'll love"
              : filter === 'movie'
              ? "Popular movies you'll love"
              : "Popular TV shows you'll love"}
          </p>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'movie' ? 'default' : 'outline'}
              onClick={() => setFilter('movie')}
            >
              Movies
            </Button>
            <Button
              variant={filter === 'tv' ? 'default' : 'outline'}
              onClick={() => setFilter('tv')}
            >
              TV Shows
            </Button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredContent.length > 0 ? (
              filteredContent.map((content, index) => (
                <ContentCard
                  key={content.id}           // key stable, avoids duplicates
                  content={content}
                  animationDelay={0} // pass delay inside card
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
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
