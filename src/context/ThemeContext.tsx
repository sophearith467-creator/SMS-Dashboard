import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState } from
'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'mms.theme';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialTheme(defaultTheme: Theme): Theme {
  if (typeof window === 'undefined') return defaultTheme;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return defaultTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light'



}: {children: React.ReactNode;defaultTheme?: Theme;}) {
  const [theme, setTheme] = useState<Theme>(() => readInitialTheme(defaultTheme));
  const previousDefault = useRef(defaultTheme);

  useEffect(() => {
    if (previousDefault.current !== defaultTheme) {
      previousDefault.current = defaultTheme;
      setTheme(defaultTheme);
    }
  }, [defaultTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => current === 'dark' ? 'light' : 'dark');
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}