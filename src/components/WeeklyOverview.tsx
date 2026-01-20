import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WeeklyOverviewProps {
    dailyRecords: Record<string, number>;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ dailyRecords }) => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const today = new Date();

    const days = eachDayOfInterval({ start, end });

    // Calculate total for current week
    const weeklyTotalMinutes = days.reduce((acc, day) => {
        const key = format(day, 'yyyy-MM-dd');
        return acc + (dailyRecords[key] || 0);
    }, 0);

    const hours = Math.floor(weeklyTotalMinutes / 60);
    const minutes = weeklyTotalMinutes % 60;

    // Prepare data for Recharts
    const data = days.map(day => {
        const key = format(day, 'yyyy-MM-dd');
        const mins = dailyRecords[key] || 0;
        return {
            day: format(day, 'EEE'), // Mon, Tue...
            fullDate: key,
            minutes: mins,
            hours: Number((mins / 60).toFixed(1)),
            isToday: isSameDay(day, today)
        };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card" style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</p>
                    <p style={{ margin: 0, color: 'var(--color-accent)' }}>
                        {payload[0].value} hrs
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex-col" style={{ width: '100%', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>This Week</span>
                <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{hours}h {minutes}m</span>
            </div>

            <div style={{ height: '200px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                            dy={10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="hours" radius={[4, 4, 4, 4]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isToday ? 'var(--color-accent)' : '#2A2A35'}
                                    style={{
                                        filter: entry.isToday ? 'drop-shadow(0 0 4px var(--color-accent-glow))' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WeeklyOverview;
