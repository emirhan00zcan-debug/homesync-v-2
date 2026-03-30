"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type ThemeType = 'light' | 'dark';

type ThemeContextType = {
    theme: ThemeType;
    toggleTheme: () => void;
    isLightOn: boolean;
    toggleLight: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { },
    isLightOn: false,
    toggleLight: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const [theme, setTheme] = useState<ThemeType>('dark');

    const forceDarkRoutes = [
        '/',
        '/katalog',
        '/magazalar',
        '/usta-hizmetleri',
        '/hakkimizda',
        '/auth',
        '/cart',
        '/checkout'
    ];

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Öncelikle route bazlı ana tema uyumu (anasayfa simetrisi)
        const isForceDark = forceDarkRoutes.some((route) => pathname?.startsWith(route));
        if (isForceDark) {
            setTheme('dark');
            window.localStorage.setItem('theme', 'dark');
            return;
        }

        // Daha önce seçilmiş temayı koru (dashboard/yeni alanlar için kullanıcının seçimine izin ver)
        const savedTheme = window.localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme);
        } else {
            setTheme('dark');
        }
    }, [pathname]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('theme', theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ 
            theme, 
            toggleTheme,
            isLightOn: theme === 'light',
            toggleLight: toggleTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeEffect = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeEffect must be used within a ThemeProvider');
    }
    return context;
};
