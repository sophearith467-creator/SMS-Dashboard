import React, { useEffect, useState } from 'react';
import { CarFrontIcon, MapPinIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useCreateMission, useUpdateMission } from '../../hooks/useMissions';
import { useStaffList } from '../../hooks/useStaff';
import { useAuth } from '../../context/AuthContext';
import { APPROVER_ROLES } from '../../lib/roles';
import type { CreateVehicleRequestInput, VehicleTravelDetailInput } from '../../types/annex';
import type { Mission, MissionInput } from '../../types/mission';
import { useCreateVehicleRequest } from '../../hooks/useAnnexes';

const JOB_LEVELS: Array<{ value: MissionInput["jobLevel"]; label: string }> = [
  { value: "EXECUTIVE", label: "Executive" },
  { value: "FUNCTION_MANAGER", label: "Function Manager" },
  { value: "SUB_FUNCTION_MANAGER", label: "Sub Function Manager" },
  { value: "STAFF", label: "Staff" },
  { value: "DRIVER", label: "Driver" },
];

const LOCATION_TIERS: Array<{
  value: MissionInput["locationTier"];
  label: string;
}> = [
  { value: "TIER_1", label: "Tier 1" },
  { value: "TIER_2", label: "Tier 2" },
  { value: "TIER_3", label: "Tier 3" },
];

const EMPTY: MissionInput = {
  position: "",
  functionName: "",
  business: "",
  jobLevel: "STAFF",
  basedLocation: "",
  destinationLocation: "",
  locationTier: "TIER_1",
  travelObjectives: "",
  departureDate: "",
  departureTime: "",
  arrivalDate: "",
  arrivalTime: "",
  numberOfTravelDays: 1,
  missionType: "INDIVIDUAL",
  participantIds: [],
  description: "",
};

type Errors = Record<string, string | undefined>;
type VehicleTravelDetailForm = Omit<VehicleTravelDetailInput, 'distanceKm'> & { distanceKm: string };

function emptyTravelDetail(): VehicleTravelDetailForm {
  return {
    date: '',
    origin: '',
    destination: '',
    purposeOfTravel: '',
    distanceKm: '',
    remarks: '',
  };
}

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
    departureTime: mission.departureTime ?? "",
    arrivalDate: mission.arrivalDate,
    arrivalTime: mission.arrivalTime ?? "",
    numberOfTravelDays: mission.numberOfTravelDays,
    description: mission.description ?? "",
  };
}

function missionToTravelDetails(mission: Mission): VehicleTravelDetailForm[] {
  return (mission.vehicleRequest?.travelDetails ?? []).map((detail) => ({
    date: detail.date,
    origin: detail.origin,
    destination: detail.destination,
    purposeOfTravel: detail.purposeOfTravel ?? '',
    distanceKm: String(detail.distanceKm),
    remarks: detail.remarks ?? '',
  }));
}

