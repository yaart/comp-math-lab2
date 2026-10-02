import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {mathApi} from "../../api/mathApi";
import {OptimizationRequest, OptimizationResponse} from "../../types";
import {OptimizationForm} from "./OptimizationForm";
import {Alert} from "../common/Alert";
import {OptimizationChart} from "./OptimizationChart";
import {OptimizationTable} from "./OptimizationTable";


export const OptimizationPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OptimizationResponse | null>(null);
    const [error, setError] = useState<{ message: string; code?: string } | null>(null);
    const [params, setParams] = useState({ functionId: 1, range: [-5, 5] as [number, number] });

    useEffect(() => {
        if (error) {
            setResult(null);
        }
    }, [error]);

    const handleOptimize = async (data: OptimizationRequest) => {
        setLoading(true);
        setError(null);
        setResult(null);

        const margin = Math.abs(data.startX) * 2 + 2;
        setParams({
            functionId: data.functionId,
            range: [data.startX - margin, data.startX + margin]
        });

        try {
            const response = await mathApi.optimize(data);

            if (response.success) {
                setResult(response);
                toast.success(`${response.type === 'min' ? 'Минимум' : 'Максимум'} найден`);
                if (response.savedToFile) {
                    toast.success(`Результат сохранен в файл: ${response.savedToFile}`);
                }
            } else {
                setError({
                    message: response.errorMessage || 'Не удалось найти экстремум',
                    code: response.errorCode
                });
            }
        } catch (err: any) {
            setError({
                message: err.message || 'Ошибка при выполнении запроса',
                code: err.code
            });
        } finally {
            setLoading(false);
        }
    };

    const dismissError = () => {
        setError(null);
    };

    const handleDownloadFile = () => {
        if (result?.savedToFile) {
            const downloadUrl = `http://localhost:8080/api/lab2/download/${result.savedToFile}`;
            window.open(downloadUrl, '_blank');
            toast.success('Начинается скачивание файла...');
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl font-sans text-slate-800">
            {error && (
                <div className="mb-6">
                    <Alert
                        type="error"
                        message={error.message}
                        errorCode={error.code}
                        onDismiss={dismissError}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-5">
                    <OptimizationForm onOptimize={handleOptimize} loading={loading} />
                </div>
                <div className="lg:col-span-7">
                    <div className="bg-white border border-slate-200 shadow-sm h-full flex flex-col">
                        <div className="p-3 border-b bg-slate-50">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                                График функции f(x)
                            </h2>
                        </div>
                        <div className="p-4 flex-grow flex items-center justify-center min-h-[400px]">
                            <OptimizationChart
                                functionId={params.functionId}
                                extremum={result?.extremum || null}
                                range={params.range}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {result && result.success ? (
                    <div className="border-t-2 border-slate-800 pt-8 animate-in fade-in slide-in-from-bottom duration-500">
                        <h2 className="text-sm font-black uppercase mb-6 tracking-[0.2em]">
                            Результаты оптимизации
                        </h2>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
                                <div className="bg-white p-4 border border-slate-200">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans">
                                        {result.type === 'min' ? 'Минимум x*' : 'Максимум x*'}
                                    </div>
                                    <div className="text-lg font-bold text-slate-900 break-all">
                                        {result.extremum?.toString()}
                                    </div>
                                </div>
                                <div className="bg-white p-4 border border-slate-200">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans">
                                        Значение f(x*)
                                    </div>
                                    <div className="text-lg font-bold text-slate-900 break-all">
                                        {result.value?.toString()}
                                    </div>
                                </div>
                                <div className="bg-white p-4 border border-slate-200">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans">
                                        Финальный градиент
                                    </div>
                                    <div className="text-sm font-bold text-slate-900 break-all">
                                        {result.finalGradient?.toExponential(6)}
                                    </div>
                                </div>
                                <div className="bg-slate-900 text-white p-4">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans">
                                        Число итераций
                                    </div>
                                    <div className="text-xl font-bold">{result.iterations}</div>
                                </div>
                            </div>

                            {result.savedToFile && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-green-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-green-800">
                                                Результат оптимизации сохранен в файл:
                                            </p>
                                            <p className="text-xs font-mono text-green-700">
                                                {result.savedToFile}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDownloadFile}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
                                    >
                                        Скачать
                                    </button>
                                </div>
                            )}

                            {result.history && result.history.length > 0 && (
                                <div className="pt-6 border-t border-dashed border-slate-200">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 font-sans">
                                        История итераций
                                    </h3>
                                    <OptimizationTable
                                        history={result.history}
                                        method={result.type === 'min' ? 'gradient' : 'adam'}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-slate-200">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                            {error ? 'Произошла ошибка. Проверьте параметры оптимизации.' : 'Ожидание параметров оптимизации'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};