import { Card, MessageType } from 'kasumi.js';
import { client } from "init/client";
import { Bilibili } from '@/util/bilibili';
import { LiveRoomInfo } from '@/types';

export default class Bot {
    data: LiveRoomInfo;
    name: string;
    channelId: string;
    startTime: number | null = null;
    private intervalId: NodeJS.Timeout | null = null;

    constructor(data: LiveRoomInfo, name: string) {
        this.data = data;
        this.name = name;
        this.channelId = '8999315963396178'; // 这里可以设置默认的频道ID，用于发送通知
        this.startMonitoring();
    }

    /**
     * 开始监控任务
     */
    startMonitoring(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        client.logger.info(`开始监控直播间 ${this.data.room_id}(${this.data.short_id})，每90秒检查一次`);

        // 立即执行一次检查
        this.checkLiveStatus();

        this.intervalId = setInterval(() => {
            this.checkLiveStatus();
        }, 90 * 1000); // 90秒 = 90 * 1000毫秒
    }

    /**
     * 停止监控任务
     */
    stopMonitoring(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            client.logger.info(`已停止监控直播间 ${this.data.room_id}(${this.data.short_id})`);
        }
    }

    /**
     * 测试方法，用于手动触发
     */
    async test(): Promise<void> {
        const currentStatus = await Bilibili.getLiveRoomInfo(this.data.room_id);
        this.sendLiveNotification(currentStatus);
    }

    /**
     * 检查直播间状态
     */
    private async checkLiveStatus(): Promise<void> {
        try {
            const currentStatus = await Bilibili.getLiveRoomInfo(this.data.room_id);

            // 检查状态是否有变化
            if (currentStatus.live_status !== this.data.live_status) {
                client.logger.info(`直播间 ${this.data.room_id} 状态发生变化: ${this.data.live_status} -> ${currentStatus.live_status}`);

                // 更新数据
                this.data = currentStatus;

                // 如果开播了，发送通知
                if (currentStatus.live_status === 1) {
                    await this.sendLiveNotification(currentStatus);
                }
                // 如果下播了，发送通知
                if (currentStatus.live_status === 0) {
                    await this.sendStopLiveNotification(currentStatus);
                }
            }
        } catch (error) {
            client.logger.error(`检查直播间 ${this.data.room_id}(${this.data.short_id}) 状态时出错: ${error}`);
        }
    }

    /**
     * 发送开播通知
     */
    private async sendLiveNotification(roomInfo: LiveRoomInfo): Promise<void> {
        try {
            const title = roomInfo.title || '未知标题';
            const uname = this.name || '未知主播';
            const liveUrl = `https://live.bilibili.com/${roomInfo.room_id}`;
            this.startTime = Date.now();

            const card = new Card()
                .setSize(Card.Size.LARGE)
                .setTheme(Card.Theme.INFO)
                .addTitle(`${uname} 开播啦！标题: ${title}`)
                .addImage(roomInfo.user_cover)
                .addText(`[点击进入直播间](${liveUrl})`);

            const { data, err } = await client.API.message.create(MessageType.CardMessage, this.channelId, card);

            if (data) {
                client.logger.info(`已发送开播通知: ${uname} - ${title}`);
            } else {
                client.logger.error(err);
            }

        } catch (error) {
            client.logger.error(`发送开播通知时出错: ${error}`);
        }
    }

    /**
     * 发送下播通知
     */
    private async sendStopLiveNotification(roomInfo: LiveRoomInfo): Promise<void> {
        try {
            const title = roomInfo.title || '未知标题';
            const uname = this.name || '未知主播';

            const card = new Card()
                .setSize(Card.Size.LARGE)
                .setTheme(Card.Theme.INFO)
                .addTitle(`${uname} 下播啦！主题: ${title}`)
                .addImage(roomInfo.user_cover)
                .addText(`本次直播持续了: ${this.startTime ? Math.floor((Date.now() - this.startTime) / 60000) : '未知'} 分钟`);

            const { data, err } = await client.API.message.create(MessageType.CardMessage, this.channelId, card);

            if (data) {
                client.logger.info(`已发送下播通知: ${uname} - ${title}`);
            } else {
                client.logger.error(err);
            }

        } catch (error) {
            client.logger.error(`发送下播通知时出错: ${error}`);
        }
    }

    /**
     * 销毁方法，用于清理资源
     */
    destroy(): void {
        this.stopMonitoring();
    }
}