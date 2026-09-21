import { useQuery } from '@tanstack/react-query';
import {
  fetchAllowanceSpend,
  fetchApprovalTurnaround,
  fetchExceptions,
  fetchMissionSummary } from
'../api/analytics';
import { queryKeys } from '../lib/queryKeys';

export function useMissionSummary() {
  return useQuery({ queryKey: queryKeys.analytics.summary, queryFn: fetchMissionSummary });
}

export function useAllowanceSpend() {
  return useQuery({ queryKey: queryKeys.analytics.spend, queryFn: fetchAllowanceSpend });
}

export function useApprovalTurnaround() {
  return useQuery({ queryKey: queryKeys.analytics.turnaround, queryFn: fetchApprovalTurnaround });
}

export function useExceptions() {
  return useQuery({ queryKey: queryKeys.analytics.exceptions, queryFn: fetchExceptions });
}