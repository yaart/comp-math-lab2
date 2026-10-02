import React, { useState } from 'react';
import { OptimizationStep } from '../../types';

interface OptimizationTableProps {
    history: OptimizationStep[];
    method: string;
}

export const OptimizationTable: React.FC<OptimizationTableProps> = ({ history, method }) => {
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

    const displayedHistory = showAll ? history : history.slice(-20);

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 font-sans">
                    <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">№</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-900 uppercase tracking-wider">x</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">f(x)</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Градиент</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Темп обучения</th>
                        {method === 'adam' && (
                            <>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">m (момент)</th>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">v (дисперсия)</th>
                            </>
                        )}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 font-mono">
                    {displayedHistory.map((step, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2 text-[11px] text-slate-400">{step.n}</td>
                            <td className="px-4 py-2 text-sm font-bold whitespace-nowrap text-slate-900">
                                {step.x.toFixed(8)}
                            </td>
                            <td className="px-4 py-2 text-[11px] text-slate-500 whitespace-nowrap">
                                {step.fx}
                            </td>
                            <td className="px-4 py-2 text-[11px] text-rose-600 font-medium whitespace-nowrap">
                                {step.gradient}
                            </td>
                            <td className="px-4 py-2 text-[11px] text-slate-500 whitespace-nowrap">
                                {step.learningRate}
                            </td>
                            {method === 'adam' && (
                                <>
                                    <td className="px-4 py-2 text-[11px] text-slate-500 whitespace-nowrap">
                                        {step.m?.toExponential(10) || '-'}
                                    </td>
                                    <td className="px-4 py-2 text-[11px] text-slate-500 whitespace-nowrap">
                                        {step.v?.toExponential(10) || '-'}
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {history.length > 20 && (
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