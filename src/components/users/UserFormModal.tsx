import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { DirectoryUser } from '../../data/users';
import type { Role } from '../../types/auth';
import type { CreateUserPayload, UpdateUserPayload } from '../../api/users';
import { ROLE_LABELS } from '../../lib/roles';

const JOB_LEVELS = [
  { value: 'STAFF', label: 'Staff' },
  { value: 'FUNCTION_MANAGER', label: 'Function Manager' },
  { value: 'EXECUTIVE', label: 'Executive' },
  { value: 'ADMIN', label: 'Admin' },
];

const ALL_ROLES: Role[] = [
  'ROLE_STAFF',
  'ROLE_FUNCTION_MANAGER',
  'ROLE_HRBP',
  'ROLE_FINANCE',
  'ROLE_BIZOPS',
  'ROLE_EXECUTIVE',
  'ROLE_ADMIN',
];

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  user?: DirectoryUser | null;
  loading?: boolean;
  onSubmit: (payload: CreateUserPayload | UpdateUserPayload) => void;
}

export function UserFormModal({
  open,
  onClose,
  mode,
  user,
  loading,
  onSubmit,
}: UserFormModalProps) {
  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jobLevel, setJobLevel] = useState('STAFF');
  const [functionName, setFunctionName] = useState('');
  const [business, setBusiness] = useState('OneMore Group');
  const [roles, setRoles] = useState<Role[]>(['ROLE_STAFF']);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setFunctionName(user.department);
      setRoles(user.roles);
      setIsActive(user.status === 'ACTIVE');
      setJobLevel('STAFF');
      setPassword('');
      setEmployeeCode('');
    } else if (mode === 'create') {
      setEmployeeCode('');
      setFullName('');
      setEmail('');
      setPassword('');
      setJobLevel('STAFF');
      setFunctionName('');
      setBusiness('OneMore Group');
      setRoles(['ROLE_STAFF']);
      setIsActive(true);
    }
  }, [mode, user, open]);

  function toggleRole(role: Role) {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (roles.length === 0) return;

    if (mode === 'create') {
      onSubmit({
        employeeCode,
        fullName,
        email,
        password,
        jobLevel,
        functionName: functionName || undefined,
        business: business || undefined,
        roles,
      } as CreateUserPayload);
    } else {
      onSubmit({
        fullName,
        jobLevel,
        functionName: functionName || undefined,
        business: business || undefined,
        roles,
        isActive,
      } as UpdateUserPayload);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create user' : 'Edit user'}
      description={
        mode === 'create'
          ? 'Add a new staff or approver account.'
          : `Update details for ${user?.fullName ?? 'this user'}.`
      }
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {mode === 'create' ? 'Create user' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'create' && (
          <Input
            label="Employee code"
            required
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            placeholder="EMP-001"
          />
        )}

        <Input
          label="Full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Smith"
        />

        {mode === 'create' && (
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@onemore.com"
          />
        )}

        {mode === 'create' && (
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
          />
        )}

        <Select
          label="Job level"
          options={JOB_LEVELS}
          value={jobLevel}
          onChange={(e) => setJobLevel(e.target.value)}
        />

        <Input
          label="Function / Department"
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          placeholder="Sales, HR, IT…"
        />

        <Input
          label="Business"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          placeholder="OneMore Group"
        />

        <div>
          <p className="mb-2 text-[13px] font-medium text-fg">Roles</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_ROLES.map((role) => (
              <label
                key={role}
                className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] hover:bg-surface-muted"
              >
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="h-4 w-4 rounded border-line-strong text-brand focus:ring-brand"
                />
                {ROLE_LABELS[role]}
              </label>
            ))}
          </div>
        </div>

        {mode === 'edit' && (
          <label className="flex items-center gap-2 text-[13px] text-fg">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-line-strong text-brand focus:ring-brand"
            />
            Account is active
          </label>
        )}
      </form>
    </Modal>
  );
}
