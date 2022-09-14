import * as React from 'react';

type Timer = ReturnType<typeof setTimeout>;

type SomeFunction = (...args: any[]) => void;

export default function useDebounce<Func extends SomeFunction>(func: Func, delay = 1000) {
    const [timer, setTimer] = React.useState<Timer>();

    const debouncedFunction = ((...args) => {
        const newTimer = setTimeout(() => {
        func(...args);
        }, delay);
        clearTimeout(timer);
        setTimer(newTimer);
    }) as Func;

    return debouncedFunction;
}