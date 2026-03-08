import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
    mode: ThemeMode;
    toggle: () => void;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'ibc-theme-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>(() => {
        if (typeof window === 'undefined') return 'dark';
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored === 'light' ? 'light' : 'dark';
    });

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, mode);
    }, [mode]);

    const value = useMemo(
        () => ({
            mode,
            setMode,
            toggle: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
        }),
        [mode],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
