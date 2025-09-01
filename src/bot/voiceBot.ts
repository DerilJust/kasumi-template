import { client } from "@/init/client";
import { IAudioJoinResponse } from "@/types";
import VoiceClient from "@/voiceClient/voiceClient";

class VoiceBot {
    isInChannel: boolean;
    private stayChannelId: string = process.env.STAY_CHANNEL_ID || '';
    private audioJoinResponse: IAudioJoinResponse | null = null;
    private intervalId: NodeJS.Timeout | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor() {
        this.isInChannel = false;
        this.joinChannel();
    }

    async joinChannel(): Promise<void> {
        if (this.isInChannel) {
            return;
        }

        try {
            const { err, data } = await client.API.voice.join(this.stayChannelId, {});
            if (err) {
                client.logger.error("VoiceBot Join voice channel error:", err);
                this.scheduleReconnect();
            } else {
                client.logger.info("VoiceBot Join voice channel success.");
                this.audioJoinResponse = data as IAudioJoinResponse;
                this.isInChannel = true;
                this.reconnectAttempts = 0;
                this.startKeepAlive();
            }
        } catch (error) {
            client.logger.error("Unexpected error joining channel:", error);
            this.scheduleReconnect();
        }
    }

    async sendAudio(filePath: string): Promise<void> {
        if (!this.isInChannel || !this.audioJoinResponse) {
            client.logger.warn("VoiceBot is not in a voice channel.");
            return;
        }

        const vc = new VoiceClient(this.audioJoinResponse);
        vc.streamAudio(filePath).then(() => {
            client.logger.info("Audio streaming finished.");
        }).catch((error) => {
            client.logger.error("Audio streaming error:", error);
        });
    }

    startKeepAlive(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.intervalId = setInterval(() => {
            this.keepAlive();
        }, 30 * 1000); // 40秒
    }

    private async keepAlive(): Promise<void> {
        if (!this.isInChannel) {
            return;
        }

        try {
            const { err } = await client.API.voice.keepAlive(this.stayChannelId);
            if (err) {
                client.logger.error("Keep alive voice channel error:", err);
                this.isInChannel = false;
                this.audioJoinResponse = null;
                this.scheduleReconnect();
            } else {
                client.logger.debug("Keep alive voice channel success");
            }
        } catch (error) {
            client.logger.error("Unexpected error in keepAlive:", error);
            this.isInChannel = false;
            this.audioJoinResponse = null;
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            client.logger.error("Max reconnection attempts reached. Giving up.");
            return;
        }

        // 指数退避策略
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        client.logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

        setTimeout(() => {
            this.joinChannel();
        }, delay);
    }

    async disconnect(): Promise<void> {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.isInChannel) {
            try {
                await client.API.voice.leave(this.stayChannelId);
                client.logger.info("Left voice channel successfully");
            } catch (error) {
                client.logger.error("Error leaving voice channel:", error);
            }

            this.isInChannel = false;
            this.audioJoinResponse = null;
        }
    }
}

export const voiceBot = new VoiceBot();