import React from 'react';
import { Button } from '@/components/ui/button';
import {
    House,
    ChevronUp,
    Info,
    ChevronLeft,
    CircleDot,
    ChevronRight,
    ArrowLeft,
    ChevronDown,
    MoreHorizontal
} from 'lucide-react';
import { Code } from '../../lib/ircc-codes';

interface NavigationPadProps {
    getPressHandlers: (code: Code, buttonName: string) => any;
}

export const NavigationPad: React.FC<NavigationPadProps> = ({
    getPressHandlers
}) => (
    <div className="mb-6">
        <div className="grid grid-cols-3 gap-2">
            <Button
                variant="secondary"
                className="rounded-full h-12 !bg-accent"
                {...getPressHandlers(Code.Home, 'Home')}
            >
                <House className="h-6 w-6" />
            </Button>
            <Button
                variant="secondary"
                className="rounded-full h-12"
                {...getPressHandlers(Code.Up, 'Up')}
            >
                <ChevronUp className="h-6 w-6" />
            </Button>
            <Button
                variant="secondary"
                className="rounded-full h-12 !bg-accent"
                {...getPressHandlers(Code.Display, 'Display')}
            >
                <Info className="h-6 w-6" />
            </Button>
            <Button
                variant="secondary"
                className="rounded-full h-12"
                {...getPressHandlers(Code.Left, 'Left')}
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
                variant="secondary"
                className="rounded-full h-12 bg-primary"
                {...getPressHandlers(Code.Confirm, 'OK')}
            >
                <CircleDot className="h-6 w-6" />
            </Button>
            <Button
                variant="secondary"
                className="rounded-full h-12"
                {...getPressHandlers(Code.Right, 'Right')}
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
            <Button
                variant="secondary"
                className="rounded-full h-12 !bg-accent"
                {...getPressHandlers(Code.Back, 'Back')}
            >
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button
                variant="secondary"
                className="rounded-full h-12"
                {...getPressHandlers(Code.Down, 'Down')}
            >
                <ChevronDown className="h-6 w-6" />
            </Button>
            <Button
                variant="secondary"
                className="rounded-full h-12 !bg-accent"
                {...getPressHandlers(Code.Options, 'Options')}
            >
                <MoreHorizontal className="h-6 w-6" />
            </Button>
        </div>
    </div>
);
