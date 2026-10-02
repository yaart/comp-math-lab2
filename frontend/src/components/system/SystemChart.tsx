import React, { useMemo } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Scatter, Line, ComposedChart
} from 'recharts';

interface SystemChartProps {
    systemId: number;
    solution: number[] | null;
}

export const SystemChart: React.FC<SystemChartProps> = ({ systemId, solution }) => {
    const data = useMemo(() => {
        const points = [];

        if (systemId === 1) {
            for (let x = -1.5; x <= 1.5; x += 0.02) {
                const yCircleUpper = x*x <= 1.0001 ? Math.sqrt(Math.max(0, 1 - x*x)) : null;
                const yCircleLower = x*x <= 1.0001 ? -Math.sqrt(Math.max(0, 1 - x*x)) : null;

                const sinVal = 1.1 * x + 0.1;
                let ySin = null;

                if (sinVal >= -1 && sinVal <= 1) {
                    ySin = Math.asin(sinVal) - x;
                }

                points.push({
                    x: Number(x.toFixed(6)),
                    circle_up: yCircleUpper,
                    circle_low: yCircleLower,
                    sin_curve: ySin
                });
            }
        } else {
            for (let x = -1; x <= 3; x += 0.02) {
                const cosArg = 1.5 - x;
                let yFromFirst = null;
                let yFromFirstNeg = null;

                if (cosArg >= -1 && cosArg <= 1) {
                    yFromFirst = Math.acos(cosArg);
                    yFromFirstNeg = -Math.acos(cosArg);
                }

                const yFromSecond = (1 + Math.sin(x - 0.5)) / 2;

                points.push({
                    x: Number(x.toFixed(4)),
                    first_eq: yFromFirst,
                    first_eq_neg: yFromFirstNeg,
                    second_eq: yFromSecond
                });
            }
        }

        return points;
    }, [systemId]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-sm font-mono text-[11px]">
                    <p className="text-slate-600 mb-1">x = <span className="text-slate-900 font-bold">{Number(label).toFixed(6)}</span></p>
                    {payload.map((entry: any, index: number) => {
                        if (entry.value === null || entry.value === undefined) return null;

                        let name = entry.name;
                        if (name.includes('circle')) name = 'x² + y² = 1';
                        if (name.includes('sin_curve')) name = 'sin(x+y) = 1.1x + 0.1';
                        if (name.includes('first_eq')) name = 'cos y + x = 1.5';
                        if (name.includes('second_eq')) name = '2y - sin(x-0.5) = 1';

                        return (
                            <p key={index} className="text-slate-600">
                                {name}: <span style={{ color: entry.color }} className="font-bold">{entry.value.toFixed(6)}</span>
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full flex flex-col items-center bg-white p-4">

            <ResponsiveContainer width="100%" aspect={1}>
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="1 1" stroke="#f1f5f9" />

                    <XAxis
                        dataKey="x"
                        type="number"
                        domain={systemId === 1 ? [-1.5, 1.5] : [-1, 3]}
                        tick={{fontSize: 10}}
                        stroke="#94a3b8"
                        allowDataOverflow={true}
                        label={{ value: 'x', position: 'bottom', fontSize: 10 }}
                    />
                    <YAxis
                        type="number"
                        domain={systemId === 1 ? [-1.5, 1.5] : [-2, 2]}
                        tick={{fontSize: 10}}
                        stroke="#94a3b8"
                        allowDataOverflow={true}
                        label={{ value: 'y', angle: -90, position: 'left', fontSize: 10 }}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        wrapperStyle={{ outline: 'none' }}
                    />

                    <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                    <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />

                    {systemId === 1 ? (
                        <>
                            <Line
                                dataKey="circle_up"
                                stroke="#000000"
                                strokeWidth={2}
                                dot={false}
                                connectNulls={false}
                                isAnimationActive={false}
                                name="x² + y² = 1 (верх)"
                            />
                            <Line
                                dataKey="circle_low"
                                stroke="#000000"
                                strokeWidth={2}
                                dot={false}
                                connectNulls={false}
                                isAnimationActive={false}
                                name="x² + y² = 1 (низ)"
                            />
                            <Line
                                dataKey="sin_curve"
                                stroke="#8b5cf6"
                                strokeWidth={2.5}
                                dot={false}
                                connectNulls={false}
                                isAnimationActive={false}
                                name="sin(x+y) = 1.1x + 0.1"
                            />
                        </>
                    ) : (
                        <>
                            <Line
                                dataKey="first_eq"
                                stroke="#000000"
                                strokeWidth={2}
                                dot={false}
                                connectNulls={false}
                                isAnimationActive={false}
                                name="cos y + x = 1.5 (y ≥ 0)"
                            />
                            <Line
                                dataKey="first_eq_neg"
                                stroke="#000000"
                                strokeWidth={2}
                                dot={false}
                                connectNulls={false}
                                isAnimationActive={false}
                                name="cos y + x = 1.5 (y < 0)"
                            />
                            <Line
                                dataKey="second_eq"
                                stroke="#8b5cf6"
                                strokeWidth={2.5}
                                dot={false}
                                connectNulls={false}
                                isAnimationActive={false}
                                name="2y - sin(x-0.5) = 1"
                            />
                        </>
                    )}

                    {solution && solution.length === 2 && (
                        <>
                            <ReferenceLine x={solution[0]} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.4} />
                            <ReferenceLine y={solution[1]} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.4} />
                            <Scatter
                                data={[{x: solution[0], y: solution[1]}]}
                                fill="#f43f5e"
                                shape="circle"
                                isAnimationActive={false}
                                name="Решение"
                            />
                        </>
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            <div className="flex gap-4 mt-4 text-[9px] font-mono">
                {systemId === 1 ? (
                    <>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-black"></div>
                            <span>x² + y² = 1</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-violet-500"></div>
                            <span>sin(x+y) = 1.1x + 0.1</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-black"></div>
                            <span>cos y + x = 1.5</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-violet-500"></div>
                            <span>2y - sin(x-0.5) = 1</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};