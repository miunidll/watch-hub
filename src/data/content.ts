// --- Types ---
export interface Movie {
  id: string;
  title: string;
  type: 'movie';
  poster: string;
  description: string;
  trailer: string;
  videoUrl: string;
  year: number;
  duration: string;
}

export interface Episode {
  id: string;
  title: string;
  number: number;
  videoUrl: string;
  duration: string;
}

export interface Season {
  id: string;
  number: number;
  episodes: Episode[];
}

export interface TVShow {
  id: string;
  title: string;
  type: 'tv';
  poster: string;
  description: string;
  trailer: string;
  year: number;
  seasons: Season[];
}

export type Content = Movie | TVShow;

// --- Content Loader ---
function loadContentFromJSON(): Content[] {
  // Vite: import all JSON files from movies and tv folders
  const movieFiles = import.meta.glob('../content/movies/*.json', { eager: true });
  const tvFiles = import.meta.glob('../content/tv/*.json', { eager: true });

  const movies: Movie[] = Object.values(movieFiles) as Movie[];
  const tvShows: TVShow[] = Object.values(tvFiles) as TVShow[];

  return [...movies, ...tvShows];
}

// --- Exported contentData (replaces hard-coded array) ---
export const contentData: Content[] = loadContentFromJSON();
