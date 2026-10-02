import React, { useRef, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
    onDataLoaded: (data: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>('');

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            parseFile(content);
        };
        reader.readAsText(file);
        setFileName(file.name);
    };

    const parseFile = (content: string) => {
        try {
            const lines = content.trim().split('\n').map(l => l.trim());
            if (lines.length < 3) throw new Error("Неверный формат файла");

            const id = parseInt(lines[0]);
            const coords = lines[1].split(/\s+/).map(Number);
            const eps = parseFloat(lines[2]);

            if (isNaN(id) || isNaN(eps) || coords.some(isNaN)) throw new Error("Файл содержит некорректные числа");

            onDataLoaded({ id, coords, eps });
            toast.success('Данные из файла загружены');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
                <Upload className="w-3 h-3" />
                {fileName ? 'Сменить файл' : 'Загрузить файл'}
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
            />
            {fileName && (
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                    {fileName}
                </span>
            )}
        </div>
    );
};