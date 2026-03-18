export interface AIActivity {
  id: string;
  timestamp: string;
  agentType: 'onboarding' | 'compliance' | 'communication';
  action: string;
  targetId: string;
  targetName: string;
  status: 'success' | 'error' | 'pending';
  details: any;
  aiReasoning?: string;
}

const STORAGE_KEY = 'ai_activity_log';
const MAX_LOGS = 100;

export const logAIActivity = (activity: Omit<AIActivity, 'id' | 'timestamp'>): void => {
  const logs = getAllActivity();
  
  const newActivity: AIActivity = {
    ...activity,
    id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };

  logs.unshift(newActivity);
  
  // Keep only the latest MAX_LOGS entries
  const trimmedLogs = logs.slice(0, MAX_LOGS);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedLogs));
};

export const getAllActivity = (): AIActivity[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const getRecentActivity = (agentType?: string, limit: number = 10): AIActivity[] => {
  const logs = getAllActivity();
  
  const filtered = agentType 
    ? logs.filter(log => log.agentType === agentType)
    : logs;
  
  return filtered.slice(0, limit);
};

export const getActivityStats = (agentType: string, dateRange: 'today' | 'week' | 'month'): {
  total: number;
  successful: number;
  errors: number;
  pending: number;
} => {
  const logs = getAllActivity().filter(log => log.agentType === agentType);
  
  const now = new Date();
  let startDate: Date;
  
  switch (dateRange) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }
  
  const filtered = logs.filter(log => new Date(log.timestamp) >= startDate);
  
  return {
    total: filtered.length,
    successful: filtered.filter(l => l.status === 'success').length,
    errors: filtered.filter(l => l.status === 'error').length,
    pending: filtered.filter(l => l.status === 'pending').length
  };
};

export const clearActivityLog = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
