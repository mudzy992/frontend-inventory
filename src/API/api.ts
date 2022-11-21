import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiConfig } from "../config/api.config"

export default function api(
    path: string,
    method: 'get' | 'post' | 'patch' | 'delete',
    body: any | undefined,
    role: 'administrator' | 'user' = 'user',
) {
    return new Promise<ApiResponse>((resolve) => {
        const requestData = {
            method: method,
            url: path,
            baseURL: ApiConfig.API_URL,
            data: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken(role),
            },
        };

        axios(requestData)
        .then(res => responseHandler(res, resolve))
        .catch(async err => {
            if (err.response.status === 401) {
                const newToken = await refreshToken(role);
    
                if (!newToken) {
                    const response: ApiResponse = {
                        status: 'login',
                        data: null,
                    };
            
                    return resolve(response);
                }
    
                saveToken(role, newToken);
    
                requestData.headers['Authorization'] = getToken(role);
    
                return await repeatRequest(requestData, resolve);
            }

            const response: ApiResponse = {
                status: 'error',
                data: err
            };

            resolve(response);
        });
    });
}

    export interface ApiResponse {
        status: 'ok' | 'error' | 'login';
        data: any;
    }

    async function responseHandler(
        res: AxiosResponse<any>,
        resolve: (value: ApiResponse) => void,
    ) {
        if (res.status < 200 || res.status >= 300) {
            const response: ApiResponse = {
                status: 'error',
                data: res.data,
            };
    
            return resolve(response);
        }
    
        const response: ApiResponse = {
            status: 'ok',
            data: res.data,
        };
    
        return resolve(response);
    }

    function getToken(role: 'administrator' | 'user'): string {
        const token = sessionStorage.getItem('api_token_' + role);
        return 'Berer ' + token;
    }
    
    export function saveToken(role: 'administrator' | 'user', token: string) {
        sessionStorage.setItem('api_token_' + role, token);
    }
    
    function getRefreshToken(role: 'administrator' | 'user'): string {
        const token = sessionStorage.getItem('api_refresh_token_' + role);
        return token + '';
    }
    
    export function saveRefreshToken(role: 'administrator' | 'user', token: string) {
        sessionStorage.setItem('api_refresh_token_' + role, token);
    }
    
    async function refreshToken(role: 'administrator' | 'user'): Promise<string | null> {
        const path = 'auth/' + role + '/refresh';
        const data = {
            token: getRefreshToken(role),
        }
    
        const refreshTokenRequestData: AxiosRequestConfig = {
            method: 'post',
            url: path,
            baseURL: ApiConfig.API_URL,
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    
        const rtr: { data: { token: string | undefined } } = await axios(refreshTokenRequestData);
    
        if (!rtr.data.token) {
            return null;
        }
    
        return rtr.data.token;
    }
    
    async function repeatRequest(
        requestData: AxiosRequestConfig,
        resolve: (value: ApiResponse) => void
    ) {
        axios(requestData)
        .then(res => {
            let response: ApiResponse;
    
            if (res.status === 401) {
                response = {
                    status: 'login',
                    data: null,
                };
            } else {
                response = {
                    status: 'ok',
                    data: res.data,
                };
            }
    
            return resolve(response);
        })
        .catch(err => {
            const response: ApiResponse = {
                status: 'error',
                data: err,
            };
    
            return resolve(response);
        });
    }