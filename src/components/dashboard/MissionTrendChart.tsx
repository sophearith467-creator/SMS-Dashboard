import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { useChartColors } from '../../hooks/useChartColors';
import type { MissionSummary } from '../../types/analytics';

export function MissionTrendChart({ data }: {data: MissionSummary['trend'];}) {
  const colors = useChartColors();

  return (
    <div className="h-[268px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray="4 4" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.axis, fontSize: 12 }}
            dy={8} />
          
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.axis, fontSize: 12 }}
            width={44} />
          
          <Tooltip
            cursor={{ stroke: colors.grid, strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 12,
              boxShadow: '0 12px 40px -12px rgb(15 23 42 / 0.22)',
              fontSize: 12,
              color: colors.tooltipText
            }}
            labelStyle={{ color: colors.tooltipText, fontWeight: 600, marginBottom: 4 }} />
          
          <Area
            type="monotone"
            dataKey="submitted"
            name="Submitted"
            stroke={colors.brand}
            strokeWidth={2}
            fill={colors.brand}
            fillOpacity={0.12}
            activeDot={{ r: 4, strokeWidth: 0 }} />
          
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke={colors.success}
            strokeWidth={2}
            fill={colors.success}
            fillOpacity={0.1}
            activeDot={{ r: 4, strokeWidth: 0 }} />
          
        </AreaChart>
      </ResponsiveContainer>
    </div>);

}