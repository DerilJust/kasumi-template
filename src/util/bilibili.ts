import { httpClient } from './httpClient';
import { BiliApiResponse, LiveRoomInfo } from '../types';

export class Bilibili {
  private static readonly API_BASE = 'https://api.live.bilibili.com';

  /**
   * 获取直播间信息
   * @param roomId 直播间ID
   */
  static async getLiveRoomInfo(roomId: number): Promise<LiveRoomInfo> {
    const url = `${this.API_BASE}/room/v1/Room/get_info`;
    const params = { room_id: roomId };

    try {
      const response = await httpClient.get<BiliApiResponse<LiveRoomInfo>>(url, { params });
      
      if (response.code === 0) {
        return response.data;
      } else {
        throw new Error(`B站API错误: ${response.message}`);
      }
    } catch (error) {
      console.error('获取直播间信息失败:', error);
      throw error;
    }
  }

  /**
   * 检查直播间是否正在直播
   * @param roomId 直播间ID
   */
  static async isLive(roomId: number): Promise<boolean> {
    try {
      const roomInfo = await this.getLiveRoomInfo(roomId);
      return roomInfo.live_status === 1;
    } catch (error) {
      console.error('检查直播状态失败:', error);
      return false;
    }
  }
}