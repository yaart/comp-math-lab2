import React from 'react';

interface AlertProps {
    type: 'error' | 'success' | 'info' | 'warning';
    message: string;
    errorCode?: string;
    onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, errorCode, onDismiss }) => {
    const styles = {
        error: 'bg-red-50 border-red-200 text-red-700',
        success: 'bg-green-50 border-green-200 text-green-700',
        info: 'bg-blue-50 border-blue-200 text-blue-700',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    };

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]} animate-in fade-in slide-in-from-top duration-300`}>
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
                {errorCode && (
                    <p className="text-xs font-mono mt-1 opacity-70">Код: {errorCode}</p>
                )}
            </div>
            {onDismiss && (
                <button onClick={onDismiss} className="text-xs font-bold uppercase hover:opacity-70">
                    ✕
                </button>
            )}
        </div>
    );
};