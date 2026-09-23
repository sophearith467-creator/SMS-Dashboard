export type JobLevel =
  | 'EXECUTIVE'
  | 'FUNCTION_MANAGER'
  | 'SUB_FUNCTION_MANAGER'
  | 'STAFF'
  | 'DRIVER';

export type LocationTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export type MissionStatus =
  | 'DRAFT' | 'SUBMITTED'
  | 'FM_REVIEW' | 'HRBP_REVIEW' | 'FINANCE_REVIEW' | 'BIZOPS_REVIEW' | 'EXECUTIVE_REVIEW'
  | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  | 'REPORT_SUBMITTED' | 'SETTLED';

export type ApprovalStage =
  | 'FUNCTION_MANAGER' | 'HRBP' | 'FINANCE' | 'BIZOPS' | 'EXECUTIVE';

export interface Mission {
  id: number;
  missionCode: string | null;
  requesterId: number;
  requesterName: string;
  position: string;
  functionName: string;
  business: string;
  jobLevel: JobLevel;
  basedLocation: string;
  destinationLocation: string;
  locationTier: LocationTier;
  travelObjectives: string;

  departureDate: string;
  departureTime: string | null;
  arrivalDate: string;
  arrivalTime: string | null;
  numberOfTravelDays: number;

  breakfastAmount: number | null;
  breakfastQuantity: number | null;
  breakfastTotal: number | null;
  lunchAmount: number | null;
  lunchQuantity: number | null;
  lunchTotal: number | null;
  dinnerAmount: number | null;
  dinnerQuantity: number | null;
  dinnerTotal: number | null;

  accommodationAmountPerNight: number | null;
  numberOfNightStay: number | null;
  accommodationTotal: number | null;

  totalExpense: number | null;
  description: string | null;

  status: MissionStatus;
  currentApprovalStep: ApprovalStage | null;

  createdAt: string;
  updatedAt: string;
}

export interface MissionInput {
  position: string;
  functionName: string;
  business: string;
  jobLevel: JobLevel;
  basedLocation: string;
  destinationLocation: string;
  locationTier: LocationTier;
  travelObjectives: string;
  departureDate: string;
  departureTime?: string;
  arrivalDate: string;
  arrivalTime?: string;
  numberOfTravelDays: number;
  description?: string;
  onBehalfOfUserId?: number;
}

export interface AllowanceLine {
  label: string;
  description: string;
  amount: number;
}

export interface AllowanceBreakdown {
  missionId: number;
  reference: string;
  days: number;
  currency: string;
  dailyRate: number;
  lines: AllowanceLine[];
  total: number;
  calculatedAt: string;
}