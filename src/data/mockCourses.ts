export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'rules' | 'mechanics' | 'academy' | 'seminars';
  durationMinutes: number;
  videoUrl: string;
  thumbnailUrl: string;
  seasonYear: string;
  isRequired: boolean;
  completionRate: number;
  createdAt: string;
}

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: '2025 NFHS Rules Changes',
    description: 'Comprehensive overview of all rule changes for the 2025 basketball season, including new interpretations and case plays.',
    category: 'rules',
    durationMinutes: 45,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    seasonYear: '2025',
    isRequired: true,
    completionRate: 87,
    createdAt: '2024-09-01T10:00:00Z'
  },
  {
    id: 'course-2',
    title: 'Three-Person Mechanics',
    description: 'Advanced coverage areas, rotations, and responsibilities in the three-person officiating system.',
    category: 'mechanics',
    durationMinutes: 60,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400',
    seasonYear: '2024',
    isRequired: true,
    completionRate: 92,
    createdAt: '2024-08-15T10:00:00Z'
  },
  {
    id: 'course-3',
    title: 'Shot Clock Procedures',
    description: 'Proper administration of the shot clock including resets, malfunctions, and proper timing.',
    category: 'rules',
    durationMinutes: 30,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400',
    seasonYear: '2025',
    isRequired: true,
    completionRate: 78,
    createdAt: '2024-09-10T10:00:00Z'
  },
  {
    id: 'course-4',
    title: 'Faking Being Fouled',
    description: 'Identifying and properly penalizing flopping and exaggerated contact reactions.',
    category: 'rules',
    durationMinutes: 20,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400',
    seasonYear: '2025',
    isRequired: false,
    completionRate: 65,
    createdAt: '2024-10-01T10:00:00Z'
  },
  {
    id: 'course-5',
    title: 'Advanced Officiating Techniques',
    description: 'Elite-level positioning, communication, and game management strategies for experienced officials.',
    category: 'academy',
    durationMinutes: 90,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
    seasonYear: '2024',
    isRequired: false,
    completionRate: 56,
    createdAt: '2024-07-20T10:00:00Z'
  },
  {
    id: 'course-6',
    title: 'Rules Interpretation Seminar',
    description: 'Deep dive into complex rule scenarios with case studies and Q&A session.',
    category: 'seminars',
    durationMinutes: 120,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400',
    seasonYear: '2025',
    isRequired: false,
    completionRate: 43,
    createdAt: '2024-10-15T10:00:00Z'
  },
  {
    id: 'course-7',
    title: 'Pre-Game Conference Best Practices',
    description: 'Effective pre-game crew meetings, coverage areas, and communication protocols.',
    category: 'mechanics',
    durationMinutes: 25,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
    seasonYear: '2024',
    isRequired: false,
    completionRate: 71,
    createdAt: '2024-08-01T10:00:00Z'
  },
  {
    id: 'course-8',
    title: 'Apparel & Uniform Standards',
    description: 'Official IAABO uniform requirements, appearance guidelines, and equipment standards.',
    category: 'academy',
    durationMinutes: 15,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400',
    seasonYear: '2025',
    isRequired: true,
    completionRate: 94,
    createdAt: '2024-09-05T10:00:00Z'
  },
  {
    id: 'course-9',
    title: 'Travel vs. Gather Step',
    description: 'Detailed breakdown of legal footwork, gather steps, and traveling violations.',
    category: 'rules',
    durationMinutes: 35,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    seasonYear: '2025',
    isRequired: true,
    completionRate: 82,
    createdAt: '2024-09-20T10:00:00Z'
  },
  {
    id: 'course-10',
    title: 'Managing Coaches & Benches',
    description: 'Professional communication strategies for handling bench personnel and maintaining game control.',
    category: 'mechanics',
    durationMinutes: 40,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    seasonYear: '2024',
    isRequired: false,
    completionRate: 68,
    createdAt: '2024-08-10T10:00:00Z'
  },
  {
    id: 'course-11',
    title: 'Block/Charge Principles',
    description: 'Legal guarding position, restricted area, and proper block/charge adjudication.',
    category: 'rules',
    durationMinutes: 50,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    seasonYear: '2025',
    isRequired: true,
    completionRate: 85,
    createdAt: '2024-09-12T10:00:00Z'
  },
  {
    id: 'course-12',
    title: 'Timeout Administration',
    description: 'Proper procedures for granting, denying, and managing timeouts in all situations.',
    category: 'mechanics',
    durationMinutes: 20,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400',
    seasonYear: '2024',
    isRequired: false,
    completionRate: 75,
    createdAt: '2024-08-25T10:00:00Z'
  },
  {
    id: 'course-13',
    title: 'Closely Guarded Situations',
    description: 'Recognizing and properly counting closely guarded violations.',
    category: 'rules',
    durationMinutes: 18,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400',
    seasonYear: '2025',
    isRequired: false,
    completionRate: 62,
    createdAt: '2024-10-05T10:00:00Z'
  },
  {
    id: 'course-14',
    title: 'Post-Game Crew Evaluation',
    description: 'Constructive feedback techniques and continuous improvement strategies for officiating crews.',
    category: 'academy',
    durationMinutes: 30,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
    seasonYear: '2024',
    isRequired: false,
    completionRate: 48,
    createdAt: '2024-07-15T10:00:00Z'
  },
  {
    id: 'course-15',
    title: 'Two-Person Mechanics Refresh',
    description: 'Updated coverage areas and responsibilities for two-person officiating systems.',
    category: 'mechanics',
    durationMinutes: 45,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400',
    seasonYear: '2024',
    isRequired: false,
    completionRate: 79,
    createdAt: '2024-08-05T10:00:00Z'
  }
];
