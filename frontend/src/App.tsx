import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Tabs } from './components/layout/Tabs';
import { Toaster } from 'react-hot-toast';
import {NonLinearPage} from "./components/equation/NonLinearPage";
import {SystemPage} from "./components/system/SystemPage";
import {OptimizationPage} from "./components/optimization/OptimizationPage";

function App() {
    const [activeTab, setActiveTab] = useState<'equation' | 'system' | 'optimization'>('equation');

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 max-w-6xl">
                <Tabs
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
                {activeTab === 'equation' && <NonLinearPage />}
                {activeTab === 'system' && <SystemPage />}
                {activeTab === 'optimization' && <OptimizationPage />}
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'monospace'
                    }
                }}
            />
        </div>
    );
}

export default App;