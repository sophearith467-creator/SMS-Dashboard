import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createUser,
  deactivateUser,
  fetchUserById,
  fetchUsers,
  updateUser,
  type CreateUserPayload,
  type FetchUsersParams,
  type UpdateUserPayload,
} from '../api/users';
import { queryKeys } from '../lib/queryKeys';

export function useUsers(params: FetchUsersParams) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search ?? '';

  return useQuery({
    queryKey: queryKeys.users.list({ page, pageSize, search }),
    queryFn: () => fetchUsers({ page, pageSize, search }),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ''),
    queryFn: () => fetchUserById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`${user.fullName} created`);
    },
    onError: (error: Error) => toast.error(error.message || 'Could not create user'),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`${user.fullName} updated`);
    },
    onError: (error: Error) => toast.error(error.message || 'Could not update user'),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`${user.fullName} deactivated`);
    },
    onError: (error: Error) => toast.error(error.message || 'Could not deactivate user'),
  });
}
