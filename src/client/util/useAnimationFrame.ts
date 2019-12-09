import { useCallback, useRef } from "react";

export const useAnimationFrame = (callback: (timestamp: number) => void) => {
    const frameRef = useRef<number>();
    const shouldRun = useRef<boolean>(false);

    const frame = useCallback((timestamp: number) => {
        callback(timestamp);
        if (shouldRun.current) {
            frameRef.current = requestAnimationFrame(frame);
        }
    }, []);

    const start = useCallback(() => {
        shouldRun.current = true;
        frameRef.current = requestAnimationFrame(frame);
    }, []);

    const stop = useCallback(() => {
        shouldRun.current = false;
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }
    }, []);

    return [start, stop];
};
