export interface EquationRequest {
    functionId: number;
    method: string;
    a: number;
    b: number;
    epsilon: number;
}

export interface EquationResponse {
    success: boolean;
    errorMessage?: string | null;
    errorCode?: string;
    root?: number;
    functionValue?: number;
    iterations?: number;
    history?: any[];
    savedToFile?: string;
}

export interface SystemRequest {
    systemId: number;
    x0: number;
    y0: number;
    epsilon: number;
}

export interface SystemResponse {
    success: boolean;
    errorMessage?: string | null;
    errorCode?: string;
    resultVector?: [number, number];
    iterations?: number;
    history?: any[];
    savedToFile?: string;
}

export interface OptimizationRequest {
    functionId: number;
    method: string;
    type: string;
    startX: number;
    learningRate: number;
    epsilon: number;
    maxIterations: number;
}

export interface OptimizationStep {
    n: number;
    x: number;
    fx: number;
    gradient: number;
    learningRate: number;
    m?: number;
    v?: number;
}

export interface OptimizationResponse {
    success: boolean;
    errorMessage?: string | null;
    errorCode?: string;
    extremum?: number;
    value?: number;
    type?: string;
    iterations?: number;
    finalGradient?: number;
    history?: OptimizationStep[];
    savedToFile?: string;
}

export interface ErrorResponse {
    success: boolean;
    message: string;
    errorCode: string;
    timestamp: string;
}