import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { format } from 'date-fns';

export const useStopwatch = () => {
    // Current elapsed time in seconds (persisted)
    const [elapsedTime, setElapsedTime] = useLocalStorage<number>('productivity-stopwatch-time', 0);
    const [isRunning, setIsRunning] = useLocalStorage<boolean>('productivity-stopwatch-running', false);
    const [lastStartTime, setLastStartTime] = useLocalStorage<number | null>('productivity-stopwatch-start-time', null);

    // Daily Records: { "2023-10-27": 120 (minutes), ... }
    const [dailyRecords, setDailyRecords] = useLocalStorage<Record<string, number>>('productivity-daily-records', {});

    const intervalRef = useRef<number | null>(null);

    // Sync time on mount if it was running (handles refreshing/closing tab)
    useEffect(() => {
        if (isRunning && lastStartTime) {
            const now = Date.now();
            const additionalSeconds = Math.floor((now - lastStartTime) / 1000);

            // Avoid double counting if the effect runs multiple times strictly, 
            // but for simple logic: update elapsed + restart interval
            // Better approach: stored 'elapsed' is only the committed blocks. 
            // Current total = stored_elapsed + (now - start_time)
            // But we want to just resume ticking from the correct visual point.

            // To be precise: update elapsed time to include the time passed while closed?
            // "Stopwatch time should automatically continue... when reopened". 
            // Yes, acts like a real stopwatch running in background.
            setElapsedTime((prev) => prev + additionalSeconds);
            setLastStartTime(now); // Reset start marker to now
        }
    }, []); // Run once on mount

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = window.setInterval(() => {
                setElapsedTime((prev) => prev + 1);
                // Update last start time every second effectively to check drift? 
                // No, just updating elapsed is fine for 'live' view.
                // We should update lastStartTime roughly to keep sync if we crash.
                setLastStartTime(Date.now());
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setLastStartTime(null);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, setElapsedTime, setLastStartTime]);

    const startStopwatch = () => {
        setIsRunning(true);
        setLastStartTime(Date.now());
    };

    const pauseStopwatch = () => {
        setIsRunning(false);
        setLastStartTime(null);
    };

    const finishForToday = () => {
        setIsRunning(false);
        setLastStartTime(null);

        const todayKey = format(new Date(), 'yyyy-MM-dd');
        const minutesWorked = Math.floor(elapsedTime / 60);

        setDailyRecords((prev) => ({
            ...prev,
            [todayKey]: (prev[todayKey] || 0) + minutesWorked
        }));

        setElapsedTime(0); // Reset for next day (or just reset for today effectively)
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Weekly Logic Helper
    const getWeeklyData = () => {
        // This is a simplified logic. In a real app we'd parse dates.
        // Returns last 7 days keys or specific logic for "Monday-Sunday"
        return dailyRecords;
    };

    return {
        elapsedTime,
        isRunning,
        startStopwatch,
        pauseStopwatch,
        finishForToday,
        formatTime,
        dailyRecords,
        getWeeklyData
    };
};
