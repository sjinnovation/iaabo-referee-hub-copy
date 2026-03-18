export interface Committee {
  id: string;
  name: string;
  description: string;
  year: string;
  isActive: boolean;
  chairId?: string;
  chairName?: string;
}

export interface CommitteeMember {
  id: string;
  committeeId: string;
  memberId: string;
  memberName: string;
  role: 'chair' | 'vice_chair' | 'member';
  appointedDate: string;
}

export interface Award {
  id: string;
  memberId: string;
  memberName: string;
  awardType: string;
  awardName: string;
  yearReceived: string;
  notes?: string;
}

export const mockCommittees: Committee[] = [
  {
    id: 'comm-1',
    name: 'Rules Interpretation Committee',
    description: 'Reviews and provides guidance on complex rule scenarios and interpretations.',
    year: '2024-2025',
    isActive: true,
    chairId: 'member-12',
    chairName: 'James Wilson'
  },
  {
    id: 'comm-2',
    name: 'Training & Development Committee',
    description: 'Oversees training programs, certifications, and educational content.',
    year: '2024-2025',
    isActive: true,
    chairId: 'member-45',
    chairName: 'Patricia Anderson'
  },
  {
    id: 'comm-3',
    name: 'Membership Committee',
    description: 'Handles new member applications, retention initiatives, and recruitment.',
    year: '2024-2025',
    isActive: true,
    chairId: 'member-78',
    chairName: 'Michael Thomas'
  },
  {
    id: 'comm-4',
    name: 'Finance Committee',
    description: 'Manages organizational budget, dues structure, and financial planning.',
    year: '2024-2025',
    isActive: true,
    chairId: 'member-123',
    chairName: 'Sarah Martinez'
  },
  {
    id: 'comm-5',
    name: 'Awards & Recognition Committee',
    description: 'Selects recipients for annual awards and service recognition programs.',
    year: '2024-2025',
    isActive: true,
    chairId: 'member-156',
    chairName: 'Robert Garcia'
  }
];

export const mockCommitteeMembers: CommitteeMember[] = [
  { id: 'cm-1', committeeId: 'comm-1', memberId: 'member-12', memberName: 'James Wilson', role: 'chair', appointedDate: '2024-07-01T00:00:00Z' },
  { id: 'cm-2', committeeId: 'comm-1', memberId: 'member-34', memberName: 'Jennifer Brown', role: 'vice_chair', appointedDate: '2024-07-01T00:00:00Z' },
  { id: 'cm-3', committeeId: 'comm-1', memberId: 'member-56', memberName: 'David Lee', role: 'member', appointedDate: '2024-07-01T00:00:00Z' },
  { id: 'cm-4', committeeId: 'comm-1', memberId: 'member-89', memberName: 'Lisa Johnson', role: 'member', appointedDate: '2024-07-01T00:00:00Z' },
  
  { id: 'cm-5', committeeId: 'comm-2', memberId: 'member-45', memberName: 'Patricia Anderson', role: 'chair', appointedDate: '2024-07-01T00:00:00Z' },
  { id: 'cm-6', committeeId: 'comm-2', memberId: 'member-67', memberName: 'Christopher Davis', role: 'vice_chair', appointedDate: '2024-07-01T00:00:00Z' },
  { id: 'cm-7', committeeId: 'comm-2', memberId: 'member-101', memberName: 'Michelle Rodriguez', role: 'member', appointedDate: '2024-07-01T00:00:00Z' },
  
  { id: 'cm-8', committeeId: 'comm-3', memberId: 'member-78', memberName: 'Michael Thomas', role: 'chair', appointedDate: '2024-07-01T00:00:00Z' },
  { id: 'cm-9', committeeId: 'comm-3', memberId: 'member-112', memberName: 'Nancy Taylor', role: 'vice_chair', appointedDate: '2024-07-01T00:00:00Z' },
  { id: 'cm-10', committeeId: 'comm-3', memberId: 'member-145', memberName: 'Daniel Moore', role: 'member', appointedDate: '2024-07-01T00:00:00Z' },
  
  { id: 'cm-11', committeeId: 'comm-4', memberId: 'member-123', memberName: 'Sarah Martinez', role: 'chair', appointedDate: '2024-07-01T00:00:00Z' },
  { id: 'cm-12', committeeId: 'comm-4', memberId: 'member-167', memberName: 'Mark Jackson', role: 'vice_chair', appointedDate: '2024-07-01T00:00:00Z' },
  
  { id: 'cm-13', committeeId: 'comm-5', memberId: 'member-156', memberName: 'Robert Garcia', role: 'chair', appointedDate: '2024-07-01T00:00:00Z' },
  { id: 'cm-14', committeeId: 'comm-5', memberId: 'member-189', memberName: 'Betty White', role: 'vice_chair', appointedDate: '2024-07-01T00:00:00Z' },
  { id: 'cm-15', committeeId: 'comm-5', memberId: 'member-223', memberName: 'Thomas Harris', role: 'member', appointedDate: '2024-07-01T00:00:00Z' }
];

export const mockAwards: Award[] = [
  {
    id: 'award-1',
    memberId: 'member-42',
    memberName: 'John Smith',
    awardType: 'service',
    awardName: '25 Years of Service Award',
    yearReceived: '2024',
    notes: 'Recognized for outstanding dedication and mentorship'
  },
  {
    id: 'award-2',
    memberId: 'member-78',
    memberName: 'Michael Thomas',
    awardType: 'excellence',
    awardName: 'Official of the Year',
    yearReceived: '2023',
    notes: 'Exemplary performance and professionalism'
  },
  {
    id: 'award-3',
    memberId: 'member-156',
    memberName: 'Robert Garcia',
    awardType: 'service',
    awardName: '20 Years of Service Award',
    yearReceived: '2024'
  },
  {
    id: 'award-4',
    memberId: 'member-12',
    memberName: 'James Wilson',
    awardType: 'leadership',
    awardName: 'Outstanding Leadership Award',
    yearReceived: '2023',
    notes: 'Led rules committee through major transition'
  },
  {
    id: 'award-5',
    memberId: 'member-234',
    memberName: 'Elizabeth Clark',
    awardType: 'service',
    awardName: '30 Years of Service Award',
    yearReceived: '2024',
    notes: 'Longest-serving female official in board history'
  },
  {
    id: 'award-6',
    memberId: 'member-345',
    memberName: 'Anthony Lewis',
    awardType: 'excellence',
    awardName: 'Rookie Official of the Year',
    yearReceived: '2023',
    notes: 'Exceptional first-year performance'
  }
];
