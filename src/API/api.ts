import axios, { AxiosResponse } from "axios";
import { ApiConfig } from "../config/api.config"

export default function api(
    path: string,
    method: 'get' | 'post' | 'patch' | 'delete',
    body: any | undefined
) {
    return new Promise<ApiResponse>((resolve) => {
      axios({
        method: method,
        url: path,
        baseURL: ApiConfig.API_URL,
        data: JSON.stringify(body),
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : 'NoAuth'
        },
    })
    .then (res => responseHandler(res,resolve))
    .catch(err => resolve(err))
    })   
}

export interface ApiResponse {
    status: 'ok' | 'error' | 'login';
    data: any;
}

function responseHandler(
    res: AxiosResponse<any>,
    resolve: (value: ApiResponse) => void
    ){
        if (res.status < 200 || res.status >= 300){
            const response: ApiResponse = {
                status: 'error',
                data: res.data,
            }
            return resolve(response)
        }

        let response: ApiResponse;
        if (res.data.statusCode < 0) {
            response = {
                status: 'error',
                data: null,
            }
        } else {
            response = { 
                status: 'ok',
                data: res.data,
            }
        }

        resolve(response)
    }