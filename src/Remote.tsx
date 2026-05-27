import React from 'react';
import { Button } from '@/components/ui/button';
import { Code } from './lib/ircc-codes';
import { useRemoteController } from './lib/useRemoteController';
import { MediaControls } from './components/remote/MediaControls';
import { NavigationPad } from './components/remote/NavigationPad';
import { VolumeControls } from './components/remote/VolumeControls';
import { NumberPad } from './components/remote/NumberPad';
import { ErrorBoundary } from './components/remote/ErrorBoundary';
import {
    Power,
    Keyboard,
    ListVideo,
    HelpCircle,
    Subtitles,
    Menu,
    Settings,
    ArrowLeft
} from 'lucide-react';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';

export default function Remote() {
    const {
        advanced = false,
        setAdvanced = () => {},
        tvInp = false,
        setTvInp = () => {},
        connected = false,
        powerStatus = null,
        lastPressed = null,
        getPressHandlers = () => ({}),
        intervalId = 0,
        setIntervalId = () => {},
        navigate = () => {},
        api = undefined
    } = useRemoteController();

    return (
        <ErrorBoundary>
            <div className="w-full max-w-[320px] mx-auto space-y-2">
                {/* Back button and status */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-8 w-8"
                        onClick={() => {
                            clearTimeout(intervalId);
                            if (navigate) navigate('/');
                        }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </div>
                <p>{connected ? 'Connected' : 'Not Connected'}</p>
                <div className="bg-card rounded-3xl p-6 shadow-xl border border-border">
                    {/* Status display */}
                    <div className="bg-primary rounded-lg p-3 mb-6 text-center">
                        <p className="text-primary-foreground text-sm">
                            {lastPressed
                                ? `Button: ${lastPressed}`
                                : `TV Remote - ${
                                      powerStatus === 'active'
                                          ? 'On'
                                          : 'Standby'
                                  }`}
                        </p>
                    </div>
                    {/* Power and input */}
                    <div className="flex justify-between mb-6">
                        <Button
                            variant="destructive"
                            size="icon"
                            className="rounded-full h-12 w-12  !bg-red-500"
                            onClick={() => {
                                let newStatus = !(powerStatus === 'active');
                                if (api)
                                    api.setPowerStatus(
                                        !(powerStatus === 'active')
                                    );
                                if (!newStatus) {
                                    clearTimeout(intervalId);
                                    setTimeout(() => {
                                        if (navigate) navigate('/');
                                    }, 3000);
                                }
                            }}
                        >
                            <Power className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-12 w-12 "
                            onClick={() => {
                                const input = prompt('Text:');
                                if (input && api) {
                                    api.setTextForm(input);
                                }
                            }}
                        >
                            <Keyboard className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-12 w-12"
                            {...(getPressHandlers
                                ? getPressHandlers(Code.Input, 'Input')
                                : {})}
                        >
                            <ListVideo className="h-6 w-6" />
                        </Button>
                    </div>
                    {/* Media controls */}
                    <MediaControls getPressHandlers={getPressHandlers} />
                    {/* HDMI inputs */}
                    {advanced && (
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            <Button
                                variant="outline"
                                className="rounded-lg  text-xs"
                                {...getPressHandlers(Code.Hdmi1, 'HDMI 1')}
                            >
                                HDMI 1
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-lg  text-xs"
                                {...getPressHandlers(Code.Hdmi2, 'HDMI 2')}
                            >
                                HDMI 2
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-lg  text-xs"
                                {...getPressHandlers(Code.Hdmi3, 'HDMI 3')}
                            >
                                HDMI 3
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-lg  text-xs"
                                {...getPressHandlers(Code.Hdmi4, 'HDMI 4')}
                            >
                                HDMI 4
                            </Button>
                        </div>
                    )}
                    {/* Color buttons */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <Button
                            variant="outline"
                            className="rounded-full h-7 !bg-yellow-900 !border-yellow-800 hover:!bg-yellow-800"
                            {...(getPressHandlers
                                ? getPressHandlers(Code.Yellow, 'Yellow')
                                : {})}
                        >
                            <span className="sr-only">Yellow</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-7 !bg-blue-900 !border-blue-800 !hover:bg-blue-800"
                            {...(getPressHandlers
                                ? getPressHandlers(Code.Blue, 'Blue')
                                : {})}
                        >
                            <span className="sr-only">Blue</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-7 !bg-red-900 !border-red-800 hover:!bg-red-800"
                            {...(getPressHandlers
                                ? getPressHandlers(Code.Red, 'Red')
                                : {})}
                        >
                            <span className="sr-only">Red</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-7 !bg-green-900 !border-green-800 hover:!bg-green-800"
                            {...(getPressHandlers
                                ? getPressHandlers(Code.Green, 'Green')
                                : {})}
                        >
                            <span className="sr-only">Green</span>
                        </Button>
                    </div>
                    {/* Navigation pad */}
                    <NavigationPad getPressHandlers={getPressHandlers} />
                    {/* Additional controls */}
                    {advanced && (
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full h-10 w-10 "
                                {...getPressHandlers(Code.Help, 'Help')}
                            >
                                <HelpCircle className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full h-10 w-10 "
                                {...getPressHandlers(Code.CC, 'CC')}
                            >
                                <Subtitles className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full h-10 w-10 "
                                {...getPressHandlers(
                                    Code.SyncMenu,
                                    'Sync Menu'
                                )}
                            >
                                <Menu className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full h-10 w-10 "
                                {...getPressHandlers(Code.Audio, 'Audio')}
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    {/* Volume and Channel */}
                    <VolumeControls
                        getPressHandlers={getPressHandlers}
                        tvInp={!!tvInp}
                    />
                    {/* Number pad */}
                    {tvInp && <NumberPad getPressHandlers={getPressHandlers} />}
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="tv"
                        checked={!!tvInp}
                        onCheckedChange={() => {
                            localStorage.setItem('setting:tvInp', `${!tvInp}`);
                            if (setTvInp) setTvInp(!tvInp);
                        }}
                    />
                    <Label htmlFor="tv">Numpad</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="adv"
                        checked={!!advanced}
                        onCheckedChange={() => {
                            localStorage.setItem(
                                'setting:advanced',
                                `${!advanced}`
                            );
                            if (setAdvanced) setAdvanced(!advanced);
                        }}
                    />
                    <Label htmlFor="adv">Advanced</Label>
                </div>
            </div>
        </ErrorBoundary>
    );
}
