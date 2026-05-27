import React from 'react';
import { Button } from '@/components/ui/button';
import { VolumeX, Volume2, Plus, Minus } from 'lucide-react';
import { Code } from '../../lib/ircc-codes';

interface VolumeControlsProps {
    getPressHandlers: (code: Code, buttonName: string) => any;
    tvInp: boolean;
}

export const VolumeControls: React.FC<VolumeControlsProps> = ({
    getPressHandlers,
    tvInp
}) => (
    <div className={`grid ${tvInp ? 'grid-cols-2' : ''} gap-4 mb-6`}>
        <div className="space-y-2">
            <Button
                variant="outline"
                className="w-full rounded-full "
                {...getPressHandlers(Code.Mute, 'Mute')}
            >
                <VolumeX className="h-5 w-5" />
            </Button>
            <Button
                variant="outline"
                className="w-full rounded-full "
                {...getPressHandlers(Code.VolumeUp, 'Volume Up')}
            >
                <Volume2 className="h-5 w-5 mr-2" /> +
            </Button>
            <Button
                variant="outline"
                className="w-full rounded-full "
                {...getPressHandlers(Code.VolumeDown, 'Volume Down')}
            >
                <Volume2 className="h-5 w-5 mr-2" /> -
            </Button>
        </div>
        {tvInp && (
            <div className="space-y-2">
                <Button
                    variant="outline"
                    className="w-full rounded-full "
                    {...getPressHandlers(Code.ChannelUp, 'Channel Up')}
                >
                    CH +
                </Button>
                <Button
                    variant="outline"
                    className="w-full rounded-full "
                    {...getPressHandlers(Code.FlashPlus, 'Flash +')}
                >
                    <Plus className="h-5 w-5" />
                </Button>
                <Button
                    variant="outline"
                    className="w-full rounded-full "
                    {...getPressHandlers(Code.ChannelDown, 'Channel Down')}
                >
                    CH -
                </Button>
            </div>
        )}
    </div>
);
