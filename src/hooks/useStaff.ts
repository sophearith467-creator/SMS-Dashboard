import { useQuery } from '@tanstack/react-query';
import { fetchStaffList } from '../api/staff';

export function useStaffList(enabled: boolean) {
  return useQuery({
    queryKey: ['staff', 'list'] as const,
    queryFn: fetchStaffList,
    enabled,
  });
}
