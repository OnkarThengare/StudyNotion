import axios from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyDate, headers, params) => {
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyDate ? bodyDate : null,
        headers: headers ? headers : null,
        params: params ? params : null,

    })
}