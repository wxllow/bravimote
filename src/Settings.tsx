import React from 'react';
import { useSettings } from '@/lib/config';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const themes: { label: string; value: string }[] = [
    { label: 'Teal', value: 'teal' },
    { label: 'Blue', value: 'blue' },
    { label: 'Green', value: 'green' },
    { label: 'Lavender', value: 'lavender' },
    { label: 'Pink', value: 'pink' }
];

export default function SettingsPage() {
    const [settings, setSettings] = useSettings();

    return (
        <div className="w-full max-w-md space-y-8">
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <section className="space-y-6">
                <div>
                    <h2 className="text-lg">Theme</h2>
                    <p className="text-sm text-muted-foreground">
                        Choose how the app determines light or dark appearance.
                    </p>
                </div>
                <div className="flex items-center justify-between gap-4 p-4 rounded-md border bg-card">
                    <div className="space-y-0.5">
                        <Label htmlFor="use-system">Use system theme</Label>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            Automatically apply theme based on your system
                            setting.
                        </p>
                    </div>
                    <Switch
                        id="use-system"
                        checked={settings.useSystemTheme}
                        onCheckedChange={(checked) =>
                            setSettings({ useSystemTheme: checked })
                        }
                    />
                </div>
                <div className="flex items-center justify-between gap-4 p-4 rounded-md border bg-card">
                    <div className="space-y-0.5">
                        <Label htmlFor="vibrant">Vibrant theme</Label>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            Enable vibrant colors for the selected theme.
                        </p>
                    </div>
                    <Switch
                        id="vibrant"
                        checked={settings.vibrantTheme}
                        onCheckedChange={(checked) =>
                            setSettings({ vibrantTheme: checked })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="theme-select">Select a Theme</Label>
                    <select
                        id="theme-select"
                        disabled={settings.useSystemTheme}
                        className={cn(
                            'w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2',
                            settings.useSystemTheme &&
                                'opacity-50 cursor-not-allowed'
                        )}
                        value={settings.theme}
                        onChange={(e) =>
                            setSettings({
                                theme: e.target.value
                            })
                        }
                    >
                        {themes.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                        Disabled while using system theme.
                    </p>
                </div>
            </section>
        </div>
    );
}
