import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useCreateMission, useUpdateMission } from '../../hooks/useMissions';
import { useStaffList } from '../../hooks/useStaff';
import { useAuth } from '../../context/AuthContext';
import { APPROVER_ROLES } from '../../lib/roles';
import type { Mission, MissionInput } from '../../types/mission';

const JOB_LEVELS: Array<{ value: MissionInput['jobLevel']; label: string }> = [
  { value: 'EXECUTIVE', label: 'Executive' },
  { value: 'FUNCTION_MANAGER', label: 'Function Manager' },
  { value: 'SUB_FUNCTION_MANAGER', label: 'Sub Function Manager' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'DRIVER', label: 'Driver' },
];

const LOCATION_TIERS: Array<{ value: MissionInput['locationTier']; label: string }> = [
  { value: 'TIER_1', label: 'Tier 1' },
  { value: 'TIER_2', label: 'Tier 2' },
  { value: 'TIER_3', label: 'Tier 3' },
];

const EMPTY: MissionInput = {
  position: '',
  functionName: '',
  business: '',
  jobLevel: 'STAFF',
  basedLocation: '',
  destinationLocation: '',
  locationTier: 'TIER_1',
  travelObjectives: '',
  departureDate: '',
  departureTime: '',
  arrivalDate: '',
  arrivalTime: '',
  numberOfTravelDays: 1,
  description: '',
};

type Errors = Partial<Record<keyof MissionInput, string>>;

export interface MissionFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Pass an existing mission to edit it instead of creating a new one. */
  editMission?: Mission | null;
}

function missionToFormValues(mission: Mission): MissionInput {
  return {
    position: mission.position,
    functionName: mission.functionName,
    business: mission.business,
    jobLevel: mission.jobLevel,
    basedLocation: mission.basedLocation,
    destinationLocation: mission.destinationLocation,
    locationTier: mission.locationTier,
    travelObjectives: mission.travelObjectives,
    departureDate: mission.departureDate,
    departureTime: mission.departureTime ?? '',
    arrivalDate: mission.arrivalDate,
    arrivalTime: mission.arrivalTime ?? '',
    numberOfTravelDays: mission.numberOfTravelDays,
    description: mission.description ?? '',
  };
}

