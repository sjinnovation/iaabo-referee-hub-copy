export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  author: string; // Alias for authorName
  date: string; // Alias for publishedAt
  priority: 'high' | 'medium' | 'low';
  targetAudience: 'all' | 'admin' | 'secretary' | 'member';
  targetBoardId?: string;
  publishedAt: string;
  expiresAt?: string;
  isPinned: boolean;
  viewCount: number;
}

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Welcome to the 2025 Basketball Season',
    content: 'We are excited to welcome all officials to the 2025 season. Please ensure you complete all required training courses by November 15th. The NFHS Rules Changes course is mandatory for all active members.',
    authorId: 'admin-1',
    authorName: 'Donnie Smith',
    author: 'Donnie Smith',
    date: '2024-10-01',
    priority: 'high',
    targetAudience: 'all',
    publishedAt: '2024-10-01T09:00:00Z',
    isPinned: true,
    viewCount: 892
  },
  {
    id: 'ann-2',
    title: 'New Rules Changes Effective Immediately',
    content: 'The NFHS has announced several rule modifications that take effect this season. Key changes include updates to shot clock reset procedures and clarifications on faking being fouled. All officials must review the 2025 Rules Changes video in the training portal.',
    authorId: 'admin-1',
    authorName: 'Donnie Smith',
    author: 'Donnie Smith',
    date: '2024-09-28',
    priority: 'high',
    targetAudience: 'all',
    publishedAt: '2024-09-28T14:30:00Z',
    isPinned: true,
    viewCount: 1234
  },
  {
    id: 'ann-3',
    title: 'Dues Payment Reminder',
    content: 'Board secretaries: Annual dues invoices have been generated. Please remit payment by November 30th to avoid late fees. The rate remains $35 per active member. Contact the finance office with any questions.',
    authorId: 'admin-1',
    authorName: 'Donnie Smith',
    author: 'Donnie Smith',
    date: '2024-10-15',
    priority: 'high',
    targetAudience: 'secretary',
    publishedAt: '2024-10-15T10:00:00Z',
    isPinned: false,
    viewCount: 456
  },
  {
    id: 'ann-4',
    title: 'Upcoming Regional Clinic - Register Now',
    content: 'Join us for the Northeast Regional Training Clinic on November 12th in Albany, NY. Topics include advanced three-person mechanics, difficult call scenarios, and crew communication. Limited to 50 participants - register in the Training portal.',
    authorId: 'admin-2',
    authorName: 'Training Coordinator',
    author: 'Training Coordinator',
    date: '2024-10-10',
    priority: 'medium',
    targetAudience: 'all',
    publishedAt: '2024-10-10T11:00:00Z',
    expiresAt: '2024-11-12T18:00:00Z',
    isPinned: false,
    viewCount: 567
  },
  {
    id: 'ann-5',
    title: "Member Spotlight: John Smith's 25 Years of Service",
    content: "Congratulations to Board 42 member John Smith on reaching his 25-year milestone with IAABO. John has officiated over 2,000 games and mentored countless new officials. He will be recognized at the annual awards dinner in March.",
    authorId: 'admin-1',
    authorName: 'Donnie Smith',
    author: 'Donnie Smith',
    date: '2024-10-05',
    priority: 'low',
    targetAudience: 'all',
    publishedAt: '2024-10-05T16:00:00Z',
    isPinned: false,
    viewCount: 789
  },
  {
    id: 'ann-6',
    title: 'IAABO Academy Enrollment Open',
    content: 'Registration is now open for the 2025 IAABO Academy program. This advanced training includes monthly webinars, film study sessions, and mentorship opportunities. Perfect for officials seeking to elevate their game. Enroll by October 31st.',
    authorId: 'admin-2',
    authorName: 'Training Coordinator',
    author: 'Training Coordinator',
    date: '2024-10-12',
    priority: 'medium',
    targetAudience: 'member',
    publishedAt: '2024-10-12T13:00:00Z',
    expiresAt: '2024-10-31T23:59:00Z',
    isPinned: false,
    viewCount: 634
  },
  {
    id: 'ann-7',
    title: 'Updated Uniform Standards',
    content: 'Please review the updated uniform requirements for the 2025 season. Key changes include new approved shirt manufacturers and clarified shoe color specifications. The full uniform guide is available in the Resources section.',
    authorId: 'admin-1',
    authorName: 'Donnie Smith',
    author: 'Donnie Smith',
    date: '2024-09-20',
    priority: 'medium',
    targetAudience: 'all',
    publishedAt: '2024-09-20T10:00:00Z',
    isPinned: false,
    viewCount: 923
  },
  {
    id: 'ann-8',
    title: 'Play of the Week Now Available',
    content: 'Check out our new weekly video series featuring challenging game situations and expert analysis. New episodes posted every Monday. Find them in the Resources library under Videos.',
    authorId: 'admin-2',
    authorName: 'Training Coordinator',
    author: 'Training Coordinator',
    date: '2024-10-14',
    priority: 'low',
    targetAudience: 'member',
    publishedAt: '2024-10-14T12:00:00Z',
    isPinned: false,
    viewCount: 445
  },
  {
    id: 'ann-9',
    title: 'Board Secretary Meeting - November 3rd',
    content: 'All board secretaries are invited to join our quarterly virtual meeting on November 3rd at 7:00 PM EST. Agenda includes dues collection updates, new member approval processes, and Q&A. Zoom link will be sent via email.',
    authorId: 'admin-1',
    authorName: 'Donnie Smith',
    author: 'Donnie Smith',
    date: '2024-10-18',
    priority: 'high',
    targetAudience: 'secretary',
    publishedAt: '2024-10-18T15:00:00Z',
    expiresAt: '2024-11-03T19:00:00Z',
    isPinned: false,
    viewCount: 289
  },
  {
    id: 'ann-10',
    title: 'Inside the Lines - October Issue Published',
    content: 'The latest Inside the Lines newsletter is now available. This month features an interview with a veteran official, training tips for managing coaches, and upcoming event listings. Read it in the Resources section.',
    authorId: 'admin-1',
    authorName: 'Donnie Smith',
    author: 'Donnie Smith',
    date: '2024-10-01',
    priority: 'low',
    targetAudience: 'all',
    publishedAt: '2024-10-01T08:00:00Z',
    isPinned: false,
    viewCount: 678
  }
];
