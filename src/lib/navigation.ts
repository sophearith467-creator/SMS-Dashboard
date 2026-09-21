import {
  CarFrontIcon,
  ClipboardListIcon,
  CheckCircle2Icon,
  GaugeIcon,
  MapIcon,
  ReceiptTextIcon,
  RouteIcon,
  UsersIcon,
  type LucideIcon } from
'lucide-react';
import type { Role } from '../types/auth';
import { APPROVER_ROLES } from './roles';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
  group: 'Overview' | 'Operations' | 'Finance' | 'Administration';
}

export const NAV_ITEMS: NavItem[] = [
{ to: '/', label: 'Dashboard', icon: GaugeIcon, group: 'Overview' },
{ to: '/missions', label: 'Missions', icon: MapIcon, group: 'Operations' },
{
  to: '/approvals',
  label: 'Approvals',
  icon: CheckCircle2Icon,
  group: 'Operations',
  roles: APPROVER_ROLES
},
{ to: '/activity-reports', label: 'Activity Reports', icon: ClipboardListIcon, group: 'Operations' },
{ to: '/vehicle-requests', label: 'Vehicle Requests', icon: CarFrontIcon, group: 'Operations' },
{ to: '/mileage-claims', label: 'Mileage Claims', icon: RouteIcon, group: 'Finance' },
{
  to: '/settlement',
  label: 'Settlement',
  icon: ReceiptTextIcon,
  group: 'Finance',
  roles: ['ROLE_FINANCE', 'ROLE_BIZOPS', 'ROLE_EXECUTIVE', 'ROLE_ADMIN']
},
{
  to: '/users',
  label: 'Users',
  icon: UsersIcon,
  group: 'Administration',
  roles: ['ROLE_ADMIN']
}];


export const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/missions': 'Missions',
  '/approvals': 'Approvals',
  '/activity-reports': 'Activity Reports',
  '/vehicle-requests': 'Vehicle Requests',
  '/mileage-claims': 'Mileage Claims',
  '/settlement': 'Settlement',
  '/users': 'Users'
};