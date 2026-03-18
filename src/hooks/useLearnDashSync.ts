import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

export type SyncStatus = 'synced' | 'syncing' | 'error';

export function useLearnDashSync(
  loading: boolean,
  error: string | null,
  lastSync: Date | null
) {
  const status = useMemo<SyncStatus>(() => {
    if (loading) return 'syncing';
    if (error) return 'error';
    if (lastSync) return 'synced';
    return 'syncing';
  }, [loading, error, lastSync]);

  const getStatusColor = useCallback(() => {
    switch (status) {
      case 'synced':
        return 'bg-green-500';
      case 'syncing':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }, [status]);

  const computeStatusText = useCallback(() => {
    if (loading) return 'Syncing...';
    if (error) return 'Sync failed';
    if (!lastSync) return 'Not synced';
    
    const now = Date.now();
    const syncTime = lastSync.getTime();
    const diffMs = now - syncTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  }, [loading, error, lastSync]);

  const [statusText, setStatusText] = useState(() => computeStatusText());
  const computeStatusTextRef = useRef(computeStatusText);
  computeStatusTextRef.current = computeStatusText;

  useEffect(() => {
    const update = () => {
      setStatusText(computeStatusTextRef.current());
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [loading, error, lastSync]);

  return {
    status,
    statusColor: getStatusColor(),
    statusText,
  };
}
