export interface DuesCycle {
  id: string;
  year: string;
  amountPerMember: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
  amountCollected: number;
  totalAmount: number;
}

export interface BoardInvoice {
  id: string;
  duesCycleId: string;
  boardId: string;
  boardName: string;
  memberCount: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  paymentNotes?: string;
}

export const mockDuesCycles: DuesCycle[] = [
  {
    id: 'cycle-1',
    year: '2025',
    amountPerMember: 35,
    startDate: '2024-09-01T00:00:00Z',
    endDate: '2025-08-31T23:59:59Z',
    status: 'active',
    amountCollected: 19425,
    totalAmount: 23325
  },
  {
    id: 'cycle-2',
    year: '2024',
    amountPerMember: 35,
    startDate: '2023-09-01T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    status: 'closed',
    amountCollected: 22890,
    totalAmount: 22890
  },
  {
    id: 'cycle-3',
    year: '2023',
    amountPerMember: 32,
    startDate: '2022-09-01T00:00:00Z',
    endDate: '2023-08-31T23:59:59Z',
    status: 'closed',
    amountCollected: 20544,
    totalAmount: 20544
  }
];

export const mockBoardInvoices: BoardInvoice[] = [
  {
    id: 'inv-1',
    duesCycleId: 'cycle-1',
    boardId: 'board-1',
    boardName: 'Brooklyn Basketball Officials (Board 37)',
    memberCount: 87,
    totalAmount: 3045,
    status: 'paid',
    issuedDate: '2024-09-15T10:00:00Z',
    dueDate: '2024-11-30T23:59:59Z',
    paidDate: '2024-10-05T14:22:00Z',
    paymentNotes: 'Check #4521 - cleared'
  },
  {
    id: 'inv-2',
    duesCycleId: 'cycle-1',
    boardId: 'board-2',
    boardName: 'Bronx Officials Association (Board 42)',
    memberCount: 312,
    totalAmount: 10920,
    status: 'paid',
    issuedDate: '2024-09-15T10:00:00Z',
    dueDate: '2024-11-30T23:59:59Z',
    paidDate: '2024-09-28T11:15:00Z',
    paymentNotes: 'Wire transfer - confirmed'
  },
  {
    id: 'inv-3',
    duesCycleId: 'cycle-1',
    boardId: 'board-3',
    boardName: 'Northeast Regional Board (Board 15)',
    memberCount: 48,
    totalAmount: 1680,
    status: 'overdue',
    issuedDate: '2024-09-15T10:00:00Z',
    dueDate: '2024-11-30T23:59:59Z'
  },
  {
    id: 'inv-4',
    duesCycleId: 'cycle-1',
    boardId: 'board-4',
    boardName: 'Queens Basketball Officials (Board 118)',
    memberCount: 156,
    totalAmount: 5460,
    status: 'paid',
    issuedDate: '2024-09-15T10:00:00Z',
    dueDate: '2024-11-30T23:59:59Z',
    paidDate: '2024-10-12T09:30:00Z',
    paymentNotes: 'Check #8834 - deposited'
  },
  {
    id: 'inv-5',
    duesCycleId: 'cycle-1',
    boardId: 'board-5',
    boardName: 'Midwest Officials Board (Board 23)',
    memberCount: 92,
    totalAmount: 3220,
    status: 'pending',
    issuedDate: '2024-09-15T10:00:00Z',
    dueDate: '2024-11-30T23:59:59Z'
  }
];
