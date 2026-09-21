import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useCreateMission } from '../../hooks/useMissions';
import type { MissionInput } from '../../types/mission';

const DEPARTMENTS = [
'Field Operations',
'Programmes',
'Finance',
'Business Operations',
'People & Culture',
'Executive Office'];


const COUNTRIES = ['Ghana', 'Kenya', 'Rwanda', 'South Africa', 'Portugal', 'Germany', 'Switzerland', 'UAE'];

const EMPTY: MissionInput = {
  title: '',
  purpose: '',
  department: DEPARTMENTS[0],
  destination: '',
  country: COUNTRIES[0],
  startDate: '',
  endDate: '',
  transport: 'AIR',
  estimatedCost: 0,
  priority: 'NORMAL'
};

type Errors = Partial<Record<keyof MissionInput, string>>;

export function MissionFormModal({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const [form, setForm] = useState<MissionInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const createMission = useCreateMission();

  function update<K extends keyof MissionInput>(key: K, value: MissionInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (form.title.trim().length < 6) next.title = 'Give the mission a descriptive title.';
    if (form.purpose.trim().length < 20) next.purpose = 'Describe the purpose in at least 20 characters.';
    if (!form.destination.trim()) next.destination = 'Destination is required.';
    if (!form.startDate) next.startDate = 'Select a start date.';
    if (!form.endDate) next.endDate = 'Select an end date.';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = 'The end date must fall after the start date.';
    }
    if (!form.estimatedCost || form.estimatedCost <= 0) next.estimatedCost = 'Enter the estimated cost.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleClose() {
    setForm(EMPTY);
    setErrors({});
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    await createMission.mutateAsync(form);
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New mission request"
      description="Submitted requests enter the five-stage approval chain, starting with the function manager."
      size="lg"
      footer={
      <>
          <Button variant="secondary" onClick={handleClose} disabled={createMission.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="mission-form" loading={createMission.isPending}>
            Submit for approval
          </Button>
        </>
      }>
      
      <form id="mission-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Mission title"
          placeholder="Q4 field audit — Northern corridor"
          value={form.title}
          error={errors.title}
          onChange={(event) => update('title', event.target.value)} />
        

        <Textarea
          label="Purpose and expected outcome"
          placeholder="What needs to happen on the ground, and what will the mission deliver?"
          value={form.purpose}
          error={errors.purpose}
          onChange={(event) => update('purpose', event.target.value)} />
        

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Department"
            value={form.department}
            onChange={(event) => update('department', event.target.value)}
            options={DEPARTMENTS.map((value) => ({ value, label: value }))} />
          
          <Select
            label="Priority"
            value={form.priority}
            onChange={(event) => update('priority', event.target.value as MissionInput['priority'])}
            options={[
            { value: 'LOW', label: 'Low' },
            { value: 'NORMAL', label: 'Normal' },
            { value: 'HIGH', label: 'High' }]
            } />
          
          <Input
            label="Destination city"
            placeholder="Kumasi"
            value={form.destination}
            error={errors.destination}
            onChange={(event) => update('destination', event.target.value)} />
          
          <Select
            label="Country"
            value={form.country}
            onChange={(event) => update('country', event.target.value)}
            options={COUNTRIES.map((value) => ({ value, label: value }))} />
          
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            error={errors.startDate}
            onChange={(event) => update('startDate', event.target.value)} />
          
          <Input
            label="End date"
            type="date"
            value={form.endDate}
            error={errors.endDate}
            onChange={(event) => update('endDate', event.target.value)} />
          
          <Select
            label="Transport"
            value={form.transport}
            onChange={(event) => update('transport', event.target.value as MissionInput['transport'])}
            options={[
            { value: 'AIR', label: 'Air' },
            { value: 'ROAD', label: 'Road' },
            { value: 'RAIL', label: 'Rail' },
            { value: 'COMPANY_VEHICLE', label: 'Company vehicle' }]
            } />
          
          <Input
            label="Estimated cost (USD)"
            type="number"
            min={0}
            step={10}
            placeholder="4820"
            value={form.estimatedCost || ''}
            error={errors.estimatedCost}
            onChange={(event) => update('estimatedCost', Number(event.target.value))} />
          
        </div>
      </form>
    </Modal>);

}