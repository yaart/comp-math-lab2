import { useState, useCallback, ChangeEvent } from 'react';

export const useNumberInput = (initialValue: number, onChange?: (value: number) => void) => {
    const [value, setValue] = useState<string>(initialValue.toString());
    const [error, setError] = useState<string | null>(null);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        inputValue = inputValue.replace(',', '.');

        const regex = /^-?\d*\.?\d*$/;

        if (inputValue === '' || inputValue === '-') {
            setValue(inputValue);
            setError(null);
            if (onChange && inputValue !== '') {
                const num = parseFloat(inputValue);
                if (!isNaN(num)) onChange(num);
            }
            return;
        }

        if (regex.test(inputValue)) {
            setValue(inputValue);
            setError(null);

            const numValue = parseFloat(inputValue);
            if (!isNaN(numValue) && onChange) {
                onChange(numValue);
            }
        } else {
            setError('Введите корректное число');
        }
    }, [onChange]);

    const getNumberValue = useCallback((): number => {
        if (value === '' || value === '-') return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }, [value]);

    return {
        value,
        error,
        handleChange,
        getNumberValue,
        setValue: (newValue: number) => setValue(newValue.toString())
    };
};