import { spawn } from 'child_process';
import * as fs from 'fs';
import { IAudioJoinResponse } from '../types';
import { client } from '@/init/client';

export default class VoiceClient {
    ip: string;
    port: string;
    rtcp_port: string;
    rtcp_mux: boolean;
    bitrate: number;
    audio_ssrc: string;
    audio_pt: string;
    constructor(data: IAudioJoinResponse) {
        this.ip = data.ip;
        this.port = data.port;
        this.rtcp_port = data.rtcp_port;
        this.rtcp_mux = data.rtcp_mux;
        this.bitrate = data.bitrate;
        this.audio_ssrc = data.audio_ssrc;
        this.audio_pt = data.audio_pt;
    }

    streamAudio(
        audioFilePath: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            // 检查文件是否存在
            if (!fs.existsSync(audioFilePath)) {
                reject(new Error(`Audio file not found: ${audioFilePath}`));
                return;
            }

            // 构建FFmpeg命令参数
            const args = [
                '-re', // 以原生帧率读取输入
                '-i', audioFilePath,
                '-map', '0:a:0',
                '-acodec', 'libopus',
                '-ab', `${this.bitrate}`, // 使用API返回的比特率
                '-ac', '2', // 立体声
                '-ar', `48000`, // 采样率
                '-filter:a', 'volume=0.8',
                '-f', 'tee'
            ];

            // 构建输出目标
            let outputTarget: string;

            if (this.rtcp_mux) {
                // 使用RTCP Mux
                outputTarget = `[select=a:f=rtp:ssrc=${this.audio_ssrc}:payload_type=${this.audio_pt}]rtp://${this.ip}:${this.port}`;
            } else {
                // 不使用RTCP Mux
                outputTarget = `[select=a:f=rtp:ssrc=${this.audio_ssrc}:payload_type=${this.audio_pt}]rtp://${this.ip}:${this.port}?rtcpport=${this.rtcp_port}`;
            }

            args.push(outputTarget);

            console.log('FFmpeg command:', `ffmpeg ${args.join(' ')}`);

            // 启动FFmpeg进程
            const ffmpegProcess = spawn('ffmpeg', args);

            ffmpegProcess.stdout.on('data', (data) => {
                // client.logger.info(`FFmpeg stdout: ${data}`);
            });

            ffmpegProcess.stderr.on('data', (data) => {
                // client.logger.error(`FFmpeg stderr: ${data}`);
            });

            ffmpegProcess.on('close', (code) => {
                if (code === 0) {
                    client.logger.info('FFmpeg process completed successfully');
                    resolve();
                } else {
                    reject(new Error(`FFmpeg process exited with code ${code}`));
                }
            });

            ffmpegProcess.on('error', (err) => {
                reject(new Error(`Failed to start FFmpeg: ${err.message}`));
            });
        });
    }
}