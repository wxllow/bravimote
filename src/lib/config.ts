export type ThemeSetting = string;

export interface Settings {
    useSystemTheme: boolean;
    theme: ThemeSetting;
    vibrantTheme: boolean;
}

const STORAGE_KEY = 'app.settings.v1';

const defaultSettings: Settings = {
    useSystemTheme: false,
    theme: 'teal',
    vibrantTheme: true
};

let current: Settings | null = null;

type Listener = (settings: Settings) => void;
const listeners = new Set<Listener>();

export function loadSettings(): Settings {
    if (current) return current;

    return {
        ...defaultSettings,
        ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    };
}

function notify() {
    if (!current) return;

    for (const l of [...listeners]) {
        try {
            l(current);
        } catch (err) {
            console.error(err);
        }
    }
}

export interface UpdateSettingsInput {
    useSystemTheme?: boolean;
    theme?: ThemeSetting;
    vibrantTheme?: boolean;
}

export function updateSettings(patch: UpdateSettingsInput): Settings {
    const upd = { ...loadSettings(), ...patch };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(upd));
    notify();

    return upd;
}

export function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(loadSettings());

    return () => listeners.delete(listener);
}

import { useEffect, useState } from 'react';
export function useSettings(): [
    Settings,
    (patch: UpdateSettingsInput) => void
] {
    const [settings, setSettings] = useState<Settings>(() => loadSettings());

    useEffect(() => {
        return subscribe(setSettings);
    }, []);

    const mutate = (patch: UpdateSettingsInput) =>
        setSettings(updateSettings(patch));

    return [settings, mutate];
}

export const defaults = Object.freeze({ ...defaultSettings });
