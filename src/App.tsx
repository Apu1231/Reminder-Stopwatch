import { Layers, Clock, BarChart2 } from 'lucide-react';

import FocusTimer from './components/FocusTimer';
import Stopwatch from './components/Stopwatch';
import WeeklyOverview from './components/WeeklyOverview';
import { useStopwatch } from './hooks/useStopwatch';

function App() {
  // Lifted Stopwatch state to share data with WeeklyOverview
  const {
    elapsedTime,
    isRunning,
    startStopwatch,
    pauseStopwatch,
    finishForToday,
    formatTime,
    dailyRecords
  } = useStopwatch();

  return (
    <div className="min-h-screen flex-center flex-col" style={{ minHeight: '100vh', padding: '2rem' }}>

      {/* Header */}
      <header className="flex-col flex-center" style={{ marginBottom: '3rem' }}>
        <h1 className="title-glow" style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>
          Focus<span style={{ color: 'var(--color-accent)' }}>Flow</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
          Deep Work & Time Tracking
        </p>
      </header>

      {/* Main Content Grid */}
      <div className="responsive-grid">

        {/* Focus Timer Section */}
        <section className="glass-card flex-col flex-center" style={{ padding: '2rem', position: 'relative' }}>
          <div className="flex-center" style={{ marginBottom: '1.5rem', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
            <Clock size={18} />
            <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Focus Timer</span>
          </div>
          <FocusTimer />
        </section>

        {/* Stopwatch Section */}
        <section className="glass-card flex-col flex-center" style={{ padding: '2rem', position: 'relative' }}>
          <div className="flex-center" style={{ marginBottom: '1.5rem', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
            <Layers size={18} />
            <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Deep Work Stopwatch</span>
          </div>
          <Stopwatch
            elapsedTime={elapsedTime}
            isRunning={isRunning}
            startStopwatch={startStopwatch}
            pauseStopwatch={pauseStopwatch}
            finishForToday={finishForToday}
            formatTime={formatTime}
          />
        </section>

      </div>

      {/* Weekly Stats Teaser */}
      <div style={{ marginTop: '3rem', width: '100%', maxWidth: '900px' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="flex-center" style={{ gap: '1rem', marginBottom: '1rem', justifyContent: 'flex-start' }}>
            <BarChart2 color="var(--color-accent)" />
            <span style={{ fontWeight: 600 }}>Weekly Overview</span>
          </div>
          <WeeklyOverview dailyRecords={dailyRecords} />
        </div>
      </div>
    </div>
  );
}

export default App;
