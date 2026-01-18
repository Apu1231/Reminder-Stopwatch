import React from 'react';
import { Play, Pause, CheckCircle } from 'lucide-react';


// Prop to pass weekly data up if needed, or just handle it here?
// Ideally App holds the state or we allow Stopwatch to handle its own display logic?
// The requirement says "Daily Productivity Tracking" acts like a real stopwatch.
// We'll export the hook usage so App can access records for the charts, OR we just export the component and managing it internally.
// Given App needs to show Weekly Overview, let's assume App manages the layout but Stopwatch manages the active timing.
// But wait, App.tsx needs 'dailyRecords' for the WeeklyOverview. 
// So I should probably lift the state or expose it.
// Actually, since useStopwatch uses localStorage, I can instatiate it in App or here. 
// If I instantiate in App, I can pass props down. Let's do that for cleaner data flow to WeeklyOverview.

interface StopwatchProps {
    elapsedTime: number;
    isRunning: boolean;
    startStopwatch: () => void;
    pauseStopwatch: () => void;
    finishForToday: () => void;
    formatTime: (seconds: number) => string;
}

const Stopwatch: React.FC<StopwatchProps> = ({
    elapsedTime,
    isRunning,
    startStopwatch,
    pauseStopwatch,
    finishForToday,
    formatTime
}) => {

    return (
        <div className="flex-center flex-col" style={{ width: '100%' }}>

            {/* Time Display */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div className="title-glow" style={{ fontSize: '4rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {formatTime(elapsedTime)}
                </div>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    {isRunning ? 'Tracking productivity...' : 'Paused'}
                </p>
            </div>

            {/* Controls */}
            <div className="flex-center" style={{ gap: '1.5rem' }}>
                {!isRunning ? (
                    <button className="btn-primary" onClick={startStopwatch}>
                        <Play fill="currentColor" size={24} />
                    </button>
                ) : (
                    <button className="btn-primary" onClick={pauseStopwatch}>
                        <Pause fill="currentColor" size={24} />
                    </button>
                )}

                <button
                    className="btn-primary"
                    onClick={finishForToday}
                    title="Finish for Today"
                    style={{ borderColor: 'var(--color-accent)', color: 'var(--color-bg-deep)', background: 'var(--color-accent)' }}
                >
                    <CheckCircle size={24} />
                </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <small style={{ color: 'var(--color-text-secondary)' }}>Finish & Save for Today</small>
            </div>

        </div>
    );
};

export default Stopwatch;
