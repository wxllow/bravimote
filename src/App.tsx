import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Remote from './Remote';
import Setup from './Setup';
import { platform } from '@tauri-apps/plugin-os';
import { M3 } from 'tauri-plugin-m3';
import Settings from './Settings';
import { useSettings } from './lib/config';
import axios from 'axios';
import { invoke } from '@tauri-apps/api/core';
import { findClosestTheme } from './lib/theming';

function Layout() {
    const [settings, setSettings] = useSettings();

    useEffect(() => {
        (async () => {
            let m3ColorScheme = await M3.getColors('dark');

            let themeName = settings.useSystemTheme
                ? 'blue'
                : `${settings.theme}${settings.vibrantTheme ? '-vibrant' : ''}`;

            let theme;

            if (m3ColorScheme && settings.useSystemTheme) {
                theme = {
                    background: m3ColorScheme.background,
                    foreground: m3ColorScheme.onBackground,

                    card: m3ColorScheme.surface,
                    'card-foreground': m3ColorScheme.onSurface,

                    popover: m3ColorScheme.surfaceVariant,
                    'popover-foreground': m3ColorScheme.onSurfaceVariant,

                    primary: m3ColorScheme.primary,
                    'primary-foreground': m3ColorScheme.onPrimary,

                    secondary: m3ColorScheme.secondary,
                    'secondary-foreground': m3ColorScheme.onSecondary,

                    muted: m3ColorScheme.surfaceVariant,
                    'muted-foreground': m3ColorScheme.onSurfaceVariant,

                    accent: m3ColorScheme.tertiary,
                    'accent-foreground': m3ColorScheme.onTertiary,

                    border: m3ColorScheme.outline,
                    input: m3ColorScheme.outline,

                    sidebar: m3ColorScheme.inverseSurface,
                    'sidebar-foreground': m3ColorScheme.inverseOnSurface,
                    'sidebar-primary': m3ColorScheme.inversePrimary,
                    'sidebar-accent': m3ColorScheme.secondaryContainer,
                    'sidebar-accent-foreground':
                        m3ColorScheme.onSecondaryContainer,
                    'sidebar-border': m3ColorScheme.outline
                };
            } else {
                theme = (
                    await axios.get(`/public/colors/dark/${themeName}.json`)
                ).data;
            }

            if (!m3ColorScheme && settings.useSystemTheme) {
                const color = await invoke('get_accent_color')
                    .then((c) => c as string)
                    .catch(() => null);

                console.debug('System accent color:', color);

                if (color) {
                    if (color.startsWith('#')) {
                        theme = (
                            await axios.get(
                                `/public/colors/dark/${findClosestTheme(
                                    color
                                )}${
                                    settings.vibrantTheme ? '-vibrant' : ''
                                }.json`
                            )
                        ).data;

                        theme.primary = color;
                    } else {
                        theme = (
                            await axios.get(
                                `/public/colors/dark/${
                                    {
                                        blue: 'blue',
                                        teal: 'teal',
                                        green: 'green',
                                        yellow: 'yellow',
                                        orange: 'pink',
                                        red: 'pink',
                                        pink: 'pink',
                                        purple: 'purple',
                                        slate: 'teal'
                                    }[color]
                                }${
                                    settings.vibrantTheme ? '-vibrant' : ''
                                }.json`
                            )
                        ).data;
                    }
                }
            }

            for (const [varName, colorValue] of Object.entries(theme)) {
                document.documentElement.style.setProperty(
                    `--${varName}`,
                    colorValue as string
                );
            }

            console.debug('Applied theme:', theme);
        })();
    }, [settings]);

    return (
        <>
            <div
                className={`flex flex-col p-4 ${
                    ['android', 'ios'].includes(platform()) ? 'mt-8' : ''
                }`}
            >
                <div className="flex items-center justify-center max-w-screen overflow-x-hidden">
                    <Outlet />
                </div>
            </div>
            <Toaster richColors />
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Setup />} />
                    <Route path="/remote" element={<Remote />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
