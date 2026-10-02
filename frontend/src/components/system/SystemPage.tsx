import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import {SystemRequest, SystemResponse} from "../../types";
import {mathApi} from "../../api/mathApi";
import {Alert} from "../common/Alert";
import {SystemChart} from "./SystemChart";
import {SystemForm} from "./SystemForm";
import {IterationTable} from "../IterationTable";

export const SystemPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SystemResponse | null>(null);
    const [error, setError] = useState<{ message: string; code?: string } | null>(null);
    const [systemId, setSystemId] = useState(1);

    useEffect(() => {
        if (error) {
            setResult(null);
        }
    }, [error]);

    const handleSolve = async (data: SystemRequest) => {
        setLoading(true);
        setError(null);
        setResult(null);
        setSystemId(data.systemId);

        try {
            const response = await mathApi.solveSystem(data);

            if (response.success) {
                setResult(response);
                toast.success('Система успешно решена');
                if (response.savedToFile) {
                    toast.success(`Результат сохранен в файл: ${response.savedToFile}`);
                }
            } else {
                setError({
                    message: response.errorMessage || 'Метод не сходится',
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
                    <div className="bg-white border border-slate-200 shadow-sm h-full">
                        <div className="p-3 border-b bg-slate-50">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Ввод параметров системы
                            </h2>
                        </div>
                        <div className="p-6">
                            <SystemForm onSolve={handleSolve} loading={loading} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div className="bg-white border border-slate-200 shadow-sm h-full flex flex-col">
                        <div className="p-3 border-b bg-slate-50">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                                Графики функций системы
                            </h2>
                        </div>
                        <div className="p-4 flex-grow flex items-center justify-center min-h-[400px]">
                            <SystemChart
                                systemId={systemId}
                                solution={result?.resultVector || null}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {result && result.success ? (
                    <div className="border-t-2 border-slate-800 pt-8 animate-in fade-in slide-in-from-bottom duration-500">
                        <h2 className="text-sm font-black uppercase mb-6 tracking-[0.2em]">Результаты вычислений</h2>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 border border-slate-200">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">x корень</div>
                                    <div className="text-lg font-mono font-bold text-slate-900 break-all">
                                        {result.resultVector?.[0]?.toString()}
                                    </div>
                                </div>
                                <div className="bg-white p-4 border border-slate-200">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">y корень</div>
                                    <div className="text-lg font-mono font-bold text-slate-900 break-all">
                                        {result.resultVector?.[1]?.toString()}
                                    </div>
                                </div>
                                <div className="bg-slate-900 text-white p-4 border border-slate-900">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Итераций</div>
                                    <div className="text-xl font-mono font-bold">{result.iterations}</div>
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
                                                Решение сохранено в файл:
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
                                        <Download className="w-3 h-3" />
                                        Скачать
                                    </button>
                                </div>
                            )}

                            {result.history && result.history.length > 0 && (
                                <div className="pt-6 border-t border-dashed border-slate-200">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4">
                                        История итерационного процесса
                                    </h3>
                                    <IterationTable history={result.history} />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-sm">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                            {error ? 'Произошла ошибка. Проверьте начальные приближения.' : 'Ожидание ввода начальных приближений'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};