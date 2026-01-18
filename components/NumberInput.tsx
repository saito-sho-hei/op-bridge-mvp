'use client';

import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    placeholder,
    className,
    // required, // Unused
}) => {
    // Internal string state to allow free typing
    const [inputValue, setInputValue] = useState(value === 0 ? '' : value.toString());
    const [prevValue, setPrevValue] = useState(value);

    // Derived state pattern: update internal state if prop value changes externally
    if (value !== prevValue) {
        // Check if the change is "meaningful" (i.e. not just a re-render of same value)
        // And check if strict equality allows avoiding loop.
        // But we also need to avoid overwriting user typing "12," (value=12).
        // So we only force update if the parsed input value implies a different number.
        const currentParsed = parseInt(inputValue.replace(/,/g, '') || '0', 10);
        if (value !== currentParsed) {
            setInputValue(value === 0 ? '' : value.toString());
        }
        setPrevValue(value);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        // Allow numbers, commas, minus (though minus forbidden by rules generally, let's just strip non-numeric)
        // Spec says: "Minus forbidden in principle". We can just strip non-digits for now, maybe allow one minus at start.
        // Spec: "12,000 -> 12000"

        // Filter out invalid chars (keep digits and comma and minus)
        const filtered = raw.replace(/[^\d,-]/g, '');

        setInputValue(filtered);

        // Parse and bubble up
        const clean = filtered.replace(/,/g, '');
        const num = parseInt(clean, 10);
        if (!isNaN(num)) {
            onChange(num);
        } else {
            onChange(0); // Treat empty/invalid as 0
        }
    };

    const handleBlur = () => {
        // Format on blur
        const clean = inputValue.replace(/,/g, '');
        const num = parseInt(clean, 10);
        if (!isNaN(num) && num !== 0) {
            setInputValue(num.toLocaleString('en-US'));
        } else {
            // If 0 and required, keep 0? Or empty?
            // Spec says: "Arbitrary empty = 0".
            // Required empty = Error (handled by parent validation).
            // Let's just show what it is.
            if (num === 0) setInputValue('');
        }
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
                "w-full rounded-md border border-gray-300 px-3 py-2 text-right text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm",
                className
            )}
        />
    );
};
