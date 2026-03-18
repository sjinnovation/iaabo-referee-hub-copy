export interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  courseEnrolled: string;
  registrationDate: string;
  source: 'iaabou' | 'manual';
  status: 'pending-review' | 'duplicate-found' | 'profile-created' | 'board-assigned' | 'activated';
  duplicateChecked: boolean;
  hasDuplicate: boolean;
  duplicateMemberId?: string;
  createdProfileId?: string;
  assignedBoardId?: string;
  notes?: string;
}

export const mockRegistrations: Registration[] = [
  {
    id: 'reg-1',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    email: 'michael.rodriguez@email.com',
    phone: '(555) 234-5678',
    courseEnrolled: 'NFHS Rules Test 2025',
    registrationDate: '2024-10-08T10:30:00Z',
    source: 'iaabou',
    status: 'pending-review',
    duplicateChecked: false,
    hasDuplicate: false
  },
  {
    id: 'reg-2',
    firstName: 'Sarah',
    lastName: 'Thompson',
    email: 'sarah.t@email.com',
    phone: '(555) 876-5432',
    courseEnrolled: 'Three-Person Mechanics Course',
    registrationDate: '2024-10-08T09:15:00Z',
    source: 'iaabou',
    status: 'pending-review',
    duplicateChecked: false,
    hasDuplicate: false
  },
  {
    id: 'reg-3',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@email.com',
    phone: '(555) 123-9876',
    courseEnrolled: 'NFHS Rules Test 2025',
    registrationDate: '2024-10-08T08:45:00Z',
    source: 'iaabou',
    status: 'profile-created',
    duplicateChecked: true,
    hasDuplicate: false,
    createdProfileId: 'member-123',
    notes: 'New member profile created - ready for board assignment'
  },
  {
    id: 'reg-4',
    firstName: 'Emily',
    lastName: 'Chen',
    email: 'emily.chen@email.com',
    phone: '(555) 456-7890',
    courseEnrolled: 'Block/Charge Principles',
    registrationDate: '2024-10-07T16:20:00Z',
    source: 'iaabou',
    status: 'pending-review',
    duplicateChecked: false,
    hasDuplicate: false
  },
  {
    id: 'reg-5',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.m@email.com',
    phone: '(555) 789-0123',
    courseEnrolled: 'IAABO Manual 2025',
    registrationDate: '2024-10-07T14:10:00Z',
    source: 'iaabou',
    status: 'board-assigned',
    duplicateChecked: true,
    hasDuplicate: false,
    createdProfileId: 'member-124',
    assignedBoardId: 'board-900',
    notes: 'Member created and assigned to Holding Board 900'
  }
];