export function MissionFormModal({ open, onClose, editMission }: MissionFormModalProps) {
  const isEditMode = Boolean(editMission);
  const [form, setForm] = useState<MissionInput>(editMission ? missionToFormValues(editMission) : EMPTY);
  const [staffId, setStaffId] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const createMission = useCreateMission();
  const updateMission = useUpdateMission();
  const { can } = useAuth();
  const canPickStaff = !isEditMode && can(APPROVER_ROLES);
  const staffList = useStaffList(canPickStaff && open);
  const isPending = createMission.isPending || updateMission.isPending;

  // Re-sync the form whenever a different mission is opened for editing, or the modal re-opens fresh.
  useEffect(() => {
    if (open) {
      setForm(editMission ? missionToFormValues(editMission) : EMPTY);
      setStaffId('');
      setErrors({});
    }
  }, [open, editMission]);

  function update<K extends keyof MissionInput>(key: K, value: MissionInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!form.position.trim()) next.position = 'Position is required.';
    if (!form.functionName.trim()) next.functionName = 'Function is required.';
    if (!form.business.trim()) next.business = 'Business is required.';
    if (!form.basedLocation.trim()) next.basedLocation = 'Based location is required.';
    if (!form.destinationLocation.trim()) next.destinationLocation = 'Destination is required.';
    if (form.travelObjectives.trim().length < 20) {
      next.travelObjectives = 'Describe the travel objectives in at least 20 characters.';
    }
    if (!form.departureDate) next.departureDate = 'Select a departure date.';
    if (!form.arrivalDate) next.arrivalDate = 'Select an arrival date.';
    if (form.departureDate && form.arrivalDate && form.arrivalDate < form.departureDate) {
      next.arrivalDate = 'The arrival date must fall on or after the departure date.';
    }
    if (!form.numberOfTravelDays || form.numberOfTravelDays < 1) {
      next.numberOfTravelDays = 'Enter at least 1 travel day.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleClose() {
    setForm(EMPTY);
    setStaffId('');
    setErrors({});
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    const payload: MissionInput = {
      ...form,
      departureTime: form.departureTime || undefined,
      arrivalTime: form.arrivalTime || undefined,
      description: form.description || undefined,
      onBehalfOfUserId: staffId ? Number(staffId) : undefined,
    };

    if (isEditMode && editMission) {
      await updateMission.mutateAsync({ id: editMission.id, input: payload });
    } else {
      await createMission.mutateAsync(payload);
    }
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditMode ? 'Edit mission request' : 'New mission request'}
      description={
        isEditMode
          ? 'Update the details below. Changes are saved to this draft mission.'
          : 'Submitted requests enter the five-stage approval chain, starting with the function manager.'
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="mission-form" loading={isPending}>
            {isEditMode ? 'Save changes' : 'Submit for approval'}
          </Button>
        </>
      }
    >
      <form id="mission-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {canPickStaff && (
          <Select
            label="Create on behalf of (optional)"
            value={staffId}
            onChange={(event) => setStaffId(event.target.value)}
            options={[
              { value: '', label: 'Myself' },
              ...(staffList.data ?? []).map((u) => ({
                value: String(u.id),
                label: `${u.fullName} · ${u.jobLevel}`,
              })),
            ]}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Position"
            placeholder="Field Operations Officer"
            value={form.position}
            error={errors.position}
            onChange={(event) => update('position', event.target.value)}
          />
          <Input
            label="Function"
            placeholder="Field Operations"
            value={form.functionName}
            error={errors.functionName}
            onChange={(event) => update('functionName', event.target.value)}
          />
          <Input
            label="Business"
            placeholder="OneMore Group"
            value={form.business}
            error={errors.business}
            onChange={(event) => update('business', event.target.value)}
          />
          <Select
            label="Job level"
            value={form.jobLevel}
            onChange={(event) => update('jobLevel', event.target.value as MissionInput['jobLevel'])}
            options={JOB_LEVELS}
          />
        </div>

        <Textarea
          label="Travel objectives"
          placeholder="What needs to happen on the ground, and what will the mission deliver?"
          value={form.travelObjectives}
          error={errors.travelObjectives}
          onChange={(event) => update('travelObjectives', event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Based location"
            placeholder="Phnom Penh"
            value={form.basedLocation}
            error={errors.basedLocation}
            onChange={(event) => update('basedLocation', event.target.value)}
          />
          <Input
            label="Destination location"
            placeholder="Siem Reap"
            value={form.destinationLocation}
            error={errors.destinationLocation}
            onChange={(event) => update('destinationLocation', event.target.value)}
          />
          <Select
            label="Location tier"
            value={form.locationTier}
            onChange={(event) => update('locationTier', event.target.value as MissionInput['locationTier'])}
            options={LOCATION_TIERS}
          />
          <Input
            label="Number of travel days"
            type="number"
            min={1}
            value={form.numberOfTravelDays || ''}
            error={errors.numberOfTravelDays}
            onChange={(event) => update('numberOfTravelDays', Number(event.target.value))}
          />
          <Input
            label="Departure date"
            type="date"
            value={form.departureDate}
            error={errors.departureDate}
            onChange={(event) => update('departureDate', event.target.value)}
          />
          <Input
            label="Departure time (optional)"
            type="time"
            value={form.departureTime}
            onChange={(event) => update('departureTime', event.target.value)}
          />
          <Input
            label="Arrival date"
            type="date"
            value={form.arrivalDate}
            error={errors.arrivalDate}
            onChange={(event) => update('arrivalDate', event.target.value)}
          />
          <Input
            label="Arrival time (optional)"
            type="time"
            value={form.arrivalTime}
            onChange={(event) => update('arrivalTime', event.target.value)}
          />
        </div>

        <Textarea
          label="Description (optional)"
          placeholder="Any additional notes for approvers…"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
        />
      </form>
    </Modal>
  );
}
