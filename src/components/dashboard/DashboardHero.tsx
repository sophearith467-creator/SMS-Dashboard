import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CompassIcon, PlusIcon, SparklesIcon } from 'lucide-react';

interface DashboardHeroProps {
  firstName: string;
  description: string;
  showApprovalsLink: boolean;
  onCreateMission: () => void;
}

export function DashboardHero({
  firstName,
  description,
  showApprovalsLink,
  onCreateMission,
}: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-brand bg-[length:200%_200%] p-8 shadow-glow animate-gradient-pan sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-float-delayed"
      />
      <CompassIcon
        aria-hidden
        strokeWidth={1}
        className="pointer-events-none absolute -right-4 top-1/2 h-56 w-56 -translate-y-1/2 text-white/10 sm:h-72 sm:w-72 animate-[spin_24s_linear_infinite]"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium text-white/90 backdrop-blur-sm">
            Live overview
          </span>
          <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
            Good morning, {firstName}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-white/75">{description}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          {showApprovalsLink && (
            <Link
              to="/approvals"
              className="hidden h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-150 ease-out hover:bg-white/20 sm:inline-flex"
            >
              Review approvals
              <ArrowRightIcon size={14} aria-hidden />
            </Link>
          )}
          <button
            type="button"
            onClick={onCreateMission}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand-strong shadow-pop transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            <PlusIcon size={16} aria-hidden />
            New mission
          </button>
        </div>
      </div>
    </div>
  );
}
