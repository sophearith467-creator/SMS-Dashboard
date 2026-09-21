import type { ApprovalStage, ApprovalStep, Mission } from '../types/mission';
import type { Role } from '../types/auth';

const STAGE_OWNERS: Record<ApprovalStage, {name: string;role: Role;}> = {
  FUNCTION_MANAGER: { name: 'Daniel Reyes', role: 'ROLE_FUNCTION_MANAGER' },
  HRBP: { name: 'Lena Fischer', role: 'ROLE_HRBP' },
  FINANCE: { name: 'Tomas Eriksen', role: 'ROLE_FINANCE' },
  BIZOPS: { name: 'Amara Okoye', role: 'ROLE_BIZOPS' },
  EXECUTIVE: { name: 'Priya Nair', role: 'ROLE_EXECUTIVE' }
};

export const APPROVAL_CHAIN: ApprovalStage[] = [
'FUNCTION_MANAGER',
'HRBP',
'FINANCE',
'BIZOPS',
'EXECUTIVE'];


export function buildApprovalChain(
missionId: string,
decided: Array<{stage: ApprovalStage;decision: 'APPROVED' | 'REJECTED';decidedAt: string;comment?: string;}> = [])
: ApprovalStep[] {
  return APPROVAL_CHAIN.map((stage) => {
    const match = decided.find((d) => d.stage === stage);
    return {
      id: `${missionId}-${stage.toLowerCase()}`,
      stage,
      approverName: STAGE_OWNERS[stage].name,
      approverRole: STAGE_OWNERS[stage].role,
      decision: match ? match.decision : 'PENDING',
      decidedAt: match?.decidedAt,
      comment: match?.comment
    };
  });
}

