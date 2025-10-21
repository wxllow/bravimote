import React, { useEffect, useState } from 'react';
import { Device } from './lib/types';
import { Button } from './components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { Loader2, Settings } from 'lucide-react';

export default function Pair() {
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(true);
    const [devices, setDevices] = useState<Device[]>([]);
    const [rememberedDevices, setRememberedDevices] = useState<Device[]>([]);

    async function scanDevices(timeout = 5) {
        setScanning(true);

        await invoke('discover_devices', { timeout })
            .then((res) => {
                setDevices(
                    (res as Device[]).filter(
                        (d) =>
                            !rememberedDevices.find(
                                (rd) => rd.hostname === d.hostname
                            )
                    )
                );
                setScanning(false);
            })
            .catch((err) => {
                console.error('Error invoking discover_devices:', err);
            });
    }

    useEffect(() => {
        loadRememberedDevices();
        scanDevices();
    }, []);

    // Load remembered devices from localStorage (inside component)
    function loadRememberedDevices() {
        const remembered: Device[] = [];
        if (typeof window !== 'undefined' && window.localStorage) {
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key && key.startsWith('device:')) {
                    const value = JSON.parse(
                        window.localStorage.getItem(key) || 'null'
                    );

                    if (value && value.cookie) {
                        remembered.push({
                            id: value.id || key,
                            hostname: key.replace('device:', ''),
                            displayName:
                                value.displayName || key.replace('device:', ''),
                            model: value.model || 'Unknown'
                        });
                    }
                }
            }
        }

        setRememberedDevices(remembered);
    }

    return (
        <div>
            <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold">Connect Your TV</h1>
                <Button
                    className="px-4 py-2 ml-4"
                    variant="outline"
                    onClick={() => navigate('/settings')}
                >
                    <Settings />
                </Button>
            </div>
            <p className="text-gray-500 mt-2 mb-4 max-w-lg">
                Please select your TV to pair with it. Your TV must be on for
                the initial pairing. Make sure you are on the same network as
                your TV.
            </p>
            {/* Remembered Devices */}
            {rememberedDevices.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">
                        Remembered Devices
                    </h2>
                    <div className="gap-4 mb-4">
                        {rememberedDevices.map((device) => (
                            <Button
                                key={device.id}
                                className="px-4 py-2"
                                onClick={() => {
                                    navigate(
                                        `/remote?hostname=${encodeURIComponent(
                                            device.hostname
                                        )}&mode=pin`
                                    );
                                }}
                            >
                                {device.displayName
                                    ? `${device.displayName} [${device.hostname}]`
                                    : device.hostname}
                            </Button>
                        ))}
                    </div>
                    <hr className="my-4" />
                </div>
            )}
            <h2 className="text-2xl font-semibold mb-2">Available Devices</h2>
            {/* Device List */}
            <div className="gap-4 mb-4">
                {devices.length > 0 &&
                    devices.map((device) => (
                        <Button
                            key={device.id}
                            className="px-4 py-2"
                            onClick={() => {
                                navigate(
                                    `/remote?hostname=${encodeURIComponent(
                                        device.hostname
                                    )}&mode=pin`
                                );
                            }}
                        >
                            {device.displayName
                                ? `${device.displayName} [${device.hostname}]`
                                : device.hostname}
                        </Button>
                    ))}
                {devices.length === 0 && !scanning && (
                    <p className="text-gray-500">No devices found.</p>
                )}
                {scanning && (
                    <Loader2 className="animate-spin h-6 w-6 mx-auto text-blue-500" />
                )}
            </div>
            <div className="flex items-centermt-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant={'outline'}>Connect Manually</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                const ip = e.currentTarget.ip.value.trim();
                                const psk = e.currentTarget.psk.value.trim();

                                navigate(
                                    `/remote?hostname=${encodeURIComponent(
                                        ip
                                    )}&psk=${encodeURIComponent(psk)}&mode=psk`
                                );
                            }}
                        >
                            <DialogHeader>
                                <DialogTitle>Connect Manually</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="ip">IP Address</Label>
                                    <Input
                                        id="ip"
                                        name="ip"
                                        placeholder="e.g. 192.168.x.x"
                                        required
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="psk">PSK</Label>
                                    <Input
                                        id="psk"
                                        name="psk"
                                        placeholder="e.g. 123456"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>

                                {/* Submit button */}
                                <Button type="submit">Connect</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <Button
                    className="px-4 py-2 ml-2"
                    variant={'secondary'}
                    onClick={async () => {
                        await scanDevices(8);
                    }}
                >
                    Reload
                </Button>
                <Button
                    className="px-4 py-2 ml-2"
                    variant="destructive"
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                >
                    Clear Storage
                </Button>
            </div>
        </div>
    );
}
