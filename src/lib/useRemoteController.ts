import { useState, useRef, useEffect } from 'react';
import API from './api';
import { Code } from './ircc-codes';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export function useRemoteController() {
    const [intervalId, setIntervalId] = useState<number>(0);
    const [advanced, setAdvanced] = useState(
        localStorage.getItem('setting:advanced') === 'true'
    );
    const [tvInp, setTvInp] = useState(
        localStorage.getItem('setting:tvInp') === 'true'
    );
    const [connected, setConnected] = useState(false);
    const [powerStatus, setPowerStatus] = useState<string | null>(null);
    const [lastPressed, setLastPressed] = useState<string | null>(null);
    const holdIntervalRef = useRef<number | null>(null);
    const heldButtonNameRef = useRef<string | null>(null);
    const heldCodeRef = useRef<Code | null>(null);
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const hostname = params.get('hostname');
    const mode = params.get('mode') || 'pin';
    const psk = params.get('psk') ?? undefined;

    if (!hostname) throw new Error('Hostname is required');
    if (!['pin', 'psk'].includes(mode)) {
        toast.error('An internal error occurred. Please try again.');
        navigate('/');
        return {};
    }
    if (mode === 'psk' && !psk) {
        toast.error('An internal error occurred. Please try again.');
        navigate('/');
        return {};
    }

    const api = new API(hostname, mode as 'pin' | 'psk', psk);

    const startHold = (code: Code, buttonName: string) => {
        if (holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
        heldButtonNameRef.current = buttonName;
        heldCodeRef.current = code;
        setLastPressed(buttonName);
        api.sendIRCC(code);
        holdIntervalRef.current = window.setInterval(() => {
            if (heldCodeRef.current) {
                api.sendIRCC(heldCodeRef.current);
            }
        }, 150);
    };

    const stopHold = () => {
        if (holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
        heldCodeRef.current = null;
        const name = heldButtonNameRef.current;
        heldButtonNameRef.current = null;
        if (name) {
            setTimeout(() => setLastPressed(null), 150);
        } else {
            setLastPressed(null);
        }
    };

    const getPressHandlers = (code: Code, buttonName: string) => ({
        onPointerDown: (e: React.PointerEvent) => {
            e.preventDefault();
            startHold(code, buttonName);
        },
        onPointerUp: () => stopHold(),
        onPointerLeave: () => stopHold(),
        onPointerCancel: () => stopHold(),
        onContextMenu: (e: React.MouseEvent) => e.preventDefault()
    });

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
                toast.error('Failed to connect to the TV.');
                navigate('/');
                clearTimeout(intervalId);
            });
    }

    async function connect() {
        if (api.mode === 'pin') {
            await api.wakeUp();
            await api.connect().catch((err) => {
                if (err.response.status !== 401) {
                    toast.error('Failed to connect to the TV.');
                    navigate('/');
                    return;
                }
                const pin = prompt('Enter the PIN displayed on your TV:');
                if (!pin) {
                    toast.error('Connection cancelled.');
                    navigate('/');
                    return;
                }
                api.connect(pin, err.clientId).catch(() => {
                    toast.error('Failed to connect to the TV.');
                    navigate('/');
                });
            });
        }
        update();
    }

    useEffect(() => {
        connect();
    }, []);

    useEffect(() => {
        return () => {
            if (holdIntervalRef.current) {
                clearInterval(holdIntervalRef.current);
            }
        };
    }, []);

    return {
        advanced,
        setAdvanced,
        tvInp,
        setTvInp,
        connected,
        powerStatus,
        lastPressed,
        getPressHandlers,
        intervalId,
        setIntervalId,
        navigate,
        api
    };
}
