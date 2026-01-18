import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface WeeklyOverviewProps {
    dailyRecords: Record<string, number>;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ dailyRecords }) => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start, end });

    const maxHours = 12; // Scale for chart

    // Calculate total for current week
    const weeklyTotalMinutes = days.reduce((acc, day) => {
        const key = format(day, 'yyyy-MM-dd');
        return acc + (dailyRecords[key] || 0);
    }, 0);

    const hours = Math.floor(weeklyTotalMinutes / 60);
    const minutes = weeklyTotalMinutes % 60;

    return (
        <div className="flex-col" style={{ width: '100%', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>This Week</span>
                <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{hours}h {minutes}m</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', gap: '5px' }}>
                {days.map((day) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const minutes = dailyRecords[key] || 0;
                    const h = minutes / 60;
                    const heightPercent = Math.min((h / maxHours) * 100, 100);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div key={key} className="flex-col flex-center" style={{ flex: 1, gap: '5px' }}>
                            <div
                                style={{
                                    width: '100%',
                                    height: `${Math.max(heightPercent, 5)}%`, // Min height for visibility
                                    background: isToday ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '4px',
                                    transition: 'height 0.5s ease',
                                    boxShadow: isToday ? '0 0 10px var(--color-accent-glow)' : 'none'
                                }}
                                title={`${format(day, 'EEEE')}: ${minutes} mins`}
                            />
                            <span style={{ fontSize: '0.7rem', color: isToday ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                                {format(day, 'EEE')}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyOverview;
