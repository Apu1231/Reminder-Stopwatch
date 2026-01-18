import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_DURATION = 60 * 60; // 60 minutes in seconds

export const useTimer = () => {
    const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
    const [isRunning, setIsRunning] = useState(false);
    const [hasFinished, setHasFinished] = useState(false);

    const intervalRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    const playAlarm = useCallback(() => {
        // Simple oscillator alarm
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
                icon: "/vite.svg" // Placeholder icon
            });
        }
    }, []);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            // Timer finished just now
            setIsRunning(false);
            setHasFinished(true);
            playAlarm();
            triggerNotification();
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeLeft, playAlarm, triggerNotification]);

    const startTimer = () => {
        setIsRunning(true);
        setHasFinished(false);
    };

    const pauseTimer = () => setIsRunning(false);

    const resetTimer = () => {
        setIsRunning(false);
        setHasFinished(false);
        setTimeLeft(DEFAULT_DURATION);
    };

    const addTime = (minutes: number) => {
        setTimeLeft((prev) => {
            const newTime = prev + minutes * 60;
            return newTime > DEFAULT_DURATION ? DEFAULT_DURATION : newTime; // Max 60 mins
        });
        setHasFinished(false); // Reset finished state if time added
    };

    const setDuration = (minutes: number) => {
        // Allow manual setting if needed, clamped to 60 mins
        const seconds = minutes * 60;
        setTimeLeft(seconds > DEFAULT_DURATION ? DEFAULT_DURATION : seconds);
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
