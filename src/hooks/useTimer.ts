import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_DURATION = 60 * 60; // 60 minutes in seconds

export const useTimer = () => {
    // We store the target end timestamp (null if paused/stopped)
    const [endTime, setEndTime] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
    const [isRunning, setIsRunning] = useState(false);
    const [hasFinished, setHasFinished] = useState(false);

    // Keep track of the initially set duration so we know what to "reset" to
    // or what total span we are comparing against.
    // Actually, timeLeft is enough to resume from.

    const audioContextRef = useRef<AudioContext | null>(null);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    const playAlarm = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);

        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 1);
    }, []);

    const triggerNotification = useCallback(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("Time's Up!", {
                body: "Your focus session has ended. Take a break!",
                icon: "/favicon.svg"
            });
        }
    }, []);

    // Main tick effect
    useEffect(() => {
        let interval: number;

        if (isRunning && endTime) {
            interval = window.setInterval(() => {
                const now = Date.now();
                const diff = Math.ceil((endTime - now) / 1000);

                if (diff <= 0) {
                    setTimeLeft(0);
                    setIsRunning(false);
                    setEndTime(null);
                    setHasFinished(true);
                    playAlarm();
                    triggerNotification();
                } else {
                    setTimeLeft(diff);
                }
            }, 200); // Check frequently
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, endTime, playAlarm, triggerNotification]);

    const startTimer = () => {
        if (!isRunning) {
            // Resume or start
            const now = Date.now();
            setEndTime(now + timeLeft * 1000);
            setIsRunning(true);
            setHasFinished(false);
        }
    };

    const pauseTimer = () => {
        if (isRunning) {
            // "Freeze" the time left
            setIsRunning(false);
            setEndTime(null);
            // timeLeft is already up to date from the interval
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        setEndTime(null);
        setHasFinished(false);
        setTimeLeft(DEFAULT_DURATION);
    };

    const addTime = (minutes: number) => {
        // If running, we extend the endTime
        // If paused, we extend the timeLeft
        const secondsToAdd = minutes * 60;

        if (isRunning && endTime) {
            const newEndTime = endTime + (secondsToAdd * 1000);
            // Check limit logic here if needed? Req says "Add 5 minutes option must be disabled if total time would exceed 60 minutes."
            // This check is usually done in UI but we can clamp.
            // Calculating "totalDuration" effectively means the diff from when we started? 
            // Simplifying: just extend.
            setEndTime(newEndTime);
            // Update timeLeft immediately for UI responsiveness
            setTimeLeft(prev => prev + secondsToAdd);
        } else {
            setTimeLeft(prev => prev + secondsToAdd);
        }
        setHasFinished(false);
    };

    const setDuration = (minutes: number) => {
        const seconds = minutes * 60;
        setTimeLeft(seconds > DEFAULT_DURATION ? DEFAULT_DURATION : seconds);
        setEndTime(null);
        setIsRunning(false);
    };

    return {
        timeLeft,
        isRunning,
        hasFinished,
        startTimer,
        pauseTimer,
        resetTimer,
        addTime,
        setDuration,
        formatTime: (seconds: number) => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
    };
};
