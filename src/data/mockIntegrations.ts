export interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'plugin';
  status: 'connected' | 'disconnected' | 'error';
  endpoint?: string;
  lastSync?: string;
  description: string;
  syncCount: number;
}

export interface SyncLog {
  id: string;
  integrationName: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial';
  recordsProcessed: number;
  message: string;
}

export const mockIntegrations: Integration[] = [
  {
    id: 'int-1',
    name: 'LearnDash LMS (IAABO University)',
    type: 'webhook',
    status: 'connected',
    endpoint: 'https://iaabou.org/wp-json/ldlms/v2',
    lastSync: '2024-10-08T14:32:00Z',
    description: 'Receives course completion events and tracks member training progress',
    syncCount: 1247
  }
];

export const mockSyncLogs: SyncLog[] = [
  {
    id: 'log-1',
    integrationName: 'LearnDash LMS',
    timestamp: '2024-10-08T14:32:00Z',
    status: 'success',
    recordsProcessed: 3,
    message: 'Successfully processed 3 course completion events'
  },
  {
    id: 'log-2',
    integrationName: 'LearnDash LMS',
    timestamp: '2024-10-08T13:45:00Z',
    status: 'success',
    recordsProcessed: 2,
    message: 'Synced 2 member training records'
  },
  {
    id: 'log-3',
    integrationName: 'LearnDash LMS',
    timestamp: '2024-10-08T12:15:00Z',
    status: 'success',
    recordsProcessed: 8,
    message: 'Updated 8 member course progress records'
  },
  {
    id: 'log-4',
    integrationName: 'LearnDash LMS',
    timestamp: '2024-10-08T11:20:00Z',
    status: 'success',
    recordsProcessed: 1,
    message: 'Processed 1 course enrollment'
  },
  {
    id: 'log-5',
    integrationName: 'LearnDash LMS',
    timestamp: '2024-10-08T10:30:00Z',
    status: 'success',
    recordsProcessed: 5,
    message: 'Synced 5 course completion certificates'
  },
  {
    id: 'log-6',
    integrationName: 'LearnDash LMS',
    timestamp: '2024-10-08T09:42:00Z',
    status: 'success',
    recordsProcessed: 4,
    message: 'Updated 4 member progression stages'
  }
];
