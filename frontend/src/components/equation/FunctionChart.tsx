import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ReferenceLine, ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from 'recharts';

interface FunctionChartProps {
    functionId: number;
    range: [number, number];
    root: number | null;
}

export const FunctionChart: React.FC<FunctionChartProps> = ({ functionId, range, root }) => {
    const calculateY = (x: number, id: number): number => {
        switch (id) {
            case 1: return -2.8 * Math.pow(x, 3) - 3.48 * Math.pow(x, 2) + 10.23 * x + 9.35;
            case 2: return Math.sin(x) + 0.1;
            case 3: return Math.pow(x, 2) - Math.exp(x) + 2;
            default: return 0;
        }
    };

    const data = useMemo(() => {
        const points = [];
        const [a, b] = range;
        const margin = Math.abs(b - a) * 0.3 || 1;
        const start = a - margin;
        const end = b + margin;
        const step = (end - start) / 100;

        for (let x = start; x <= end; x += step) {
            const y = calculateY(x, functionId);
            if (Math.abs(y) < 100) {
                points.push({ x: x, y: y });
            }
        }
        return points;
    }, [functionId, range]);

    return (
        <div className="w-full h-full min-h-[450px] py-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={true} />
                    <XAxis
                        dataKey="x"
                        type="number"
                        domain={['auto', 'auto']}
                        tick={{fontSize: 10}}
                        stroke="#94a3b8"
                        label={{ value: 'x', position: 'insideBottomRight', offset: -5 }}
                    />
                    <YAxis
                        type="number"
                        domain={['auto', 'auto']}
                        tick={{fontSize: 10}}
                        stroke="#94a3b8"
                        label={{ value: 'f(x)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '11px', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#1e293b' }}
                        labelFormatter={(value) => `x: ${value.toFixed(6)}`}
                    />

                    <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
                    <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />

                    <ReferenceLine x={range[0]} stroke="#f87171" strokeDasharray="5 5" label={{ value: 'a', position: 'top', fontSize: 10, fill: '#ef4444' }} />
                    <ReferenceLine x={range[1]} stroke="#f87171" strokeDasharray="5 5" label={{ value: 'b', position: 'top', fontSize: 10, fill: '#ef4444' }} />

                    <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#0f172a"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />

                    {root !== null && (
                        <ReferenceLine
                            x={root}
                            stroke="#ef4444"
                            strokeWidth={2}
                            label={{ value: `x* ≈ ${root.toFixed(3)}`, position: 'bottom', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};