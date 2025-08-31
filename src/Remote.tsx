import React, { useState } from 'react';
import { useEffect } from 'react';
import API from './lib/api';
import config from './lib/config';
import { Button } from '@/components/ui/button';
import { Code } from './lib/ircc-codes';
import {
    Power,
    Volume2,
    VolumeX,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Home,
    Settings,
    Menu,
    ArrowLeft,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Tv,
    HelpCircle,
    Info,
    MoreHorizontal,
    Square,
    Plus,
    Minus,
    Dot,
    Subtitles,
    ListVideo,
    CircleDot,
    House,
    Keyboard
} from 'lucide-react';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function Remote() {
    const [intervalId, setIntervalId] = useState<number>(0);

    const navigate = useNavigate();

    // Settings
    const [advanced, setAdvanced] = useState(
        localStorage.getItem('setting:advanced') === 'true'
    );
    const [tvInp, setTvInp] = useState(
        localStorage.getItem('setting:tvInp') === 'true'
    );

    // Connection state
    const [connected, setConnected] = React.useState(false);
    const [powerStatus, setPowerStatus] = React.useState<string | null>(null);
    const [lastPressed, setLastPressed] = useState<string | null>(null);

    // Connection parameters
    const [params, setParams] = useSearchParams();
    const hostname = params.get('hostname');
    const mode = params.get('mode') || 'pin';
    const psk = params.get('psk') ?? undefined;

    if (!hostname) throw new Error('Hostname is required');
    if (!['pin', 'psk'].includes(mode)) {
        toast.error('An internal error occurred. Please try again.');
        console.error('Mode must be either "pin" or "psk".');
        navigate('/');
        return <></>;
    }

    if (mode === 'psk' && !psk) {
        toast.error('An internal error occurred. Please try again.');
        console.error('PSK is required when mode is "psk".');
        navigate('/');
        return <></>;
    }

    const api = new API(hostname, mode as 'pin' | 'psk', psk);

    const handleButtonPress = (code: Code, buttonName: string) => {
        setLastPressed(buttonName);
        api.sendIRCC(code).finally(() => {
            // Reset the visual feedback after a short delay
            setTimeout(() => {
                setLastPressed(null);
            }, 200);
        });
    };

    async function update() {
        api.getPowerStatus()
            .then((data) => {
                setPowerStatus(data.status);
                setConnected(true);
                setIntervalId(
                    setTimeout(() => {
                        update();
                    }, 500)
                );
            })
            .catch((error) => {
                console.error('Error connecting to TV:', error);
                toast.error('Failed to connect to the TV.');
                navigate('/');
                clearInterval(intervalId);
            });
    }

    async function connect() {
        if (api.mode === 'pin') {
            await api.connect().catch((err) => {
                if (err.response.status !== 401) {
                    toast.error('Failed to connect to the TV.');
                    navigate('/');
                    return <></>;
                }

                const pin = prompt('Enter the PIN displayed on your TV:');
                if (!pin) {
                    toast.error('Connection cancelled.');
                    navigate('/');
                    return <></>;
                }
                api.connect(pin, err.clientId).catch((err) => {
                    console.error('Connection error:', err);
                    toast.error('Failed to connect to the TV.');
                    navigate('/');
                    return <></>;
                });
            });
        }

        update();
    }
    useEffect(() => {
        connect();
    }, []);

    return (
        <div className="w-full max-w-[320px] mx-auto space-y-2">
            <p>{connected ? 'Connected' : 'Not Connected'}</p>
            <div className="bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-800">
                {/* Status display */}
                <div className="bg-gray-800 rounded-lg p-3 mb-6 text-center">
                    <p className="text-gray-400 text-sm">
                        {lastPressed
                            ? `Button: ${lastPressed}`
                            : `TV Remote - ${
                                  powerStatus === 'active' ? 'On' : 'Standby'
                              }`}
                    </p>
                </div>

                {/* Power and input */}
                <div className="flex justify-between mb-6">
                    <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full h-12 w-12"
                        onClick={() =>
                            api.setPowerStatus(!(powerStatus === 'active'))
                        }
                    >
                        <Power className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-12 w-12 bg-gray-800 border-gray-700"
                        onClick={() => {
                            // get text input from browser
                            const input = prompt('Text:');

                            if (input) {
                                api.setTextForm(input);
                            }
                        }}
                    >
                        <Keyboard className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-12 w-12 bg-gray-800 border-gray-700"
                        onClick={() => handleButtonPress(Code.Input, 'Input')}
                    >
                        <ListVideo className="h-6 w-6" />
                    </Button>
                </div>

                {/* Media controls */}
                <div className="grid grid-cols-5 gap-2 mb-6">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-10 w-10 bg-gray-800 border-gray-700"
                        onClick={() => handleButtonPress(Code.Prev, 'Previous')}
                    >
                        <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-10 w-10 bg-gray-800 border-gray-700"
                        onClick={() => handleButtonPress(Code.Play, 'Play')}
                    >
                        <Play className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-10 w-10 bg-gray-800 border-gray-700"
                        onClick={() => handleButtonPress(Code.Pause, 'Pause')}
                    >
                        <Pause className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-10 w-10 bg-gray-800 border-gray-700"
                        onClick={() => handleButtonPress(Code.Stop, 'Stop')}
                    >
                        <Square className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-10 w-10 bg-gray-800 border-gray-700"
                        onClick={() => handleButtonPress(Code.Next, 'Next')}
                    >
                        <SkipForward className="h-4 w-4" />
                    </Button>
                </div>

                {/* HDMI inputs */}
                {advanced && (
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <Button
                            variant="outline"
                            className="rounded-lg bg-gray-800 border-gray-700 text-xs"
                            onClick={() =>
                                handleButtonPress(Code.Hdmi1, 'HDMI 1')
                            }
                        >
                            HDMI 1
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-lg bg-gray-800 border-gray-700 text-xs"
                            onClick={() =>
                                handleButtonPress(Code.Hdmi2, 'HDMI 2')
                            }
                        >
                            HDMI 2
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-lg bg-gray-800 border-gray-700 text-xs"
                            onClick={() =>
                                handleButtonPress(Code.Hdmi3, 'HDMI 3')
                            }
                        >
                            HDMI 3
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-lg bg-gray-800 border-gray-700 text-xs"
                            onClick={() =>
                                handleButtonPress(Code.Hdmi4, 'HDMI 4')
                            }
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
                        onClick={() => handleButtonPress(Code.Yellow, 'Yellow')}
                    >
                        <span className="sr-only">Yellow</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-full h-7 !bg-blue-900 !border-blue-800 !hover:bg-blue-800"
                        onClick={() => handleButtonPress(Code.Blue, 'Blue')}
                    >
                        <span className="sr-only">Blue</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-full h-7 !bg-red-900 !border-red-800 hover:!bg-red-800"
                        onClick={() => handleButtonPress(Code.Red, 'Red')}
                    >
                        <span className="sr-only">Red</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-full h-7 !bg-green-900 !border-green-800 hover:!bg-green-800"
                        onClick={() => handleButtonPress(Code.Green, 'Green')}
                    >
                        <span className="sr-only">Green</span>
                    </Button>
                </div>

                {/* Navigation pad */}
                <div className="mb-6">
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant="secondary"
                            className="rounded-full h-12 bg-gray-800"
                            onClick={() => handleButtonPress(Code.Home, 'Home')}
                        >
                            <House className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="secondary"
                            className="rounded-full h-12"
                            onClick={() => handleButtonPress(Code.Up, 'Up')}
                        >
                            <ChevronUp className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="secondary"
                            className="rounded-full h-12 bg-gray-800"
                            onClick={() =>
                                handleButtonPress(Code.Display, 'Display')
                            }
                        >
                            <Info className="h-6 w-6" />
                        </Button>

                        <Button
                            variant="secondary"
                            className="rounded-full h-12"
                            onClick={() => handleButtonPress(Code.Left, 'Left')}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="secondary"
                            className="rounded-full h-12 bg-gray-700"
                            onClick={() =>
                                handleButtonPress(Code.Confirm, 'OK')
                            }
                        >
                            <CircleDot className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="secondary"
                            className="rounded-full h-12"
                            onClick={() =>
                                handleButtonPress(Code.Right, 'Right')
                            }
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>

                        <Button
                            variant="secondary"
                            className="rounded-full h-12 bg-gray-800"
                            onClick={() => handleButtonPress(Code.Back, 'Back')}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="secondary"
                            className="rounded-full h-12"
                            onClick={() => handleButtonPress(Code.Down, 'Down')}
                        >
                            <ChevronDown className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="secondary"
                            className="rounded-full h-12 bg-gray-800"
                            onClick={() =>
                                handleButtonPress(Code.Options, 'Options')
                            }
                        >
                            <MoreHorizontal className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* Additional controls */}
                {advanced && (
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Help, 'Help')}
                        >
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.CC, 'CC')}
                        >
                            <Subtitles className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10 bg-gray-800 border-gray-700"
                            onClick={() =>
                                handleButtonPress(Code.SyncMenu, 'Sync Menu')
                            }
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10 bg-gray-800 border-gray-700"
                            onClick={() =>
                                handleButtonPress(Code.Audio, 'Audio')
                            }
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Volume and Channel */}
                <div
                    className={`grid ${tvInp ? 'grid-cols-2' : ''} gap-4 mb-6`}
                >
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full rounded-full bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Mute, 'Mute')}
                        >
                            <VolumeX className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full rounded-full bg-gray-800 border-gray-700"
                            onClick={() =>
                                handleButtonPress(Code.VolumeUp, 'Volume Up')
                            }
                        >
                            <Volume2 className="h-5 w-5 mr-2" /> +
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full rounded-full bg-gray-800 border-gray-700"
                            onClick={() =>
                                handleButtonPress(
                                    Code.VolumeDown,
                                    'Volume Down'
                                )
                            }
                        >
                            <Volume2 className="h-5 w-5 mr-2" /> -
                        </Button>
                    </div>
                    {tvInp && (
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full rounded-full bg-gray-800 border-gray-700"
                                onClick={() =>
                                    handleButtonPress(
                                        Code.ChannelUp,
                                        'Channel Up'
                                    )
                                }
                            >
                                CH +
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full rounded-full bg-gray-800 border-gray-700"
                                onClick={() =>
                                    handleButtonPress(Code.FlashPlus, 'Flash +')
                                }
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full rounded-full bg-gray-800 border-gray-700"
                                onClick={() =>
                                    handleButtonPress(
                                        Code.ChannelDown,
                                        'Channel Down'
                                    )
                                }
                            >
                                CH -
                            </Button>
                        </div>
                    )}
                </div>

                {/* Number pad */}
                {tvInp && (
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Num1, '1')}
                        >
                            1
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Num2, '2')}
                        >
                            2
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Num3, '3')}
                        >
                            3
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Num4, '4')}
                        >
                            4
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Num5, '5')}
                        >
                            5
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Num6, '6')}
                        >
                            6
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Num7, '7')}
                        >
                            7
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Num8, '8')}
                        >
                            8
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Num9, '9')}
                        >
                            9
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Dot, '.')}
                        >
                            <Dot className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() => handleButtonPress(Code.Num0, '0')}
                        >
                            0
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full h-12 bg-gray-800 border-gray-700"
                            onClick={() =>
                                handleButtonPress(Code.FlashMinus, 'Flash -')
                            }
                        >
                            <Minus className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <Switch
                    id="tv"
                    checked={tvInp}
                    onCheckedChange={() => {
                        localStorage.setItem('setting:tvInp', `${!tvInp}`);
                        setTvInp(!tvInp);
                    }}
                />
                <Label htmlFor="tv">TV Input</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch
                    id="adv"
                    checked={advanced}
                    onCheckedChange={() => {
                        localStorage.setItem(
                            'setting:advanced',
                            `${!advanced}`
                        );
                        setAdvanced(!advanced);
                    }}
                />
                <Label htmlFor="adv">Advanced</Label>
            </div>
        </div>
    );
}
