import React from 'react';
import { Play, Pause, RotateCcw, Plus } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';

const FocusTimer: React.FC = () => {
    const {
        timeLeft,
        isRunning,
        hasFinished,
        startTimer,
        pauseTimer,
        resetTimer,
        addTime,
        setDuration,
        formatTime
    } = useTimer();

    // Calculate progress for the ring
    const totalDuration = 60 * 60; // 60 mins fixed max for visual
    const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex-center flex-col" style={{ width: '100%' }}>

            {/* Timer Display with Ring */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 300 300" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    <circle
                        cx="150"
                        cy="150"
                        r={radius}
                        stroke="var(--color-border)"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx="150"
                        cy="150"
                        r={radius}
                        stroke="var(--color-accent)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>

                <div style={{ position: 'absolute', textAlign: 'center', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="title-glow" style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(timeLeft)}
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 'clamp(0.8rem, 3vw, 1rem)' }}>
                        {isRunning ? 'Focusing...' : hasFinished ? "Time's Up!" : 'Ready to Focus'}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex-center" style={{ gap: '1.5rem', marginTop: '2rem' }}>
                {!isRunning && !hasFinished && (
                    <button className="btn-primary" onClick={startTimer}>
                        <Play fill="currentColor" size={24} />
                    </button>
                )}

                {isRunning && (
                    <button className="btn-primary" onClick={pauseTimer}>
                        <Pause fill="currentColor" size={24} />
                    </button>
                )}

                <button
                    className="btn-primary"
                    onClick={resetTimer}
                    style={{ borderColor: 'var(--color-text-secondary)', color: 'var(--color-text-secondary)' }}
                >
                    <RotateCcw size={24} />
                </button>

                {/* Adjust Duration (Only when not running or finished) */}
                {!isRunning && !hasFinished && (
                    <div className="flex-center" style={{ gap: '0.5rem', marginLeft: '1rem' }}>
                        <input
                            type="range"
                            min="5"
                            max="60"
                            step="5"
                            value={Math.ceil(timeLeft / 60)}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            style={{ accentColor: 'var(--color-accent)' }}
                        />
                    </div>
                )}
            </div>

            {/* Finished State Options */}
            {hasFinished && (
                <div className="glass-card" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(20px)' }}>
                    <h2 className="title-glow" style={{ marginBottom: '2rem' }}>Session Complete!</h2>
                    <div className="flex-center" style={{ gap: '1rem' }}>
                        <button className="btn-primary" onClick={resetTimer}>
                            Stop & Reset
                        </button>
                        <button
                            className="btn-primary"
                            onClick={() => addTime(5)}
                            disabled={timeLeft >= totalDuration}
                            style={timeLeft >= totalDuration ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                            <Plus size={18} style={{ marginRight: '5px' }} /> 5 Mins
                        </button>
                    </div>
                    {timeLeft >= totalDuration && <p style={{ color: 'red', marginTop: '1rem' }}>Max 1 hour limit reached</p>}
                </div>
            )}

        </div>
    );
};

export default FocusTimer;