export function MissionFormModal({ open, onClose, editMission }: MissionFormModalProps) {
  const isEditMode = Boolean(editMission);
  const [form, setForm] = useState<MissionInput>(editMission ? missionToFormValues(editMission) : EMPTY);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleTravelDetailForm[]>(
    editMission ? missionToTravelDetails(editMission) : []
  );
  const [formStep, setFormStep] = useState<'mission' | 'vehicle'>('mission');
  const [activeMapIndex, setActiveMapIndex] = useState<number | null>(null);
  const [createdMissionId, setCreatedMissionId] = useState<number | null>(null);
  const [staffId, setStaffId] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const createMission = useCreateMission();
  const updateMission = useUpdateMission();
  const createVehicleRequest = useCreateVehicleRequest();
  const { can } = useAuth();
  const canPickStaff = !isEditMode && can(APPROVER_ROLES);
  const isGroup = !isEditMode && form.missionType === "GROUP";
  const staffList = useStaffList((canPickStaff || isGroup) && open);
  const isPending = createMission.isPending || updateMission.isPending || createVehicleRequest.isPending;

  // Re-sync the form whenever a different mission is opened for editing, or the modal re-opens fresh.
  useEffect(() => {
    if (open) {
      setForm(editMission ? missionToFormValues(editMission) : EMPTY);
      setVehicleDetails(editMission ? missionToTravelDetails(editMission) : []);
      setFormStep('mission');
      setActiveMapIndex(null);
      setCreatedMissionId(null);
      setStaffId('');
      setErrors({});
    }
  }, [open, editMission]);

  function update<K extends keyof MissionInput>(
    key: K,
    value: MissionInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function toggleParticipant(id: number) {
    setForm((current) => {
      const ids = current.participantIds ?? [];
      return {
        ...current,
        participantIds: ids.includes(id)
          ? ids.filter((x) => x !== id)
          : [...ids, id],
      };
    });
    setErrors((current) => ({ ...current, participantIds: undefined }));
  }

  function validateMission(): boolean {
    const next: Errors = {};
    if (!form.position.trim()) next.position = "Position is required.";
    if (!form.functionName.trim()) next.functionName = "Function is required.";
    if (!form.business.trim()) next.business = "Business is required.";
    if (!form.basedLocation.trim())
      next.basedLocation = "Based location is required.";
    if (!form.destinationLocation.trim())
      next.destinationLocation = "Destination is required.";
    if (form.travelObjectives.trim().length < 20) {
      next.travelObjectives =
        "Describe the travel objectives in at least 20 characters.";
    }
    if (!form.departureDate) next.departureDate = "Select a departure date.";
    if (!form.arrivalDate) next.arrivalDate = "Select an arrival date.";
    if (
      form.departureDate &&
      form.arrivalDate &&
      form.arrivalDate < form.departureDate
    ) {
      next.arrivalDate =
        "The arrival date must fall on or after the departure date.";
    }
    if (!form.numberOfTravelDays || form.numberOfTravelDays < 1) {
      next.numberOfTravelDays = "Enter at least 1 travel day.";
    }
    if (isGroup && !(form.participantIds && form.participantIds.length > 0)) {
      next.participantIds =
        "Select at least one other traveler for a group mission.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateVehicleDetails(): boolean {
    const next: Errors = {};
    if (vehicleDetails.length === 0) next.vehicleDetails = 'Add at least one travel detail.';
    vehicleDetails.forEach((detail, index) => {
      if (!detail.date) next[`vehicleDetails.${index}.date`] = 'Select a travel date.';
      if (!detail.origin.trim()) next[`vehicleDetails.${index}.origin`] = 'Enter an origin.';
      if (!detail.destination.trim()) next[`vehicleDetails.${index}.destination`] = 'Enter a destination.';
      if (!detail.purposeOfTravel.trim()) {
        next[`vehicleDetails.${index}.purposeOfTravel`] = 'Enter the purpose of travel.';
      }
      const distanceKm = Number(detail.distanceKm);
      if (!detail.distanceKm.trim() || !Number.isFinite(distanceKm) || distanceKm < 0) {
        next[`vehicleDetails.${index}.distanceKm`] = 'Enter a distance of 0 km or more.';
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleRequestVehicle() {
    if (!validateMission()) return;
    if (vehicleDetails.length === 0) setVehicleDetails([emptyTravelDetail()]);
    setFormStep('vehicle');
  }

  function updateVehicleDetail<K extends keyof VehicleTravelDetailForm>(
    index: number,
    key: K,
    value: VehicleTravelDetailForm[K]
  ) {
    setVehicleDetails((current) =>
      current.map((detail, detailIndex) => detailIndex === index ? { ...detail, [key]: value } : detail)
    );
    setErrors((current) => ({ ...current, [`vehicleDetails.${index}.${key}`]: undefined }));
  }

  function toggleGoogleMapsRoute(index: number) {
    const detail = vehicleDetails[index];
    if (!detail) return;

    if (!detail.origin.trim() || !detail.destination.trim()) {
      setErrors((current) => ({
        ...current,
        [`vehicleDetails.${index}.origin`]: detail.origin.trim() ? undefined : 'Enter an origin first.',
        [`vehicleDetails.${index}.destination`]: detail.destination.trim()
          ? undefined
          : 'Enter a destination first.',
      }));
      return;
    }

    setActiveMapIndex((current) => current === index ? null : index);
  }

  function googleMapsEmbedUrl(origin: string, destination: string): string {
    const params = new URLSearchParams({ output: 'embed', saddr: origin, daddr: destination });
    return `https://www.google.com/maps?${params.toString()}`;
  }

  function googleMapsRouteUrl(origin: string, destination: string): string {
    const routeUrl = new URL('https://www.google.com/maps/dir/');
    routeUrl.searchParams.set('api', '1');
    routeUrl.searchParams.set('origin', origin);
    routeUrl.searchParams.set('destination', destination);
    routeUrl.searchParams.set('travelmode', 'driving');
    return routeUrl.toString();
  }

  function handleClose() {
    setForm(EMPTY);
    setVehicleDetails([]);
    setFormStep('mission');
    setActiveMapIndex(null);
    setCreatedMissionId(null);
    setStaffId('');
    setErrors({});
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateMission()) return;
    if (formStep === 'vehicle' && !validateVehicleDetails()) return;

    const missionPayload: MissionInput = {
      ...form,
      departureTime: form.departureTime || undefined,
      arrivalTime: form.arrivalTime || undefined,
      description: form.description || undefined,
      onBehalfOfUserId: staffId ? Number(staffId) : undefined,
      missionType: isEditMode ? undefined : form.missionType,
      participantIds: isGroup ? form.participantIds : undefined,
    };

    try {
      let savedMission: Mission;
      if (isEditMode && editMission) {
        savedMission = await updateMission.mutateAsync({ id: editMission.id, input: missionPayload });
      } else if (createdMissionId != null) {
        savedMission = await updateMission.mutateAsync({ id: createdMissionId, input: missionPayload });
      } else {
        savedMission = await createMission.mutateAsync(missionPayload);
        setCreatedMissionId(savedMission.id);
      }

      if (formStep === 'vehicle') {
        const vehicleRequestInput: CreateVehicleRequestInput = {
          requesterName: savedMission.requesterName,
          requesterId: String(savedMission.requesterId),
          position: savedMission.position,
          function: savedMission.functionName,
          business: savedMission.business,
          jobLevel: savedMission.jobLevel,
          basedLocation: savedMission.basedLocation,
          destinationLocation: savedMission.destinationLocation,
          travelStartDate: savedMission.departureDate,
          travelEndDate: savedMission.arrivalDate,
          travelObjectives: savedMission.travelObjectives,
          travelDetails: vehicleDetails.map((detail) => ({
            ...detail,
            distanceKm: Number(detail.distanceKm),
            origin: detail.origin.trim(),
            destination: detail.destination.trim(),
            purposeOfTravel: detail.purposeOfTravel.trim(),
            remarks: detail.remarks.trim(),
          })),
        };
        await createVehicleRequest.mutateAsync({ missionId: savedMission.id, input: vehicleRequestInput });
      }

      handleClose();
    } catch {
      // Mutation hooks surface the API error; leave the form open so it can be corrected or retried.
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={formStep === 'vehicle' ? 'Personal car request' : isEditMode ? 'Edit mission request' : 'New mission request'}
      description={
        formStep === 'vehicle'
          ? 'Add your personal car trip details. Reimbursement is calculated at $0.20 per kilometer.'
          : isEditMode
            ? 'Update the details below. Changes are saved to this draft mission.'
            : 'Submitted requests enter the five-stage approval chain, starting with the function manager.'
      }
      size="lg"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          {formStep === 'vehicle' && (
            <Button variant="secondary" onClick={() => setFormStep('mission')} disabled={isPending}>
              Back
            </Button>
          )}
          <Button type="submit" form="mission-form" loading={isPending}>
            {isEditMode ? "Save changes" : "Submit for approval"}
          </Button>
        </>
      }
    >
      <form id="mission-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formStep === 'mission' ? (
          <>
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-fg">Requester</h3>

        {!isEditMode && (
          <Select
            label="Mission type"
            value={form.missionType ?? "INDIVIDUAL"}
            onChange={(event) => {
              update(
                "missionType",
                event.target.value as NonNullable<MissionInput["missionType"]>,
              );
              if (event.target.value === "INDIVIDUAL")
                update("participantIds", []);
            }}
            options={[
              { value: "INDIVIDUAL", label: "Individual" },
              { value: "GROUP", label: "Group (several travelers)" },
            ]}
          />
        )}

        {isGroup && (
          <div>
            <p className="mb-2 text-sm font-medium">Other travelers</p>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-300/60 p-2">
              {staffList.isLoading && (
                <p className="p-2 text-sm opacity-70">Loading staff...</p>
              )}
              {staffList.isError && (
                <p className="p-2 text-sm text-red-600">
                  Could not load the staff list.
                </p>
              )}
              {(staffList.data ?? [])
                .filter((u) => String(u.id) !== staffId)
                .map((u) => (
                  <label
                    key={u.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-black/5"
                  >
                    <input
                      type="checkbox"
                      checked={(form.participantIds ?? []).includes(u.id)}
                      onChange={() => toggleParticipant(u.id)}
                    />
                    <span>
                      {u.fullName} - {u.jobLevel}
                    </span>
                  </label>
                ))}
            </div>
            {errors.participantIds && (
              <p className="mt-1 text-xs text-red-600">
                {errors.participantIds}
              </p>
            )}
            <p className="mt-1 text-xs opacity-70">
              You are added automatically. Allowances are calculated per person.
            </p>
          </div>
        )}

        {canPickStaff && (
          <Select
            label="Create on behalf of (optional)"
            value={staffId}
            onChange={(event) => setStaffId(event.target.value)}
            options={[
              { value: "", label: "Myself" },
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
            onChange={(event) => update("position", event.target.value)}
          />
          <Input
            label="Function"
            placeholder="Field Operations"
            value={form.functionName}
            error={errors.functionName}
            onChange={(event) => update("functionName", event.target.value)}
          />
          <Input
            label="Business"
            placeholder="OneMore Group"
            value={form.business}
            error={errors.business}
            onChange={(event) => update("business", event.target.value)}
          />
          <Select
            label="Job level"
            value={form.jobLevel}
            onChange={(event) =>
              update("jobLevel", event.target.value as MissionInput["jobLevel"])
            }
            options={JOB_LEVELS}
          />
        </div>

        </section>
        <section className="space-y-4 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-fg">Mission details</h3>
        <Textarea
          label="Travel objectives"
          placeholder="What needs to happen on the ground, and what will the mission deliver?"
          value={form.travelObjectives}
          error={errors.travelObjectives}
          onChange={(event) => update("travelObjectives", event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Based location"
            placeholder="Phnom Penh"
            value={form.basedLocation}
            error={errors.basedLocation}
            onChange={(event) => update("basedLocation", event.target.value)}
          />
          <Input
            label="Destination location"
            placeholder="Siem Reap"
            value={form.destinationLocation}
            error={errors.destinationLocation}
            onChange={(event) =>
              update("destinationLocation", event.target.value)
            }
          />
          <Select
            label="Location tier"
            value={form.locationTier}
            onChange={(event) =>
              update(
                "locationTier",
                event.target.value as MissionInput["locationTier"],
              )
            }
            options={LOCATION_TIERS}
          />
          <Input
            label="Number of travel days"
            type="number"
            min={1}
            value={form.numberOfTravelDays || ""}
            error={errors.numberOfTravelDays}
            onChange={(event) =>
              update("numberOfTravelDays", Number(event.target.value))
            }
          />
          <Input
            label="Departure date"
            type="date"
            value={form.departureDate}
            error={errors.departureDate}
            onChange={(event) => update("departureDate", event.target.value)}
          />
          <Input
            label="Departure time (optional)"
            type="time"
            value={form.departureTime}
            onChange={(event) => update("departureTime", event.target.value)}
          />
          <Input
            label="Arrival date"
            type="date"
            value={form.arrivalDate}
            error={errors.arrivalDate}
            onChange={(event) => update("arrivalDate", event.target.value)}
          />
          <Input
            label="Arrival time (optional)"
            type="time"
            value={form.arrivalTime}
            onChange={(event) => update("arrivalTime", event.target.value)}
          />
        </div>

        <Textarea
          label="Description (optional)"
          placeholder="Any additional notes for approvers…"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          rows={3}
        />
        </section>
        <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-fg">Personal car</p>
          <button
            type="button"
            onClick={handleRequestVehicle}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-brand-soft px-4 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-soft/80 sm:self-auto"
          >
            <CarFrontIcon size={16} aria-hidden />
            Request personal car
          </button>
        </div>
          </>
        ) : (
          <section className="space-y-4">
            {vehicleDetails.map((detail, index) => (
              <fieldset key={index} className="space-y-4 rounded-lg border border-line p-4">
                <legend className="px-1 text-xs font-semibold uppercase text-fg-subtle">Trip {index + 1}</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Date"
                    type="date"
                    value={detail.date}
                    error={errors[`vehicleDetails.${index}.date`]}
                    onChange={(event) => updateVehicleDetail(index, 'date', event.target.value)}
                  />
                  <Input
                    label="Origin"
                    placeholder="Phnom Penh"
                    value={detail.origin}
                    error={errors[`vehicleDetails.${index}.origin`]}
                    onChange={(event) => updateVehicleDetail(index, 'origin', event.target.value)}
                  />
                  <Input
                    label="Destination"
                    placeholder="Siem Reap"
                    value={detail.destination}
                    error={errors[`vehicleDetails.${index}.destination`]}
                    onChange={(event) => updateVehicleDetail(index, 'destination', event.target.value)}
                  />
                  <div className="space-y-1 self-end">
                    <div className="flex items-end gap-2">
                      <Input
                        label="One-way distance (km)"
                        hint="Round-trip reimbursement is calculated automatically."
                        type="number"
                        min={0}
                        value={detail.distanceKm}
                        error={errors[`vehicleDetails.${index}.distanceKm`]}
                        onChange={(event) => updateVehicleDetail(index, 'distanceKm', event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => toggleGoogleMapsRoute(index)}
                        aria-label={activeMapIndex === index ? 'Hide route map' : 'Show route map'}
                        aria-expanded={activeMapIndex === index}
                        aria-controls={`vehicle-route-map-${index}`}
                        title={activeMapIndex === index ? 'Hide route map' : 'Show route map'}
                        className={`mb-[1px] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                          activeMapIndex === index
                            ? 'border-brand bg-brand-soft text-brand-text'
                            : 'border-line text-brand-text hover:border-brand hover:bg-brand-soft'
                        }`}
                      >
                        <MapPinIcon size={17} aria-hidden />
                      </button>
                    </div>
                  </div>
                  {activeMapIndex === index && (
                    <div
                      id={`vehicle-route-map-${index}`}
                      className="overflow-hidden rounded-lg border border-line sm:col-span-2"
                    >
                      <iframe
                        title={`Google Maps route from ${detail.origin} to ${detail.destination}`}
                        src={googleMapsEmbedUrl(detail.origin.trim(), detail.destination.trim())}
                        className="h-44 w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <a
                        href={googleMapsRouteUrl(detail.origin.trim(), detail.destination.trim())}
                        target="_blank"
                        rel="noreferrer"
                        className="block border-t border-line px-3 py-2 text-xs font-medium text-brand-text hover:bg-surface-muted"
                      >
                        Open full route in Google Maps
                      </a>
                    </div>
                  )}
                  <Input
                    label="Purpose of travel"
                    placeholder="Site visit"
                    value={detail.purposeOfTravel}
                    error={errors[`vehicleDetails.${index}.purposeOfTravel`]}
                    onChange={(event) => updateVehicleDetail(index, 'purposeOfTravel', event.target.value)}
                    className="sm:col-span-2"
                  />
                  <Textarea
                    label="Remarks (optional)"
                    placeholder="Additional trip notes…"
                    value={detail.remarks}
                    onChange={(event) => updateVehicleDetail(index, 'remarks', event.target.value)}
                    className="sm:col-span-2"
                  />
                </div>
                {vehicleDetails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setVehicleDetails((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    className="inline-flex items-center gap-2 text-sm font-medium text-danger-text hover:text-danger"
                  >
                    <Trash2Icon size={15} aria-hidden />
                    Remove trip
                  </button>
                )}
              </fieldset>
            ))}
            {errors.vehicleDetails && <p className="text-sm text-danger-text">{errors.vehicleDetails}</p>}
            <button
              type="button"
              onClick={() => setVehicleDetails((current) => [...current, emptyTravelDetail()])}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-muted"
            >
              <PlusIcon size={16} aria-hidden />
              Add another trip
            </button>
          </section>
        )}
      </form>
    </Modal>
  );
}
