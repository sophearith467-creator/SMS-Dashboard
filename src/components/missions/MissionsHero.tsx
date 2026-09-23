import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2Icon, ClockIcon, MapIcon, PlusIcon, RouteIcon } from 'lucide-react';

interface MissionsHeroProps {
  total: number;
  inReview: number;
  approved: number;
  settled: number;
  onCreateMission: () => void;
}

export function MissionsHero({ total, inReview, approved, settled, onCreateMission }: MissionsHeroProps) {
  const tiles = [
    { key: 'total', label: 'Total missions', value: total, icon: MapIcon },
    { key: 'inReview', label: 'In review', value: inReview, icon: ClockIcon },
    { key: 'approved', label: 'Approved', value: approved, icon: CheckCircle2Icon },
    { key: 'settled', label: 'Settled', value: settled, icon: RouteIcon },
  ] as const;

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-brand bg-[length:200%_200%] p-6 shadow-glow animate-gradient-pan sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-white/10 blur-3xl animate-float-delayed"
      />
      <RouteIcon
        aria-hidden
        strokeWidth={1}
        className="pointer-events-none absolute -right-6 top-1/2 h-52 w-52 -translate-y-1/2 text-white/10 sm:h-64 sm:w-64"
      />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between animate-fade-in-up">
          <div>
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[26px]">
              Missions
            </h1>
            <p className="mt-1 text-[13.5px] text-white/75">
              Every mission request, from draft through settlement.
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateMission}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand-strong shadow-pop transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            <PlusIcon size={16} aria-hidden />
            New mission
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((tile, index) => {
            const Icon = tile.icon;
            return (
              <motion.div
                key={tile.key}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.1 + index * 0.07, ease: [0.23, 1, 0.32, 1] }}
                className="group rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-colors duration-200 hover:bg-white/15"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white transition-transform duration-300 ease-out group-hover:scale-110">
                  <Icon size={15} aria-hidden />
                </span>
                <p className="mt-3 text-[22px] font-semibold leading-none tabular-nums text-white">{tile.value}</p>
                <p className="mt-1.5 text-[12px] text-white/70">{tile.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
