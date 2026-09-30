import axios from 'axios'

// Axios instance for the future Flask/REST backend. Currently unused — the
// active data source is localPostRepository. httpPostRepository will use this.
export const httpClient = axios.create({
  baseURL: '/api',
})

// Future: attach auth token / error-normalization interceptors here.
// httpClient.interceptors.request.use(...)
// httpClient.interceptors.response.use(...)
