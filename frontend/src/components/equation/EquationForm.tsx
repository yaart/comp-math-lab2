import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { EquationRequest } from '../../types';
import toast from 'react-hot-toast';
import {useNumberInput} from "../../hook/useNumberInput";


interface EquationFormProps {
    onSolve: (data: EquationRequest) => void;
    loading: boolean;
}

export const EquationForm: React.FC<EquationFormProps> = ({ onSolve, loading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = React.useState<EquationRequest>({
        functionId: 1,
        method: 'chord',
        a: -2.2,
        b: -0.8,
        epsilon: 0.000001
    });

    const aInput = useNumberInput(formData.a, (value) => setFormData(prev => ({ ...prev, a: value })));
    const bInput = useNumberInput(formData.b, (value) => setFormData(prev => ({ ...prev, b: value })));
    const epsilonInput = useNumberInput(formData.epsilon, (value) => setFormData(prev => ({ ...prev, epsilon: value })));

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const lines = content.split(/[\s\n]+/).filter(v => v.length > 0);
                if (lines.length < 4) throw new Error();

                const functionId = Number(lines[0]);
                const a = parseFloat(lines[1].replace(',', '.'));
                const b = parseFloat(lines[2].replace(',', '.'));
                const epsilon = parseFloat(lines[3].replace(',', '.'));

                if (isNaN(a) || isNaN(b) || isNaN(epsilon)) throw new Error();

                setFormData(prev => ({
                    ...prev,
                    functionId: functionId,
                    a: a,
                    b: b,
                    epsilon: epsilon
                }));

                aInput.setValue(a);
                bInput.setValue(b);
                epsilonInput.setValue(epsilon);

                toast.success("Данные загружены");
            } catch {
                toast.error("Ошибка: Ожидалось 4 числа (ID, a, b, eps)");
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.a >= formData.b) {
            toast.error("Левая граница должна быть меньше правой");
            return;
        }

        if (formData.epsilon <= 0 || formData.epsilon > 1) {
            toast.error("Погрешность должна быть в интервале (0, 1]");
            return;
        }

        onSolve(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Параметры</span>
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
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Уравнение</label>
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
                            <option value="chord">Метод хорд</option>
                            <option value="secant">Метод секущих</option>
                            <option value="iteration">Простая итерация</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Точность (ε)</label>
                        <input
                            type="text"
                            value={epsilonInput.value}
                            onChange={epsilonInput.handleChange}
                            className={`w-full p-2 border ${epsilonInput.error ? 'border-red-500' : 'border-slate-200'} rounded-none text-xs font-mono outline-none focus:border-slate-400`}
                            placeholder="0.000001"
                        />
                        {epsilonInput.error && (
                            <p className="text-[10px] text-red-500 mt-1">{epsilonInput.error}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Интервал изоляции [a, b]</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <input
                                type="text"
                                value={aInput.value}
                                onChange={aInput.handleChange}
                                className={`w-full p-2 border ${aInput.error ? 'border-red-500' : 'border-slate-200'} rounded-none text-xs font-mono`}
                                placeholder="a"
                            />
                            {aInput.error && (
                                <p className="text-[10px] text-red-500 mt-1">{aInput.error}</p>
                            )}
                        </div>
                        <div>
                            <input
                                type="text"
                                value={bInput.value}
                                onChange={bInput.handleChange}
                                className={`w-full p-2 border ${bInput.error ? 'border-red-500' : 'border-slate-200'} rounded-none text-xs font-mono`}
                                placeholder="b"
                            />
                            {bInput.error && (
                                <p className="text-[10px] text-red-500 mt-1">{bInput.error}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t bg-slate-50/50">
                <button
                    type="submit"
                    disabled={loading || !!aInput.error || !!bInput.error || !!epsilonInput.error}
                    className="w-full py-4 bg-slate-800 hover:bg-black text-white font-bold uppercase tracking-[0.3em] text-xs transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    {loading ? "Выполнение..." : "Запустить расчет"}
                </button>
            </div>
        </form>
    );
};