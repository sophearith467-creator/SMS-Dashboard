export type ActivityReportStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type VehicleRequestStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
export type MileageClaimStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
export type SettlementStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PAID';

// Kept for components that still import a generic status union (StatusBadge, etc.)
export type RecordStatus =
  | ActivityReportStatus
  | VehicleRequestStatus
  | MileageClaimStatus
  | SettlementStatus;

export interface ActivityReport {
  id: number;
  missionId: number;
  requesterName: string;
  requesterId: string | null;
  position: string | null;
  function: string | null;
  business: string | null;
  basedLocation: string | null;
  destinationLocation: string | null;
  travelStartDate: string;
  travelEndDate: string;
  travelObjectives: string;
  achievedResults: string;
  nextPlan: string | null;
  attachedDocuments: string | null;
  requesterSignatureDate: string | null;
  functionManagerComment: string | null;
  functionManagerSignatureDate: string | null;
  bizOpsComment: string | null;
  bizOpsSignatureDate: string | null;
  status: ActivityReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleTravelDetail {
  id: number;
  date: string;
  origin: string;
  destination: string;
  purposeOfTravel: string | null;
  distanceKm: number;
  remarks: string | null;
}

export interface VehicleTravelDetailInput {
  date: string;
  origin: string;
  destination: string;
  purposeOfTravel: string;
  distanceKm: number;
  remarks: string;
}

export interface CreateVehicleRequestInput {
  requesterName: string;
  requesterId?: string;
  position?: string;
  function?: string;
  business?: string;
  jobLevel?: string;
  basedLocation?: string;
  destinationLocation?: string;
  travelStartDate: string;
  travelEndDate: string;
  travelObjectives: string;
  travelDetails: VehicleTravelDetailInput[];
}

export interface VehicleRequest {
  id: number;
  missionId: number;
  requesterName: string;
  requesterId: string | null;
  position: string | null;
  function: string | null;
  business: string | null;
  jobLevel: string | null;
  basedLocation: string | null;
  destinationLocation: string | null;
  travelStartDate: string;
  travelEndDate: string;
  travelObjectives: string;
  travelDetails: VehicleTravelDetail[];
  status: VehicleRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MileageTravelDetail {
  id: number;
  date: string;
  origin: string;
  destination: string;
  purposeOfTravel: string | null;
  distanceKm: number;
  remarks: string | null;
}

export interface MileageClaim {
  id: number;
  missionId: number;
  vehicleRequestId: number | null;
  requesterName: string;
  requesterId: string | null;
  position: string | null;
  function: string | null;
  business: string | null;
  jobLevel: string | null;
  basedLocation: string | null;
  destinationLocation: string | null;
  travelStartDate: string;
  travelEndDate: string;
  travelObjectives: string;
  travelDetails: MileageTravelDetail[];
  totalDistanceKm: number;
  totalClaimAmount: number;
  status: MileageClaimStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementRecord {
  id: number;
  missionId: number;
  totalAllowance: number;
  totalMileageClaim: number;
  grandTotal: number;
  status: SettlementStatus;
  settledAt: string | null;
  settledBy: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
