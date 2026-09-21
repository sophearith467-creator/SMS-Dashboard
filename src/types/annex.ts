export type RecordStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface ActivityReport {
  id: string;
  reference: string;
  missionReference: string;
  title: string;
  authorName: string;
  submittedAt: string;
  periodStart: string;
  periodEnd: string;
  objectivesMet: number;
  objectivesTotal: number;
  status: RecordStatus;
  summary: string;
}

export interface VehicleRequest {
  id: string;
  reference: string;
  missionReference: string;
  requesterName: string;
  vehicleType: 'SEDAN' | 'SUV' | 'PICKUP' | 'MINIBUS';
  pickupLocation: string;
  dropoffLocation: string;
  pickupAt: string;
  passengers: number;
  driverRequired: boolean;
  status: RecordStatus;
}

export interface MileageClaim {
  id: string;
  reference: string;
  missionReference: string;
  claimantName: string;
  vehiclePlate: string;
  distanceKm: number;
  ratePerKm: number;
  amount: number;
  currency: string;
  travelDate: string;
  status: RecordStatus;
}

export interface SettlementRecord {
  id: string;
  reference: string;
  missionReference: string;
  missionTitle: string;
  staffName: string;
  advanceAmount: number;
  actualAmount: number;
  balance: number;
  currency: string;
  submittedAt: string;
  status: RecordStatus;
}