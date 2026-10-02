import React, { useRef, useState } from 'react';
import { OptimizationRequest } from '../../types';
import toast from 'react-hot-toast';
import {useNumberInput} from "../../hook/useNumberInput";
import {Upload} from "lucide-react";

interface OptimizationFormProps {
    onOptimize: (data: OptimizationRequest) => void;
    loading: boolean;
}

export const OptimizationForm: React.FC<OptimizationFormProps> = ({ onOptimize, loading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<OptimizationRequest>({
        functionId: 1,
        method: 'gradient',
        type: 'min',
        startX: 0,
        learningRate: 0.01,
        epsilon: 0.000001,
        maxIterations: 1000
    });

    const startXInput = useNumberInput(formData.startX, (value) =>
        setFormData(prev => ({ ...prev, startX: value }))
    );

    const learningRateInput = useNumberInput(formData.learningRate, (value) =>
        setFormData(prev => ({ ...prev, learningRate: value }))
    );

    const epsilonInput = useNumberInput(formData.epsilon, (value) =>
        setFormData(prev => ({ ...prev, epsilon: value }))
    );

    const maxIterationsInput = useNumberInput(formData.maxIterations, (value) =>
        setFormData(prev => ({ ...prev, maxIterations: Math.floor(value) }))
    );

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const lines = content.split(/[\s\n]+/).filter(v => v.length > 0);
                if (lines.length < 6) throw new Error("Формат: functionId method type startX lr eps maxIterations");

                const functionId = Number(lines[0]);
                const method = lines[1];
                const type = lines[2];
                const startX = parseFloat(lines[3].replace(',', '.'));
                const learningRate = parseFloat(lines[4].replace(',', '.'));
                const epsilon = parseFloat(lines[5].replace(',', '.'));
                const maxIterations = lines[6] ? parseInt(lines[6]) : 1000;

                if (isNaN(startX) || isNaN(learningRate) || isNaN(epsilon)) throw new Error();
                if (method !== 'gradient' && method !== 'adam') throw new Error("Method должен быть gradient или adam");
                if (type !== 'min' && type !== 'max') throw new Error("Type должен быть min или max");

                setFormData({
                    functionId,
                    method,
                    type,
                    startX,
                    learningRate,
                    epsilon,
                    maxIterations
                });

                startXInput.setValue(startX);
                learningRateInput.setValue(learningRate);
                epsilonInput.setValue(epsilon);
                maxIterationsInput.setValue(maxIterations);

                toast.success("Данные загружены");
            } catch (err) {
                toast.error("Ошибка файла: ожидается functionId method type startX lr eps [maxIterations]");
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.learningRate <= 0 || formData.learningRate > 1) {
            toast.error("Темп обучения должен быть в интервале (0, 1]");
            return;
        }

        if (formData.epsilon <= 0 || formData.epsilon > 1) {
            toast.error("Точность должна быть в интервале (0, 1]");
            return;
        }

        if (formData.maxIterations <= 0 || formData.maxIterations > 100000) {
            toast.error("Максимальное число итераций должно быть от 1 до 100000");
            return;
        }

        onOptimize(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Поиск экстремума</span>
                </div>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2 py-0.5 border border-slate-300 bg-white text-[9px] font-bold uppercase hover:bg-slate-100 transition-colors"
                >
                    <Upload className="w-2.5 h-2.5" /> Из файла
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".txt" onChange={handleFileUpload} />
            </div>

            <div className="p-6 space-y-6 flex-grow">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Функция</label>
                    <select
                        value={formData.functionId}
                        onChange={e => setFormData({...formData, functionId: Number(e.target.value)})}
                        className="w-full p-2 border border-slate-200 rounded-none text-xs font-mono outline-none focus:border-slate-400"
                    >
                        <option value="1">-2.8x³ - 3.48x² + 10.23x + 9.35</option>
                        <option value="2">sin(x) + 0.1</option>
                        <option value="3">x² - e^x + 2</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Метод</label>
                        <select
                            value={formData.method}
                            onChange={e => setFormData({...formData, method: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded-none text-xs outline-none focus:border-slate-400"
                        >
                            <option value="gradient">Градиентный спуск</option>
                            <option value="adam">Adam (Адаптивный)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Тип экстремума</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'min'})}
                                className={`flex-1 flex items-center justify-center gap-1 p-2 text-xs font-bold uppercase transition-colors ${
                                    formData.type === 'min'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Минимум
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'max'})}
                                className={`flex-1 flex items-center justify-center gap-1 p-2 text-xs font-bold uppercase transition-colors ${
                                    formData.type === 'max'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Максимум
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Начальная точка (x₀)</label>
                    <input
                        type="text"
                        value={startXInput.value}
                        onChange={startXInput.handleChange}
                        className={`w-full p-2 border ${startXInput.error ? 'border-red-500' : 'border-slate-200'} rounded-none text-xs font-mono outline-none focus:border-slate-400`}
                        placeholder="0"
                    />
                    {startXInput.error && (
                        <p className="text-[10px] text-red-500 mt-1">{startXInput.error}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Темп обучения (α)</label>
                        <input
                            type="text"
                            value={learningRateInput.value}
                            onChange={learningRateInput.handleChange}
                            className={`w-full p-2 border ${learningRateInput.error ? 'border-red-500' : 'border-slate-200'} rounded-none text-xs font-mono`}
                            placeholder="0.01"
                        />
                        {learningRateInput.error && (
                            <p className="text-[10px] text-red-500 mt-1">{learningRateInput.error}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Точность (ε)</label>
                        <input
                            type="text"
                            value={epsilonInput.value}
                            onChange={epsilonInput.handleChange}
                            className={`w-full p-2 border ${epsilonInput.error ? 'border-red-500' : 'border-slate-200'} rounded-none text-xs font-mono`}
                            placeholder="0.000001"
                        />
                        {epsilonInput.error && (
                            <p className="text-[10px] text-red-500 mt-1">{epsilonInput.error}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Макс. итераций</label>
                    <input
                        type="text"
                        value={maxIterationsInput.value}
                        onChange={maxIterationsInput.handleChange}
                        className={`w-full p-2 border ${maxIterationsInput.error ? 'border-red-500' : 'border-slate-200'} rounded-none text-xs font-mono`}
                        placeholder="1000"
                    />
                    {maxIterationsInput.error && (
                        <p className="text-[10px] text-red-500 mt-1">{maxIterationsInput.error}</p>
                    )}
                </div>
            </div>

            <div className="p-6 border-t bg-slate-50/50">
                <button
                    type="submit"
                    disabled={loading || !!startXInput.error || !!learningRateInput.error || !!epsilonInput.error}
                    className="w-full py-4 bg-slate-800 hover:bg-black text-white font-bold uppercase tracking-[0.3em] text-xs transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    {loading ? "Оптимизация..." : "Найти экстремум"}
                </button>
            </div>
        </form>
    );
};