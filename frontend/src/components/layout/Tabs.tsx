import React from 'react';

interface TabsProps {
    activeTab: 'equation' | 'system' | 'optimization';
    onChange: (tab: 'equation' | 'system' | 'optimization') => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onChange }) => {
    const tabs = [
        { id: 'equation' as const, label: 'Уравнения'},
        { id: 'system' as const, label: 'Системы'},
        { id: 'optimization' as const, label: 'Оптимизация'}
    ];

    return (
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8 w-fit mx-auto">
            {tabs.map((tab) => {
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};