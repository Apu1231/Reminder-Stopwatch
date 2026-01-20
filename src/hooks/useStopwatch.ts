import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { format } from 'date-fns';

export const useStopwatch = () => {
    // Total accumulated time from PREVIOUS sessions (in seconds)
    const [accumulatedTime, setAccumulatedTime] = useLocalStorage<number>('productivity-stopwatch-accumulated', 0);
    // Timestamp when the current session started (null if paused)
    const [startTime, setStartTime] = useLocalStorage<number | null>('productivity-stopwatch-start-timestamp', null);

    // Derived state for UI rendering
    const [displayTime, setDisplayTime] = useState(accumulatedTime);

    const [dailyRecords, setDailyRecords] = useLocalStorage<Record<string, number>>('productivity-daily-records', {});

    useEffect(() => {
        let interval: number;

        if (startTime) {
            // Immediate update
            const update = () => {
                const now = Date.now();
                const currentSessionSeconds = Math.floor((now - startTime) / 1000);
                setDisplayTime(accumulatedTime + currentSessionSeconds);
            };

            update();
            interval = window.setInterval(update, 200); // Update freq independently of count
        } else {
            // If paused, display just the accumulated
            setDisplayTime(accumulatedTime);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [startTime, accumulatedTime]);

    const startStopwatch = () => {
        if (!startTime) {
            setStartTime(Date.now());
        }
    };

    const pauseStopwatch = () => {
        if (startTime) {
            const now = Date.now();
            const sessionSeconds = Math.floor((now - startTime) / 1000);
            setAccumulatedTime((prev) => prev + sessionSeconds);
            setStartTime(null);
        }
    };

    const finishForToday = () => {
        // Calculate total time
        let totalSeconds = accumulatedTime;
        if (startTime) {
            const now = Date.now();
            totalSeconds += Math.floor((now - startTime) / 1000);
        }

        const todayKey = format(new Date(), 'yyyy-MM-dd');
        const minutesWorked = Math.floor(totalSeconds / 60);

        setDailyRecords((prev) => ({
            ...prev,
            [todayKey]: (prev[todayKey] || 0) + minutesWorked
        }));

        // Reset everything
        setAccumulatedTime(0);
        setStartTime(null);
        setDisplayTime(0);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return {
        elapsedTime: displayTime, // Exposing as elapsedTime to keep API compatible
        isRunning: !!startTime,
        startStopwatch,
        pauseStopwatch,
        finishForToday,
        formatTime,
        dailyRecords
    };
};
