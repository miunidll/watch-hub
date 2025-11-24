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
  },
  {
  id: '7',
  title: 'The Dark Knight',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=400&h=600&fit=crop',
  description: 'Batman faces the Joker, a criminal mastermind who plunges Gotham into chaos.',
  trailer: 'EXeTwQWrcwY',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  year: 2008,
  duration: '2h 32m'
},
{
  id: '8',
  title: 'Avatar',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1542204637-e67bc7d41e3b?w=400&h=600&fit=crop',
  description: 'A paraplegic Marine dispatched to the moon Pandora becomes torn between following orders and protecting an alien civilization.',
  trailer: '5PSNL1qE6VY',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  year: 2009,
  duration: '2h 42m'
},
{
  id: '9',
  title: 'The Shawshank Redemption',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1535398089889-dd807df1dfb0?w=400&h=600&fit=crop',
  description: 'Two imprisoned men bond over years, finding solace and redemption through acts of decency.',
  trailer: '6hB3S9bIaco',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  year: 1994,
  duration: '2h 22m'
},
{
  id: '10',
  title: 'Fight Club',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=400&h=600&fit=crop',
  description: 'An office worker and soap maker form an underground fight club that evolves into something more.',
  trailer: 'SUXWAEX2jlg',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  year: 1999,
  duration: '2h 19m'
},
{
  id: '11',
  title: 'Gladiator',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1612965324449-a229ede4802b?w=400&h=600&fit=crop',
  description: 'A betrayed Roman general seeks revenge while rising as a gladiator.',
  trailer: 'owK1qxDselE',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  year: 2000,
  duration: '2h 35m'
},
{
  id: '12',
  title: 'The Lord of the Rings: The Fellowship of the Ring',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1526312426976-f4d754fa9bd6?w=400&h=600&fit=crop',
  description: 'A hobbit begins his journey to destroy a powerful ring and save Middle-earth.',
  trailer: 'V75dMMIW2B4',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  year: 2001,
  duration: '2h 58m'
},
{
  id: '13',
  title: 'The Godfather',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=600&fit=crop',
  description: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.',
  trailer: 'sY1S34973zA',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  year: 1972,
  duration: '2h 55m'
},
{
  id: '14',
  title: 'The Wolf of Wall Street',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=600&fit=crop',
  description: 'A stockbroker rises to wealth through corruption and fraud.',
  trailer: 'iszwuX1AK6A',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  year: 2013,
  duration: '3h 0m'
},
{
  id: '15',
  title: 'Pulp Fiction',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=400&h=600&fit=crop',
  description: 'Stories of crime intertwine in a stylish and chaotic narrative.',
  trailer: 's7EdQ4FqbhY',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  year: 1994,
  duration: '2h 34m'
},
{
  id: '16',
  title: 'Dune',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1635860396990-03dfb5a12ddf?w=400&h=600&fit=crop',
  description: 'A gifted young man must travel to the most dangerous planet to secure his people’s future.',
  trailer: 'n9xhJrPXop4',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  year: 2021,
  duration: '2h 35m'
},
{
  id: '17',
  title: 'Mad Max: Fury Road',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop',
  description: 'In a post-apocalyptic wasteland, Max teams up with Furiosa to escape a tyrant.',
  trailer: 'hEJnMQG9ev8',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  year: 2015,
  duration: '2h 0m'
},
{
  id: '18',
  title: 'The Social Network',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1485217988980-11786ced9454?w=400&h=600&fit=crop',
  description: 'The story of Facebook’s founding and the lawsuits that followed.',
  trailer: 'lB95KLmpLR4',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  year: 2010,
  duration: '2h 1m'
},
{
  id: '19',
  title: 'Whiplash',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=600&fit=crop',
  description: 'A young drummer is pushed to the brink by an abusive music instructor.',
  trailer: '7d_jQycdQGo',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  year: 2014,
  duration: '1h 47m'
},
{
  id: '20',
  title: 'Tenet',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=400&h=600&fit=crop',
  description: 'A secret agent manipulates time to prevent World War III.',
  trailer: 'L3pk_TBkihU',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  year: 2020,
  duration: '2h 30m'
},
{
  id: '21',
  title: 'The Revenant',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=600&fit=crop',
  description: 'A frontiersman fights for survival after being left for dead.',
  trailer: 'LoebZZ8K5N0',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  year: 2015,
  duration: '2h 36m'
},
{
  id: '22',
  title: 'Joker',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1542204637-e67bc7d41e3b?w=400&h=600&fit=crop',
  description: 'A mentally struggling comedian descends into madness and becomes the infamous Joker.',
  trailer: 'zAGVQLHvwOY',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  year: 2019,
  duration: '2h 2m'
},
{
  id: '23',
  title: 'Interstellar 2 (Fan Concept)',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1447433909565-04bfc496fe9f?w=400&h=600&fit=crop',
  description: 'A conceptual sequel imagining humanity’s next leap among the stars.',
  trailer: 'zSWdZVtXT7E',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  year: 2025,
  duration: '2h 41m'
},
{
  id: '24',
  title: 'Inglourious Basterds',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop',
  description: 'A group of soldiers plots to assassinate Nazi leadership.',
  trailer: 'KnrRy6kSFF0',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  year: 2009,
  duration: '2h 33m'
},
{
  id: '25',
  title: 'Shutter Island',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
  description: 'A U.S. Marshal investigates the disappearance of a patient from a mental institution.',
  trailer: '5iaYLCiq5RM',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  year: 2010,
  duration: '2h 18m'
},
{
  id: '26',
  title: 'Her',
  type: 'movie',
  poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=600&fit=crop',
  description: 'A lonely writer falls in love with an advanced operating system.',
  trailer: 'ne6p6MfLBxc',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  year: 2013,
  duration: '2h 6m'
}
];
