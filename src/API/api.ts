import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiConfig } from "../config/api.config"
import { saveIdentity, useUserContext } from "../components/UserContext/UserContext";

export default function api(
    path: string,
    method: 'get' | 'post' | 'patch' | 'delete' | 'put',
    body: any | undefined,
    role: 'user' | 'administrator' | 'moderator' = 'user',
    options: { useMultipartFormData?: boolean } = {},
) {
    return new Promise<ApiResponse>((resolve) => {
        const requestData = {
            method: method,
            url: path,
            baseURL: ApiConfig.API_URL,
            data: options.useMultipartFormData ? body : JSON.stringify(body),
            role: role,
            headers: {
                'Content-Type': options.useMultipartFormData ? 'multipart/form-data' : 'application/json',
                'Authorization': getToken(),
            },
        };
        // console.log('API Call:', path, method, body);
        axios(requestData)
        .then(res => responseHandler(res, resolve))
        .catch(async err => {
            if (err.response.status === 401) {
                const newToken = await refreshToken();
    
                if (!newToken) {
                    const response: ApiResponse = {
                        status: 'login',
                        data: null,
                    };
            
                    return resolve(response);
                }
    
                saveToken(newToken);
    
                requestData.headers['Authorization'] = getToken();
    
                return await repeatRequest(requestData, resolve);
            }

            if (err.response.status === 403) {
                // Dodajte novi status "forbidden"
                const response: ApiResponse = {
                  status: 'forbidden',
                  data: err.response.data,
                };
                return resolve(response);
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
        status: 'ok' | 'error' | 'login' | 'forbidden';
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

    function getToken(): string {
        const token = localStorage.getItem('api_token');
        return 'Bearer ' + token;
    }
    
    export function saveToken(token: string) {
        localStorage.setItem('api_token', token);
    }
    
    function getRefreshToken(): string {
        const token = localStorage.getItem('api_refresh_token');
        return token + '';
    }
    
    export function saveRefreshToken(token: string) {
        localStorage.setItem('api_refresh_token', token);
    }

    export function removeIdentity(){
        localStorage.removeItem('api_token' );
        localStorage.removeItem('api_refresh_token');
        localStorage.removeItem('api_identity_role')
        localStorage.removeItem('api_identity_id',);
    }

    async function refreshToken(): Promise<string | null> {
        const path = '/auth/refresh';
        const data = {
            token: getRefreshToken(),
        };
    
        const refreshTokenRequestData: AxiosRequestConfig = {
            method: 'post',
            url: path,
            baseURL: ApiConfig.API_URL,
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    
        try {
            const rtr: { data: { token: string | undefined } } = await axios(refreshTokenRequestData);
    
            if (!rtr.data.token) {
                return null;
            }
    
            return rtr.data.token;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
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
    