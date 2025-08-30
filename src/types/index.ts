// B站API响应类型
export interface BiliApiResponse<T> {
    code: number;
    message: string;
    ttl: number;
    data: T;
}

// 直播间信息类型
export interface LiveRoomInfo {
    uid: number;
    room_id: number;
    short_id: number;
    title: string;
    cover: string;
    tags: string;
    background: string;
    description: string;
    live_status: number;
    live_start_time: number;
    live_screen_type: number;
    lock_status: number;
    lock_time: number;
    hidden_status: number;
    hidden_time: number;
    area_id: number;
    area_name: string;
    parent_area_id: number;
    parent_area_name: string;
    keyframe: string;
    special_type: number;
    up_session: string;
    pk_status: number;
    is_studio: boolean;
    on_voice_join: number;
    online: number;
    room_type: number;
}

// HTTP客户端配置类型
export interface HttpClientConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

// HTTP请求选项类型
export interface RequestOptions {
    params?: Record<string, any>;
    headers?: Record<string, string>;
}

// KOOK消息类型
export interface KookMessage {
    content: string;
    // 可以根据KOOK webhook支持的消息格式扩展
    // 例如: embeds, attachments等
}

// KOOK音频响应类型
export interface IAudioJoinResponse {
    ip: string;
    port: string;
    rtcp_port: string;
    rtcp_mux: boolean;
    bitrate: number;
    audio_ssrc: string;
    audio_pt: string;
}