export const MISSIONS: Mission[] = [
{
  id: 'm-1042',
  reference: 'MSN-1042',
  title: 'Q4 field audit — Northern corridor',
  purpose:
  'On-site verification of distribution partners and reconciliation of Q3 inventory variances across four depots.',
  requesterId: 'u-006',
  requesterName: 'James Okafor',
  department: 'Field Operations',
  destination: 'Kumasi',
  country: 'Ghana',
  startDate: '2026-09-28',
  endDate: '2026-10-04',
  status: 'PENDING',
  transport: 'AIR',
  estimatedCost: 4820,
  currency: 'USD',
  createdAt: '2026-09-18T09:14:00Z',
  priority: 'HIGH',
  approvals: buildApprovalChain('m-1042', [
  {
    stage: 'FUNCTION_MANAGER',
    decision: 'APPROVED',
    decidedAt: '2026-09-18T15:02:00Z',
    comment: 'Aligned with the Q4 audit plan. Approved.'
  },
  { stage: 'HRBP', decision: 'APPROVED', decidedAt: '2026-09-19T08:40:00Z' }]
  )
},
{
  id: 'm-1041',
  reference: 'MSN-1041',
  title: 'Partner onboarding workshop',
  purpose: 'Facilitate two-day onboarding for three new logistics partners and sign service addenda.',
  requesterId: 'u-002',
  requesterName: 'Daniel Reyes',
  department: 'Field Operations',
  destination: 'Nairobi',
  country: 'Kenya',
  startDate: '2026-09-24',
  endDate: '2026-09-27',
  status: 'APPROVED',
  transport: 'AIR',
  estimatedCost: 3640,
  currency: 'USD',
  createdAt: '2026-09-12T11:30:00Z',
  priority: 'NORMAL',
  approvals: buildApprovalChain('m-1041', [
  { stage: 'FUNCTION_MANAGER', decision: 'APPROVED', decidedAt: '2026-09-12T16:10:00Z' },
  { stage: 'HRBP', decision: 'APPROVED', decidedAt: '2026-09-13T09:00:00Z' },
  { stage: 'FINANCE', decision: 'APPROVED', decidedAt: '2026-09-14T13:25:00Z', comment: 'Budget line FO-204 has capacity.' },
  { stage: 'BIZOPS', decision: 'APPROVED', decidedAt: '2026-09-15T10:12:00Z' },
  { stage: 'EXECUTIVE', decision: 'APPROVED', decidedAt: '2026-09-15T17:45:00Z' }]
  )
},
{
  id: 'm-1040',
  reference: 'MSN-1040',
  title: 'Regional finance review',
  purpose: 'Quarterly close support and control walkthroughs with the regional finance team.',
  requesterId: 'u-004',
  requesterName: 'Tomas Eriksen',
  department: 'Finance',
  destination: 'Lisbon',
  country: 'Portugal',
  startDate: '2026-09-15',
  endDate: '2026-09-19',
  status: 'IN_PROGRESS',
  transport: 'AIR',
  estimatedCost: 5120,
  currency: 'USD',
  createdAt: '2026-09-02T08:05:00Z',
  priority: 'NORMAL',
  approvals: buildApprovalChain('m-1040', [
  { stage: 'FUNCTION_MANAGER', decision: 'APPROVED', decidedAt: '2026-09-02T14:00:00Z' },
  { stage: 'HRBP', decision: 'APPROVED', decidedAt: '2026-09-03T09:30:00Z' },
  { stage: 'FINANCE', decision: 'APPROVED', decidedAt: '2026-09-03T15:40:00Z' },
  { stage: 'BIZOPS', decision: 'APPROVED', decidedAt: '2026-09-04T11:20:00Z' },
  { stage: 'EXECUTIVE', decision: 'APPROVED', decidedAt: '2026-09-05T08:55:00Z' }]
  )
},
{
  id: 'm-1039',
  reference: 'MSN-1039',
  title: 'Warehouse relocation supervision',
  purpose: 'Supervise physical relocation of the central warehouse and validate asset registers.',
  requesterId: 'u-006',
  requesterName: 'James Okafor',
  department: 'Field Operations',
  destination: 'Tema',
  country: 'Ghana',
  startDate: '2026-09-08',
  endDate: '2026-09-12',
  status: 'COMPLETED',
  transport: 'ROAD',
  estimatedCost: 1450,
  currency: 'USD',
  createdAt: '2026-08-26T10:44:00Z',
  priority: 'NORMAL',
  approvals: buildApprovalChain('m-1039', [
  { stage: 'FUNCTION_MANAGER', decision: 'APPROVED', decidedAt: '2026-08-26T16:00:00Z' },
  { stage: 'HRBP', decision: 'APPROVED', decidedAt: '2026-08-27T09:10:00Z' },
  { stage: 'FINANCE', decision: 'APPROVED', decidedAt: '2026-08-27T14:35:00Z' },
  { stage: 'BIZOPS', decision: 'APPROVED', decidedAt: '2026-08-28T08:20:00Z' },
  { stage: 'EXECUTIVE', decision: 'APPROVED', decidedAt: '2026-08-28T12:05:00Z' }]
  )
},
{
  id: 'm-1038',
  reference: 'MSN-1038',
  title: 'Talent pipeline roadshow',
  purpose: 'University recruitment roadshow across three campuses with the people team.',
  requesterId: 'u-003',
  requesterName: 'Lena Fischer',
  department: 'People & Culture',
  destination: 'Cape Town',
  country: 'South Africa',
  startDate: '2026-10-06',
  endDate: '2026-10-11',
  status: 'PENDING',
  transport: 'AIR',
  estimatedCost: 6180,
  currency: 'USD',
  createdAt: '2026-09-19T13:52:00Z',
  priority: 'NORMAL',
  approvals: buildApprovalChain('m-1038', [
  { stage: 'FUNCTION_MANAGER', decision: 'APPROVED', decidedAt: '2026-09-19T18:10:00Z' }]
  )
},
{
  id: 'm-1037',
  reference: 'MSN-1037',
  title: 'Vendor dispute resolution',
  purpose: 'Face-to-face negotiation with a supplier over delayed shipments and penalty clauses.',
  requesterId: 'u-008',
  requesterName: 'Kwame Mensah',
  department: 'Business Operations',
  destination: 'Dubai',
  country: 'UAE',
  startDate: '2026-09-22',
  endDate: '2026-09-25',
  status: 'REJECTED',
  transport: 'AIR',
  estimatedCost: 7400,
  currency: 'USD',
  createdAt: '2026-09-09T07:18:00Z',
  priority: 'HIGH',
  approvals: buildApprovalChain('m-1037', [
  { stage: 'FUNCTION_MANAGER', decision: 'APPROVED', decidedAt: '2026-09-09T12:00:00Z' },
  { stage: 'HRBP', decision: 'APPROVED', decidedAt: '2026-09-10T08:45:00Z' },
  {
    stage: 'FINANCE',
    decision: 'REJECTED',
    decidedAt: '2026-09-11T10:30:00Z',
    comment: 'Cost exceeds the remaining travel envelope. Resolve remotely this quarter.'
  }]
  )
},
{
  id: 'm-1036',
  reference: 'MSN-1036',
  title: 'Depot safety inspection',
  purpose: 'Annual health and safety inspection with the compliance officer.',
  requesterId: 'u-002',
  requesterName: 'Daniel Reyes',
  department: 'Field Operations',
  destination: 'Takoradi',
  country: 'Ghana',
  startDate: '2026-10-14',
  endDate: '2026-10-16',
  status: 'DRAFT',
  transport: 'COMPANY_VEHICLE',
  estimatedCost: 880,
  currency: 'USD',
  createdAt: '2026-09-20T06:30:00Z',
  priority: 'LOW',
  approvals: buildApprovalChain('m-1036')
},
{
  id: 'm-1035',
  reference: 'MSN-1035',
  title: 'Programme impact assessment',
  purpose: 'Collect beneficiary data and run focus groups for the mid-term impact assessment.',
  requesterId: 'u-007',
  requesterName: 'Sofia Marino',
  department: 'Programmes',
  destination: 'Kigali',
  country: 'Rwanda',
  startDate: '2026-08-18',
  endDate: '2026-08-26',
  status: 'SETTLED',
  transport: 'AIR',
  estimatedCost: 5960,
  currency: 'USD',
  createdAt: '2026-08-01T09:00:00Z',
  priority: 'NORMAL',
  approvals: buildApprovalChain('m-1035', [
  { stage: 'FUNCTION_MANAGER', decision: 'APPROVED', decidedAt: '2026-08-01T14:20:00Z' },
  { stage: 'HRBP', decision: 'APPROVED', decidedAt: '2026-08-02T10:00:00Z' },
  { stage: 'FINANCE', decision: 'APPROVED', decidedAt: '2026-08-02T16:15:00Z' },
  { stage: 'BIZOPS', decision: 'APPROVED', decidedAt: '2026-08-03T09:40:00Z' },
  { stage: 'EXECUTIVE', decision: 'APPROVED', decidedAt: '2026-08-04T11:00:00Z' }]
  )
},
{
  id: 'm-1034',
  reference: 'MSN-1034',
  title: 'Board offsite facilitation',
  purpose: 'Strategy offsite facilitation and preparation of the annual operating plan.',
  requesterId: 'u-005',
  requesterName: 'Priya Nair',
  department: 'Executive Office',
  destination: 'Geneva',
  country: 'Switzerland',
  startDate: '2026-10-20',
  endDate: '2026-10-23',
  status: 'PENDING',
  transport: 'AIR',
  estimatedCost: 9250,
  currency: 'USD',
  createdAt: '2026-09-17T15:10:00Z',
  priority: 'HIGH',
  approvals: buildApprovalChain('m-1034', [
  { stage: 'FUNCTION_MANAGER', decision: 'APPROVED', decidedAt: '2026-09-17T18:00:00Z' },
  { stage: 'HRBP', decision: 'APPROVED', decidedAt: '2026-09-18T09:20:00Z' },
  { stage: 'FINANCE', decision: 'APPROVED', decidedAt: '2026-09-18T14:05:00Z' }]
  )
},
{
  id: 'm-1033',
  reference: 'MSN-1033',
  title: 'Fleet maintenance review',
  purpose: 'Assess the service contract performance for the regional vehicle fleet.',
  requesterId: 'u-008',
  requesterName: 'Kwame Mensah',
  department: 'Business Operations',
  destination: 'Accra',
  country: 'Ghana',
  startDate: '2026-09-01',
  endDate: '2026-09-03',
  status: 'COMPLETED',
  transport: 'COMPANY_VEHICLE',
  estimatedCost: 640,
  currency: 'USD',
  createdAt: '2026-08-20T08:00:00Z',
  priority: 'LOW',
  approvals: buildApprovalChain('m-1033', [
  { stage: 'FUNCTION_MANAGER', decision: 'APPROVED', decidedAt: '2026-08-20T12:00:00Z' },
  { stage: 'HRBP', decision: 'APPROVED', decidedAt: '2026-08-21T09:00:00Z' },
  { stage: 'FINANCE', decision: 'APPROVED', decidedAt: '2026-08-21T15:30:00Z' },
  { stage: 'BIZOPS', decision: 'APPROVED', decidedAt: '2026-08-22T10:10:00Z' },
  { stage: 'EXECUTIVE', decision: 'APPROVED', decidedAt: '2026-08-22T16:40:00Z' }]
  )
},
{
  id: 'm-1032',
  reference: 'MSN-1032',
  title: 'Data centre migration oversight',
  purpose: 'Oversee the physical migration of servers to the new colocation facility.',
  requesterId: 'u-001',
  requesterName: 'Amara Okoye',
  department: 'Business Operations',
  destination: 'Frankfurt',
  country: 'Germany',
  startDate: '2026-10-02',
  endDate: '2026-10-05',
  status: 'APPROVED',
  transport: 'AIR',
  estimatedCost: 4380,
  currency: 'USD',
  createdAt: '2026-09-06T10:25:00Z',
  priority: 'HIGH',
  approvals: buildApprovalChain('m-1032', [
  { stage: 'FUNCTION_MANAGER', decision: 'APPROVED', decidedAt: '2026-09-06T15:00:00Z' },
  { stage: 'HRBP', decision: 'APPROVED', decidedAt: '2026-09-07T09:15:00Z' },
  { stage: 'FINANCE', decision: 'APPROVED', decidedAt: '2026-09-07T17:00:00Z' },
  { stage: 'BIZOPS', decision: 'APPROVED', decidedAt: '2026-09-08T11:30:00Z' },
  { stage: 'EXECUTIVE', decision: 'APPROVED', decidedAt: '2026-09-09T08:10:00Z' }]
  )
},
{
  id: 'm-1031',
  reference: 'MSN-1031',
  title: 'Community liaison visit',
  purpose: 'Quarterly engagement with community leaders in the southern operating zone.',
  requesterId: 'u-007',
  requesterName: 'Sofia Marino',
  department: 'Programmes',
  destination: 'Ho',
  country: 'Ghana',
  startDate: '2026-09-29',
  endDate: '2026-09-30',
  status: 'PENDING',
  transport: 'ROAD',
  estimatedCost: 520,
  currency: 'USD',
  createdAt: '2026-09-16T12:40:00Z',
  priority: 'LOW',
  approvals: buildApprovalChain('m-1031')
}];