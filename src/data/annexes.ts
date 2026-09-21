import type {
  ActivityReport,
  MileageClaim,
  SettlementRecord,
  VehicleRequest } from
'../types/annex';

export const ACTIVITY_REPORTS: ActivityReport[] = [
{
  id: 'ar-301',
  reference: 'ANX-B-301',
  missionReference: 'MSN-1039',
  title: 'Warehouse relocation outcome report',
  authorName: 'James Okafor',
  submittedAt: '2026-09-13T09:20:00Z',
  periodStart: '2026-09-08',
  periodEnd: '2026-09-12',
  objectivesMet: 5,
  objectivesTotal: 5,
  status: 'APPROVED',
  summary:
  'All pallets relocated within the planned window. Asset register reconciled with two write-offs recorded.'
},
{
  id: 'ar-300',
  reference: 'ANX-B-300',
  missionReference: 'MSN-1035',
  title: 'Mid-term impact assessment findings',
  authorName: 'Sofia Marino',
  submittedAt: '2026-08-28T15:05:00Z',
  periodStart: '2026-08-18',
  periodEnd: '2026-08-26',
  objectivesMet: 6,
  objectivesTotal: 7,
  status: 'APPROVED',
  summary:
  'Focus groups completed in five of six districts. Household survey deferred pending translator availability.'
},
{
  id: 'ar-299',
  reference: 'ANX-B-299',
  missionReference: 'MSN-1033',
  title: 'Fleet maintenance contract review',
  authorName: 'Kwame Mensah',
  submittedAt: '2026-09-04T11:40:00Z',
  periodStart: '2026-09-01',
  periodEnd: '2026-09-03',
  objectivesMet: 3,
  objectivesTotal: 4,
  status: 'UNDER_REVIEW',
  summary: 'Service levels met for 3 of 4 depots. Recommend re-tendering the northern route contract.'
},
{
  id: 'ar-298',
  reference: 'ANX-B-298',
  missionReference: 'MSN-1040',
  title: 'Regional finance close support',
  authorName: 'Tomas Eriksen',
  submittedAt: '2026-09-19T17:30:00Z',
  periodStart: '2026-09-15',
  periodEnd: '2026-09-19',
  objectivesMet: 4,
  objectivesTotal: 6,
  status: 'SUBMITTED',
  summary: 'Control walkthroughs completed. Two reconciliations carried forward to the next cycle.'
},
{
  id: 'ar-297',
  reference: 'ANX-B-297',
  missionReference: 'MSN-1032',
  title: 'Migration readiness pre-report',
  authorName: 'Amara Okoye',
  submittedAt: '2026-09-18T08:15:00Z',
  periodStart: '2026-09-14',
  periodEnd: '2026-09-17',
  objectivesMet: 2,
  objectivesTotal: 5,
  status: 'DRAFT',
  summary: 'Rack inventory verified. Network cutover plan still pending vendor sign-off.'
}];


export const VEHICLE_REQUESTS: VehicleRequest[] = [
{
  id: 'vr-210',
  reference: 'ANX-C-210',
  missionReference: 'MSN-1042',
  requesterName: 'James Okafor',
  vehicleType: 'SUV',
  pickupLocation: 'Accra HQ',
  dropoffLocation: 'Kumasi Depot',
  pickupAt: '2026-09-28T06:00:00Z',
  passengers: 3,
  driverRequired: true,
  status: 'SUBMITTED'
},
{
  id: 'vr-209',
  reference: 'ANX-C-209',
  missionReference: 'MSN-1036',
  requesterName: 'Daniel Reyes',
  vehicleType: 'PICKUP',
  pickupLocation: 'Accra HQ',
  dropoffLocation: 'Takoradi Yard',
  pickupAt: '2026-10-14T05:30:00Z',
  passengers: 2,
  driverRequired: false,
  status: 'DRAFT'
},
{
  id: 'vr-208',
  reference: 'ANX-C-208',
  missionReference: 'MSN-1031',
  requesterName: 'Sofia Marino',
  vehicleType: 'MINIBUS',
  pickupLocation: 'Programmes Office',
  dropoffLocation: 'Ho Community Centre',
  pickupAt: '2026-09-29T07:00:00Z',
  passengers: 9,
  driverRequired: true,
  status: 'APPROVED'
},
{
  id: 'vr-207',
  reference: 'ANX-C-207',
  missionReference: 'MSN-1039',
  requesterName: 'James Okafor',
  vehicleType: 'PICKUP',
  pickupLocation: 'Tema Port',
  dropoffLocation: 'Central Warehouse',
  pickupAt: '2026-09-08T05:00:00Z',
  passengers: 2,
  driverRequired: true,
  status: 'APPROVED'
},
{
  id: 'vr-206',
  reference: 'ANX-C-206',
  missionReference: 'MSN-1033',
  requesterName: 'Kwame Mensah',
  vehicleType: 'SEDAN',
  pickupLocation: 'Accra HQ',
  dropoffLocation: 'Fleet Workshop',
  pickupAt: '2026-09-01T08:00:00Z',
  passengers: 1,
  driverRequired: false,
  status: 'REJECTED'
}];


