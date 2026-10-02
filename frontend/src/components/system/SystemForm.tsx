import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { SystemRequest } from "../../types";
import {useNumberInput} from "../../hook/useNumberInput";

interface SystemFormProps {
    onSolve: (data: SystemRequest) => void;
    loading: boolean;
    onParamChange?: () => void;
}

export const SystemForm: React.FC<SystemFormProps> = ({ onSolve, loading, onParamChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [data, setData] = useState<SystemRequest>({
        systemId: 1,
        x0: 0.8,
        y0: 0.6,
        epsilon: 0.000001
    });

    const x0Input = useNumberInput(data.x0, (value) => {
        setData(prev => ({ ...prev, x0: value }));
        if (onParamChange) onParamChange();
    });

    const y0Input = useNumberInput(data.y0, (value) => {
        setData(prev => ({ ...prev, y0: value }));
        if (onParamChange) onParamChange();
    });

    const epsilonInput = useNumberInput(data.epsilon, (value) => {
        setData(prev => ({ ...prev, epsilon: value }));
        if (onParamChange) onParamChange();
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const values = content.split(/[\s\n]+/).filter(v => v.length > 0);

                if (values.length < 4) throw new Error("Формат: systemId x0 y0 eps");

                const systemId = Number(values[0]);
                const x0 = parseFloat(values[1].replace(',', '.'));
                const y0 = parseFloat(values[2].replace(',', '.'));
                const epsilon = parseFloat(values[3].replace(',', '.'));

                if (isNaN(x0) || isNaN(y0) || isNaN(epsilon)) throw new Error();

                setData({
                    systemId: systemId,
                    x0: x0,
                    y0: y0,
                    epsilon: epsilon
                });

                x0Input.setValue(x0);
                y0Input.setValue(y0);
                epsilonInput.setValue(epsilon);

                if (onParamChange) onParamChange();
                toast.success("Данные системы загружены");
            } catch (err) {
                toast.error("Ошибка файла: ожидается 4 числа (systemId x0 y0 eps)");
            }
        };
        reader.readAsText(file);
    };

    const systemDescriptions = {
        1: {
            eq1: "sin(x + y) - 1.1x = 0.1",
            eq2: "x² + y² = 1",
            color1: "#000000",
            color2: "#8b5cf6"
        },
        2: {
            eq1: "cos y + x = 1.5",
            eq2: "2y - sin(x - 0.5) = 1",
            color1: "#000000",
            color2: "#8b5cf6"
        }
    };

    const defaultInitials = {
        1: { x0: 0.8, y0: 0.6 },
        2: { x0: 1.2, y0: 0.8 }
    };

    useEffect(() => {
        const defaults = defaultInitials[data.systemId as keyof typeof defaultInitials];
        setData(prev => ({
            ...prev,
            x0: defaults.x0,
            y0: defaults.y0
        }));
        x0Input.setValue(defaults.x0);
        y0Input.setValue(defaults.y0);
        if (onParamChange) onParamChange();
    }, [data.systemId]);

    const handleSubmit = () => {
        if (data.epsilon <= 0 || data.epsilon > 1) {
            toast.error("Погрешность должна быть в интервале (0, 1]");
            return;
        }

        onSolve(data);
    };

    return (
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                        Настройка системы
                    </h2>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-300 text-[9px] font-bold uppercase tracking-tighter hover:bg-slate-100"
                >
                    <Upload className="w-3 h-3" />
                    Из файла
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt"
                    onChange={handleFileUpload}
                />
            </div>

            <div className="p-5 space-y-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Выберите систему
                    </label>
                    <select
                        value={data.systemId}
                        onChange={e => {
                            setData({...data, systemId: Number(e.target.value)});
                            if (onParamChange) onParamChange();
                        }}
                        className="w-full p-2 border border-slate-300 rounded-none text-xs font-mono bg-white"
                    >
                        <option value={1}>sin(x + y) - 1.1x = 0.1  |  x² + y² = 1</option>
                        <option value={2}>cos y + x = 1.5  |  2y - sin(x - 0.5) = 1</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Уравнения
                    </label>
                    <div className="p-3 bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600">
                        <p className="mb-2 flex items-center gap-2">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: systemDescriptions[data.systemId as keyof typeof systemDescriptions]?.color1 }}
                            ></span>
                            <span>{systemDescriptions[data.systemId as keyof typeof systemDescriptions]?.eq1}</span>
                        </p>
                        <p className="mb-2 flex items-center gap-2">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: systemDescriptions[data.systemId as keyof typeof systemDescriptions]?.color2 }}
                            ></span>
                            <span>{systemDescriptions[data.systemId as keyof typeof systemDescriptions]?.eq2}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Начальное x₀</label>
                        <input
                            type="text"
                            value={x0Input.value}
                            onChange={x0Input.handleChange}
                            className={`w-full p-2 border ${x0Input.error ? 'border-red-500' : 'border-slate-300'} rounded-none text-xs font-mono`}
                        />
                        {x0Input.error && (
                            <p className="text-[10px] text-red-500 mt-1">{x0Input.error}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Начальное y₀</label>
                        <input
                            type="text"
                            value={y0Input.value}
                            onChange={y0Input.handleChange}
                            className={`w-full p-2 border ${y0Input.error ? 'border-red-500' : 'border-slate-300'} rounded-none text-xs font-mono`}
                        />
                        {y0Input.error && (
                            <p className="text-[10px] text-red-500 mt-1">{y0Input.error}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Точность (ε)</label>
                    <input
                        type="text"
                        value={epsilonInput.value}
                        onChange={epsilonInput.handleChange}
                        className={`w-full p-2 border ${epsilonInput.error ? 'border-red-500' : 'border-slate-300'} rounded-none text-xs font-mono`}
                    />
                    {epsilonInput.error && (
                        <p className="text-[10px] text-red-500 mt-1">{epsilonInput.error}</p>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !!x0Input.error || !!y0Input.error || !!epsilonInput.error}
                    className="w-full py-3 bg-slate-800 hover:bg-black text-white font-bold uppercase tracking-[0.2em] transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    {loading ? "Вычисление..." : "Решить систему"}
                </button>
            </div>
        </div>
    );
};