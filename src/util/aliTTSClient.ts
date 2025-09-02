import fs from 'fs';
import RPCClient from '@alicloud/pop-core';
import { httpClient } from './httpClient';
import upath from 'upath';
import { client } from '@/init/client';

class AliTTSClient {
    private client: RPCClient;
    private token: string | null = null;
    private tokenExpireTime: number = 0;
    private appKey: string | undefined = process.env.ALIYUN_APPKEY;

    constructor() {
        this.client = new RPCClient({
            accessKeyId: process.env.ALIYUN_AK_ID as string,
            accessKeySecret: process.env.ALIYUN_AK_SECRET as string,
            endpoint: 'http://nls-meta.cn-shanghai.aliyuncs.com',
            apiVersion: '2019-02-28'
        });
    }

    async getToken(): Promise<void> {
        try {
            const result: any = await this.client.request('CreateToken', {});
            client.logger.info(`获取Token成功: ${result.Token.Id}, 过期时间: ${new Date(result.Token.ExpireTime * 1000).toLocaleString()}`);
            this.token = result.Token.Id;
            this.tokenExpireTime = result.Token.ExpireTime;
            return;
        } catch (error) {
            console.error('获取Token失败:', error);
            throw error;
        }
    }

    async startTTs(text: string): Promise<void> {
        // Get方法，需要再采用RFC 3986规范进行urlencode编码
        // const textUrlEncode = encodeURIComponent(text)
        //     .replace(/[!'()*]/g, function (c) {
        //         return '%' + c.charCodeAt(0).toString(16);
        //     });

        const audioSaveFile = upath.join(__dirname, '..', 'audio', 'ttsAudio.wav');

        if (this.isTokenExpired()) {
            await this.getToken();
        }

        const url = 'https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/tts';
        const task = {
            appkey: this.appKey,
            token: this.token,
            text: text,
            format: 'wav',
            sample_rate: 16000
        };
        const bodyContent = JSON.stringify(task);

        try {
            const response: any = await httpClient.post(url, bodyContent, {
                method: 'POST',
                url: url,
                headers: { 'Content-Type': 'application/json' },
                responseType: 'arraybuffer'
            });
            if (response) {
                fs.writeFileSync(audioSaveFile, response);
            }
            console.log('The POST request is succeed!');
        } catch (error) {
            console.log(error);
        }
    }

    isTokenExpired(): boolean {
        // 获取当前时间的Unix时间戳（秒）
        const currentTime = Math.floor(Date.now() / 1000);
        // 提前5分钟
        const bufferTime = 300; // 5分钟
        return currentTime + bufferTime >= this.tokenExpireTime;
    }

}

export const aliTTSClient = new AliTTSClient();