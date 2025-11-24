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

export const contentData: Content[] = [
  {
    id: '1',
    title: 'Inception',
    type: 'movie',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    trailer: 'YoHD9XEInc0',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    year: 2010,
    duration: '2h 28m'
  },
  {
    id: '2',
    title: 'The Matrix',
    type: 'movie',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    trailer: 'm8e-FF8MsqU',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    year: 1999,
    duration: '2h 16m'
  },
  {
    id: '3',
    title: 'Stranger Things',
    type: 'tv',
    poster: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop',
    description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
    trailer: 'b9EkMc79ZSU',
    year: 2016,
    seasons: [
      {
        id: 's1',
        number: 1,
        episodes: [
          { id: 'e1', title: 'Chapter One: The Vanishing of Will Byers', number: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: '48m' },
          { id: 'e2', title: 'Chapter Two: The Weirdo on Maple Street', number: 2, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: '55m' },
          { id: 'e3', title: 'Chapter Three: Holly, Jolly', number: 3, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', duration: '51m' }
        ]
      },
      {
        id: 's2',
        number: 2,
        episodes: [
          { id: 'e1', title: 'Chapter One: MADMAX', number: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', duration: '48m' },
          { id: 'e2', title: 'Chapter Two: Trick or Treat, Freak', number: 2, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', duration: '53m' }
        ]
      }
    ]
  },
  {
    id: '4',
    title: 'Interstellar',
    type: 'movie',
    poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    trailer: 'zSWdZVtXT7E',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    year: 2014,
    duration: '2h 49m'
  },
  {
    id: '5',
    title: 'Breaking Bad',
    type: 'tv',
    poster: 'https://images.unsplash.com/photo-1574267432644-f610a89e0309?w=400&h=600&fit=crop',
    description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
    trailer: 'HhesaQXLuRY',
    year: 2008,
    seasons: [
      {
        id: 's1',
        number: 1,
        episodes: [
          { id: 'e1', title: 'Pilot', number: 1, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', duration: '58m' },
          { id: 'e2', title: 'Cat\'s in the Bag...', number: 2, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', duration: '48m' }
        ]
      }
    ]
  },
  {
    id: '6',
    title: 'Blade Runner 2049',
    type: 'movie',
    poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop',
    description: 'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who\'s been missing for thirty years.',
    trailer: 'gCcx85zbxz4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    year: 2017,
    duration: '2h 44m'
  }
];
