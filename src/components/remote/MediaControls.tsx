import React from 'react';
import { Button } from '@/components/ui/button';
import { SkipBack, Play, Pause, Square, SkipForward } from 'lucide-react';
import { Code } from '../../lib/ircc-codes';

interface MediaControlsProps {
    getPressHandlers: (code: Code, buttonName: string) => any;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
    getPressHandlers
}) => (
    <div className="grid grid-cols-5 gap-2 mb-6">
        <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 "
            {...getPressHandlers(Code.Prev, 'Previous')}
        >
            <SkipBack className="h-4 w-4" />
        </Button>
        <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 "
            {...getPressHandlers(Code.Play, 'Play')}
        >
            <Play className="h-4 w-4" />
        </Button>
        <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 "
            {...getPressHandlers(Code.Pause, 'Pause')}
        >
            <Pause className="h-4 w-4" />
        </Button>
        <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 "
            {...getPressHandlers(Code.Stop, 'Stop')}
        >
            <Square className="h-4 w-4" />
        </Button>
        <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 "
            {...getPressHandlers(Code.Next, 'Next')}
        >
            <SkipForward className="h-4 w-4" />
        </Button>
    </div>
);
