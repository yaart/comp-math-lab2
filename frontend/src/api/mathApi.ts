import axios from 'axios';
import {
    EquationRequest, EquationResponse,
    SystemRequest, SystemResponse,
    OptimizationRequest, OptimizationResponse,
    ErrorResponse
} from '../types';

const API = axios.create({
    baseURL: 'http://localhost:8080/api/lab2',
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.data) {
            const errorData = error.response.data as ErrorResponse;
            return Promise.reject({
                message: errorData.message || 'Неизвестная ошибка',
                code: errorData.errorCode || 'UNKNOWN_ERROR',
                response: error.response
            });
        }
        return Promise.reject({
            message: error.message || 'Ошибка сети',
            code: 'NETWORK_ERROR'
        });
    }
);

export const mathApi = {
    solveEquation: async (data: EquationRequest) => {
        try {
            const response = await API.post<EquationResponse>('/solve-equation', data);
            return response.data;
        } catch (error: any) {
            throw {
                message: error.message || 'Ошибка при решении уравнения',
                code: error.code || 'API_ERROR'
            };
        }
    },

    solveSystem: async (data: SystemRequest) => {
        try {
            const response = await API.post<SystemResponse>('/system/solve', data);
            return response.data;
        } catch (error: any) {
            throw {
                message: error.message || 'Ошибка при решении системы',
                code: error.code || 'API_ERROR'
            };
        }
    },

    optimize: async (data: OptimizationRequest) => {
        try {
            const response = await API.post<OptimizationResponse>('/optimization/optimize', data);
            return response.data;
        } catch (error: any) {
            throw {
                message: error.message || 'Ошибка при оптимизации',
                code: error.code || 'OPTIMIZATION_ERROR'
            };
        }
    }
};