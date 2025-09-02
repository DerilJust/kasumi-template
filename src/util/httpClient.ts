import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpClientConfig } from '../types';
import { client } from '@/init/client';

export class HttpClient {
    private instance: AxiosInstance;

    constructor(config?: HttpClientConfig) {
        this.instance = axios.create({
            baseURL: config?.baseURL,
            timeout: config?.timeout || 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ...config?.headers,
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // 请求拦截器
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                // client.logger.info(`发起请求: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                client.logger.error('请求错误:', error.message);
                return Promise.reject(error);
            }
        );

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                // client.logger.info(`收到响应: ${response.status} ${response.statusText}`);
                return response;
            },
            (error) => {
                client.logger.error('响应错误:', error.message);
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.get(url, config);
            return response.data;
        } catch (error) {
            client.logger.error(`GET请求失败: ${url} ${error}`);
            throw error;
        }
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.instance.post(url, data, config);
            return response.data;
        } catch (error) {
            client.logger.error(`POST请求失败: ${url} ${error}`);
            throw error;
        }
    }
}

// 创建默认的HTTP客户端实例
export const httpClient = new HttpClient();