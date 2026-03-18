export interface Board {
  id: string;
  name: string;
  boardNumber: number;
  region: string;
  secretaryId: string;
  secretaryName: string;
  secretaryEmail: string;
  secretary: string; // Alias for secretaryName
  memberCount: number;
  activeStatus: 'active' | 'inactive';
  status: 'active' | 'inactive'; // Alias for activeStatus
  duesStatus: 'paid' | 'unpaid' | 'partial';
  trainingCompletion: number;
  createdAt: string;
}

export const mockBoards: Board[] = [
  {
    id: 'board-1',
    name: 'Brooklyn Basketball Officials',
    boardNumber: 37,
    region: 'New York Metro',
    secretaryId: 'sec-1',
    secretaryName: 'Tom Martinez',
    secretary: 'Tom Martinez',
    secretaryEmail: 'tom.martinez@iaabo37.org',
    memberCount: 87,
    activeStatus: 'active',
    status: 'active',
    duesStatus: 'paid',
    trainingCompletion: 92,
    createdAt: '2020-08-15T10:00:00Z'
  },
  {
    id: 'board-2',
    name: 'Bronx Officials Association',
    boardNumber: 42,
    region: 'New York Metro',
    secretaryId: 'sec-2',
    secretaryName: 'Joe Henderson',
    secretary: 'Joe Henderson',
    secretaryEmail: 'joe.henderson@iaabo42.org',
    memberCount: 312,
    activeStatus: 'active',
    status: 'active',
    duesStatus: 'paid',
    trainingCompletion: 84,
    createdAt: '2018-06-20T10:00:00Z'
  },
  {
    id: 'board-3',
    name: 'Northeast Regional Board',
    boardNumber: 15,
    region: 'Northeast',
    secretaryId: 'sec-3',
    secretaryName: 'Sarah Johnson',
    secretary: 'Sarah Johnson',
    secretaryEmail: 'sarah.johnson@iaabo15.org',
    memberCount: 48,
    activeStatus: 'active',
    status: 'active',
    duesStatus: 'unpaid',
    trainingCompletion: 67,
    createdAt: '2019-09-10T10:00:00Z'
  },
  {
    id: 'board-4',
    name: 'Queens Basketball Officials',
    boardNumber: 118,
    region: 'New York Metro',
    secretaryId: 'sec-4',
    secretaryName: 'Michael Chen',
    secretary: 'Michael Chen',
    secretaryEmail: 'michael.chen@iaabo118.org',
    memberCount: 156,
    activeStatus: 'active',
    status: 'active',
    duesStatus: 'paid',
    trainingCompletion: 88,
    createdAt: '2017-03-25T10:00:00Z'
  },
  {
    id: 'board-5',
    name: 'Midwest Officials Board',
    boardNumber: 23,
    region: 'Midwest',
    secretaryId: 'sec-5',
    secretaryName: 'Lisa Brown',
    secretary: 'Lisa Brown',
    secretaryEmail: 'lisa.brown@iaabo23.org',
    memberCount: 92,
    activeStatus: 'active',
    status: 'active',
    duesStatus: 'partial',
    trainingCompletion: 76,
    createdAt: '2021-01-12T10:00:00Z'
  },
  {
    id: 'board-900',
    name: 'Holding Board 900',
    boardNumber: 900,
    region: 'National',
    secretaryId: 'sec-admin',
    secretaryName: 'IAABO Admin',
    secretary: 'IAABO Admin',
    secretaryEmail: 'admin@iaabo.org',
    memberCount: 45,
    activeStatus: 'active',
    status: 'active',
    duesStatus: 'paid',
    trainingCompletion: 0,
    createdAt: '2020-01-01T00:00:00Z'
  }
];
