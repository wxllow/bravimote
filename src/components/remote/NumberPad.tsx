import React from 'react';
import { Button } from '@/components/ui/button';
import { Dot, Minus } from 'lucide-react';
import { Code } from '../../lib/ircc-codes';

interface NumberPadProps {
    getPressHandlers: (code: Code, buttonName: string) => any;
}

export const NumberPad: React.FC<NumberPadProps> = ({ getPressHandlers }) => (
    <div className="grid grid-cols-3 gap-2">
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Num1, '1')}
        >
            1
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Num2, '2')}
        >
            2
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Num3, '3')}
        >
            3
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Num4, '4')}
        >
            4
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Num5, '5')}
        >
            5
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Num6, '6')}
        >
            6
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Num7, '7')}
        >
            7
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Num8, '8')}
        >
            8
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Num9, '9')}
        >
            9
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Dot, '.')}
        >
            {' '}
            <Dot className="h-5 w-5" />{' '}
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.Num0, '0')}
        >
            0
        </Button>
        <Button
            variant="outline"
            className="rounded-full h-12 "
            {...getPressHandlers(Code.FlashMinus, 'Flash -')}
        >
            {' '}
            <Minus className="h-5 w-5" />{' '}
        </Button>
    </div>
);
