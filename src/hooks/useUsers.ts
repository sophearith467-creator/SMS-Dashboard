import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchUsers, updateUserStatus } from '../api/users';
import type { DirectoryUser } from '../data/users';
import { queryKeys } from '../lib/queryKeys';
import { titleCase } from '../lib/utils';

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: fetchUsers });
}

export function useUserStatusUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: {id: string;status: DirectoryUser['status'];}) =>
    updateUserStatus(id, status),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success(`${user.fullName} is now ${titleCase(user.status)}`);
    },
    onError: (error: Error) => toast.error(error.message || 'Could not update the account')
  });
}