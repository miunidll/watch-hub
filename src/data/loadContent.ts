import type { Content, Movie, TVShow } from "@/data/content";

// Load all JSON files from movies and tv folders
export function loadContent(): Content[] {
  // Vite magic: eager imports all JSON files in the folder
  const movieFiles = import.meta.glob('../content/movies/*.json', { eager: true });
  const tvFiles = import.meta.glob('../content/tv/*.json', { eager: true });

  const movies: Movie[] = Object.values(movieFiles) as Movie[];
  const tvShows: TVShow[] = Object.values(tvFiles) as TVShow[];

  return [...movies, ...tvShows];
}