export const MILEAGE_CLAIMS: MileageClaim[] = [
{
  id: 'mc-512',
  reference: 'ANX-D-512',
  missionReference: 'MSN-1039',
  claimantName: 'James Okafor',
  vehiclePlate: 'GR-4821-22',
  distanceKm: 412,
  ratePerKm: 0.62,
  amount: 255.44,
  currency: 'USD',
  travelDate: '2026-09-12',
  status: 'PAID'
},
{
  id: 'mc-511',
  reference: 'ANX-D-511',
  missionReference: 'MSN-1033',
  claimantName: 'Kwame Mensah',
  vehiclePlate: 'GT-1190-24',
  distanceKm: 86,
  ratePerKm: 0.62,
  amount: 53.32,
  currency: 'USD',
  travelDate: '2026-09-03',
  status: 'APPROVED'
},
{
  id: 'mc-510',
  reference: 'ANX-D-510',
  missionReference: 'MSN-1031',
  claimantName: 'Sofia Marino',
  vehiclePlate: 'GW-7745-21',
  distanceKm: 168,
  ratePerKm: 0.62,
  amount: 104.16,
  currency: 'USD',
  travelDate: '2026-09-30',
  status: 'SUBMITTED'
},
{
  id: 'mc-509',
  reference: 'ANX-D-509',
  missionReference: 'MSN-1036',
  claimantName: 'Daniel Reyes',
  vehiclePlate: 'GR-2286-23',
  distanceKm: 224,
  ratePerKm: 0.62,
  amount: 138.88,
  currency: 'USD',
  travelDate: '2026-10-16',
  status: 'DRAFT'
},
{
  id: 'mc-508',
  reference: 'ANX-D-508',
  missionReference: 'MSN-1035',
  claimantName: 'Sofia Marino',
  vehiclePlate: 'RW-3310-20',
  distanceKm: 340,
  ratePerKm: 0.58,
  amount: 197.2,
  currency: 'USD',
  travelDate: '2026-08-24',
  status: 'UNDER_REVIEW'
}];


export const SETTLEMENTS: SettlementRecord[] = [
{
  id: 'st-140',
  reference: 'STL-140',
  missionReference: 'MSN-1035',
  missionTitle: 'Programme impact assessment',
  staffName: 'Sofia Marino',
  advanceAmount: 5960,
  actualAmount: 5412,
  balance: -548,
  currency: 'USD',
  submittedAt: '2026-08-30T10:00:00Z',
  status: 'PAID'
},
{
  id: 'st-139',
  reference: 'STL-139',
  missionReference: 'MSN-1039',
  missionTitle: 'Warehouse relocation supervision',
  staffName: 'James Okafor',
  advanceAmount: 1450,
  actualAmount: 1682,
  balance: 232,
  currency: 'USD',
  submittedAt: '2026-09-14T08:45:00Z',
  status: 'UNDER_REVIEW'
},
{
  id: 'st-138',
  reference: 'STL-138',
  missionReference: 'MSN-1033',
  missionTitle: 'Fleet maintenance review',
  staffName: 'Kwame Mensah',
  advanceAmount: 640,
  actualAmount: 598,
  balance: -42,
  currency: 'USD',
  submittedAt: '2026-09-05T13:20:00Z',
  status: 'APPROVED'
},
{
  id: 'st-137',
  reference: 'STL-137',
  missionReference: 'MSN-1040',
  missionTitle: 'Regional finance review',
  staffName: 'Tomas Eriksen',
  advanceAmount: 5120,
  actualAmount: 0,
  balance: -5120,
  currency: 'USD',
  submittedAt: '2026-09-20T07:00:00Z',
  status: 'SUBMITTED'
}];