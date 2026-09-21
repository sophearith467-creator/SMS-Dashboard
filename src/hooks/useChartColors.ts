import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

export interface ChartColors {
  brand: string;
  brandSoft: string;
  success: string;
  warning: string;
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

export function useChartColors(): ChartColors {
  const { theme } = useTheme();

  return useMemo<ChartColors>(() => {
    const dark = theme === 'dark';
    return {
      brand: dark ? '#818cf8' : '#4f46e5',
      brandSoft: dark ? '#4338ca' : '#c7d2fe',
      success: dark ? '#34d399' : '#10b981',
      warning: dark ? '#fbbf24' : '#f59e0b',
      grid: dark ? '#1e293b' : '#e2e8f0',
      axis: dark ? '#64748b' : '#94a3b8',
      tooltipBg: dark ? '#0f172a' : '#ffffff',
      tooltipBorder: dark ? '#1e293b' : '#e2e8f0',
      tooltipText: dark ? '#f1f5f9' : '#0f172a'
    };
  }, [theme]);
}