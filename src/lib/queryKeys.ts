export const queryKeys = {
  analytics: {
    summary: ['analytics', 'missions', 'summary'] as const,
    spend: ['analytics', 'allowances', 'spend'] as const,
    turnaround: ['analytics', 'approvals', 'turnaround'] as const,
    exceptions: ['analytics', 'exceptions'] as const
  },
  missions: {
    all: ['missions'] as const,
    detail: (id: string) => ['missions', id] as const,
    allowance: (id: string) => ['missions', id, 'allowances'] as const
  },
  approvals: {
    pending: ['approvals', 'pending'] as const,
    history: (missionId: number) => ['approvals', missionId, 'history'] as const
  },
  annexes: {
    activityReports: ['annexes', 'activity-reports'] as const,
    vehicleRequests: ['annexes', 'vehicle-requests'] as const,
    mileageClaims: ['annexes', 'mileage-claims'] as const,
    settlements: ['settlements'] as const
  },
  users: ['users'] as const
};