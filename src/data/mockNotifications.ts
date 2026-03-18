export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// Generate notifications for different user types
export function getMockNotificationsForUser(userId: string, userRole: 'admin' | 'secretary' | 'member'): Notification[] {
  const baseDate = new Date('2024-10-20T10:00:00Z');
  
  if (userRole === 'admin') {
    return [
      {
        id: 'notif-admin-1',
        userId,
        title: 'Board 15 Payment Overdue',
        message: 'Board 15 has not submitted their dues payment. Invoice was due on November 30th.',
        type: 'alert',
        linkUrl: '/admin/finance',
        isRead: false,
        createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: 'notif-admin-2',
        userId,
        title: '25 Pending Member Applications',
        message: 'There are 25 member applications awaiting board secretary approval across all boards.',
        type: 'info',
        linkUrl: '/admin/members',
        isRead: false,
        createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 5).toISOString()
      },
      {
        id: 'notif-admin-3',
        userId,
        title: 'Training Completion Rate: 84%',
        message: 'Overall training completion is at 84%. Board 15 needs attention (67% completion).',
        type: 'warning',
        linkUrl: '/admin/training',
        isRead: true,
        createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24).toISOString()
      },
      {
        id: 'notif-admin-4',
        userId,
        title: 'New Resource Uploaded',
        message: 'Play of the Week - Episode 12 has been uploaded to the Resources library.',
        type: 'success',
        linkUrl: '/admin/resources',
        isRead: true,
        createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 48).toISOString()
      },
      {
        id: 'notif-admin-5',
        userId,
        title: 'Board 42 Payment Received',
        message: 'Bronx Officials Association (Board 42) has submitted payment of $10,920.',
        type: 'success',
        linkUrl: '/admin/finance',
        isRead: true,
        createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 72).toISOString()
      }
    ];
  }
  
  if (userRole === 'secretary') {
    return [
      {
        id: 'notif-sec-1',
        userId,
        title: '5 Pending Member Applications',
        message: 'You have 5 new member applications waiting for your approval.',
        type: 'alert',
        linkUrl: '/secretary/members',
        isRead: false,
        createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 3).toISOString()
      },
      {
        id: 'notif-sec-2',
        userId,
        title: 'Dues Invoice Due in 7 Days',
        message: 'Your board dues invoice of $10,920 is due on November 30th.',
        type: 'warning',
        linkUrl: '/secretary/dues',
        isRead: false,
        createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 12).toISOString()
      },
      {
        id: 'notif-sec-3',
        userId,
        title: '23 Members Missing Required Training',
        message: '23 members have not completed the 2025 NFHS Rules Changes course.',
        type: 'warning',
        linkUrl: '/secretary/training',
        isRead: true,
        createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24).toISOString()
      },
      {
        id: 'notif-sec-4',
        userId,
        title: 'New Announcement Posted',
        message: 'IAABO HQ has posted: Board Secretary Meeting - November 3rd',
        type: 'info',
        linkUrl: '/secretary/announcements',
        isRead: true,
        createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 36).toISOString()
      },
      {
        id: 'notif-sec-5',
        userId,
        title: 'Training Completion Update',
        message: 'Your board training completion is now at 84%, up from 79% last week!',
        type: 'success',
        linkUrl: '/secretary/training',
        isRead: true,
        createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 72).toISOString()
      }
    ];
  }
  
  // Member notifications
  return [
    {
      id: 'notif-mem-1',
      userId,
      title: 'Complete Required Training',
      message: 'You have 1 required course to complete: 2025 NFHS Rules Changes (45 min)',
      type: 'alert',
      linkUrl: '/member/training',
      isRead: false,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 4).toISOString()
    },
    {
      id: 'notif-mem-2',
      userId,
      title: 'New Video Available',
      message: 'Play of the Week - Episode 12 is now available in the Resources library.',
      type: 'info',
      linkUrl: '/member/resources',
      isRead: false,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 18).toISOString()
    },
    {
      id: 'notif-mem-3',
      userId,
      title: 'Certificate Ready for Download',
      message: 'Your certificate for "Three-Person Mechanics" is ready to download.',
      type: 'success',
      linkUrl: '/member/training',
      isRead: true,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 48).toISOString()
    },
    {
      id: 'notif-mem-4',
      userId,
      title: 'Regional Clinic - November 12',
      message: 'Register now for the Northeast Regional Training Clinic. Only 15 spots remaining!',
      type: 'info',
      linkUrl: '/member/training',
      isRead: true,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 72).toISOString()
    },
    {
      id: 'notif-mem-5',
      userId,
      title: 'Dues Payment Confirmed',
      message: 'Your board has submitted dues payment. Your membership is active for 2024-2025.',
      type: 'success',
      linkUrl: '/member/profile',
      isRead: true,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 120).toISOString()
    },
    {
      id: 'notif-mem-6',
      userId,
      title: 'Inside the Lines - October Issue',
      message: 'The latest Inside the Lines newsletter is now available in Resources.',
      type: 'info',
      linkUrl: '/member/resources',
      isRead: true,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 144).toISOString()
    }
  ];
}

export const mockNotifications = {
  getMockNotificationsForUser
};
