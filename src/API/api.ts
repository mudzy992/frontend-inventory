import axios, { AxiosRequestConfig } from "axios";
import { ApiConfig } from "../config/api.config";
import { useUserContext } from "../components/UserContext/UserContext";

export function useApi() {
    const { checkAuthentication } = useUserContext();

    async function api(
        path: string,
        method: 'get' | 'post' | 'patch' | 'delete' | 'put',
        body: any | undefined,
        role: 'user' | 'administrator' | 'moderator' = 'user',
        options: { useMultipartFormData?: boolean } = {},
    ): Promise<ApiResponse> {
        const requestData = createRequestConfig(path, method, body, options);

        try {
            const res = await axios(requestData);
            return { status: 'ok', data: res.data };
        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshToken();

                if (!newToken) {
                    checkAuthentication();
                    return { status: 'login', data: null };
                }

                saveToken(newToken);
                requestData.headers = requestData.headers || {};
                requestData.headers['Authorization'] = getToken();

                return await api(path, method, body, role, options);
            }

            return handleErrorResponse(err);
        }
    }

    return { api };
}

export interface ApiResponse {
    status: 'ok' | 'error' | 'login' | 'forbidden';
    data: any;
}

function createRequestConfig(
    path: string,
    method: 'get' | 'post' | 'patch' | 'delete' | 'put',
    body: any,
    options: { useMultipartFormData?: boolean },
): AxiosRequestConfig {
    return {
        method,
        url: path,
        baseURL: ApiConfig.API_URL,
        data: options.useMultipartFormData ? body : JSON.stringify(body),
        headers: {
            'Content-Type': options.useMultipartFormData ? 'multipart/form-data' : 'application/json',
            'Authorization': getToken(),
        },
    };
}

function handleErrorResponse(err: any): ApiResponse {
    if (err.response?.status === 403) {
        return { status: 'forbidden', data: err.response.data };
    }

    return { status: 'error', data: err };
}

function getToken(): string {
    const token = localStorage.getItem('api_token');
    return `Bearer ${token}`;
}

export function saveToken(token: string) {
    localStorage.setItem('api_token', token);
}

function getRefreshToken(): string {
    return localStorage.getItem('api_refresh_token') || '';
}

export function saveRefreshToken(token: string) {
    localStorage.setItem('api_refresh_token', token);
}

async function refreshToken(): Promise<string | null> {
    const path = '/auth/refresh';
    const data = { token: getRefreshToken() };

    try {
        const res = await axios.post(`${ApiConfig.API_URL}${path}`, data, {
            headers: { 'Content-Type': 'application/json' },
        });

        return res.data.token || null;
    } catch (err) {
        console.error('Error refreshing token:', err);
        return null;
    }
}
