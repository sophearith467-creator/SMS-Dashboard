import type { ActivityReport, MileageClaim, SettlementRecord, VehicleRequest } from '../types/annex';

export const ACTIVITY_REPORTS: ActivityReport[] = [
  {
    id: 1,
    missionId: 1,
    requesterName: 'System Admin',
    requesterId: 'u-001',
    position: 'Administrator',
    function: 'Technology',
    business: 'OneMore Group',
    basedLocation: 'Phnom Penh',
    destinationLocation: 'Siem Reap',
    travelStartDate: '2026-09-20',
    travelEndDate: '2026-09-30',
    travelObjectives: 'Attend a technical meeting with the regional team.',
    achievedResults: 'Aligned on the Q4 rollout plan and confirmed the regional support model.',
    nextPlan: 'Follow up with the regional lead in two weeks.',
    attachedDocuments: null,
    requesterSignatureDate: '2026-09-30',
    functionManagerComment: null,
    functionManagerSignatureDate: null,
    bizOpsComment: null,
    bizOpsSignatureDate: null,
    status: 'SUBMITTED',
    createdAt: '2026-09-30T09:00:00Z',
    updatedAt: '2026-09-30T09:00:00Z'
  }
];

export const VEHICLE_REQUESTS: VehicleRequest[] = [
  {
    id: 1,
    missionId: 2,
    requesterName: 'John Doe',
    requesterId: 'u-010',
    position: 'Field Officer',
    function: 'Field Operations',
    business: 'OneMore Group',
    jobLevel: 'STAFF',
    basedLocation: 'Phnom Penh',
    destinationLocation: 'Battambang',
    travelStartDate: '2026-10-01',
    travelEndDate: '2026-10-03',
    travelObjectives: 'Site visit and equipment handover.',
    travelDetails: [
      {
        id: 1,
        date: '2026-10-01',
        origin: 'Phnom Penh',
        destination: 'Battambang',
        purposeOfTravel: 'Site visit',
        distanceKm: 290,
        remarks: null
      }
    ],
    status: 'SUBMITTED',
    createdAt: '2026-09-28T10:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z'
  }
];

export const MILEAGE_CLAIMS: MileageClaim[] = [
  {
    id: 1,
    missionId: 2,
    vehicleRequestId: 1,
    requesterName: 'John Doe',
    requesterId: 'u-010',
    position: 'Field Officer',
    function: 'Field Operations',
    business: 'OneMore Group',
    jobLevel: 'STAFF',
    basedLocation: 'Phnom Penh',
    destinationLocation: 'Battambang',
    travelStartDate: '2026-10-01',
    travelEndDate: '2026-10-03',
    travelObjectives: 'Site visit and equipment handover.',
    travelDetails: [
      {
        id: 1,
        date: '2026-10-01',
        origin: 'Phnom Penh',
        destination: 'Battambang',
        purposeOfTravel: 'Site visit',
        distanceKm: 290,
        remarks: null
      }
    ],
    totalDistanceKm: 290,
    totalClaimAmount: 58,
    status: 'SUBMITTED',
    createdAt: '2026-10-04T08:00:00Z',
    updatedAt: '2026-10-04T08:00:00Z'
  }
];

export const SETTLEMENTS: SettlementRecord[] = [
  {
    id: 1,
    missionId: 3,
    totalAllowance: 420,
    totalMileageClaim: 58,
    grandTotal: 478,
    status: 'SUBMITTED',
    settledAt: null,
    settledBy: null,
    notes: null,
    createdAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-05T08:00:00Z'
  }
];
