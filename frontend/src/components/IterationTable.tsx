import React, { useState } from 'react';

interface IterationTableProps {
    history: any[];
}

export const IterationTable: React.FC<IterationTableProps> = ({ history }) => {
    const [showAll, setShowAll] = useState<boolean>(false);

    if (!history || history.length === 0) {
        return (
            <div className="py-8 text-center border border-slate-200 bg-slate-50">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Нет данных для отображения
                </p>
            </div>
        );
    }

    const isSystem = history[0].x !== undefined && history[0].y !== undefined;
    const displayedHistory = showAll ? history : history.slice(-15);

    const formatValue = (val: any) => {
        if (val === undefined || val === null) return '-';
        return val.toString();
    };

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 font-sans">
                    <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">№</th>
                        {!isSystem ? (
                            <>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">a</th>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">b</th>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-900 uppercase tracking-wider">x_n</th>
                            </>
                        ) : (
                            <>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-900 uppercase tracking-wider">x_n</th>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-900 uppercase tracking-wider">y_n</th>
                            </>
                        )}
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Значение функции</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Δ (Погрешность)</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 font-mono">
                    {displayedHistory.map((step, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2 text-[11px] text-slate-400">{step.iteration || step.n}</td>
                            {!isSystem ? (
                                <>
                                    <td className="px-4 py-2 text-[11px] whitespace-nowrap">{formatValue(step.a)}</td>
                                    <td className="px-4 py-2 text-[11px] whitespace-nowrap">{formatValue(step.b)}</td>
                                    <td className="px-4 py-2 text-sm font-bold whitespace-nowrap text-slate-900">{formatValue(step.x)}</td>
                                </>
                            ) : (
                                <>
                                    <td className="px-4 py-2 text-sm font-bold whitespace-nowrap">{formatValue(step.x)}</td>
                                    <td className="px-4 py-2 text-sm font-bold whitespace-nowrap">{formatValue(step.y)}</td>
                                </>
                            )}
                            <td className="px-4 py-2 text-[11px] text-slate-500 whitespace-nowrap">
                                {formatValue(step.fX || step.fx)}
                            </td>
                            <td className="px-4 py-2 text-[11px] text-rose-600 font-medium whitespace-nowrap">
                                {formatValue(step.diff || step.maxError || Math.max(step.deltaX || 0, step.deltaY || 0))}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {history.length > 15 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
                >
                    {showAll ? 'Скрыть лишние' : `Показать все данные (${history.length})`}
                </button>
            )}
        </div>
    );
};