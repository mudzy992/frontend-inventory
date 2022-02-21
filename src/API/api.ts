import axios from "axios";
import { ApiConfig } from "../config/api.config"

export default function api(
    path: string,
    method: 'get' | 'post' | 'patch' | 'delete',
    body: any | undefined
) {
    axios({
        method: method,
        url: path,
        baseURL: ApiConfig.API_URL,
        data: JSON.stringify(body),
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : 'NoAuth'
        }
    })
    /* .then(function(response) {
        console.log(response)
    })
    .catch(function(error) {
        console.log(error)
    }) */
   
}