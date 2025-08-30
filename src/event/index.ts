import { listChannel as listChannelToJoin } from "@/menu/voice/command/join";
import channelList from "@/menu/channel/command/list";
import { client } from "init/client";
import { BaseSession } from "kasumi.js";
import { leaveChannel } from "@/menu/voice/command/leave";
import { listFirstJoinChannelId } from "@/menu/voice/command/list";
import { IAudioJoinResponse } from "@/types";
import VoiceClient from "@/voiceClient/voiceClient";
import * as path from 'path';

client.on('message.text', (event) => {
    client.logger.info("Received text message:", event.content);
});

client.on('event.button', async (event) => {
    client.logger.info("Button event value:", event.value);
    client.logger.info("Button event content:", event.content);
    client.logger.info("Button event channelId:", event.channelId);

    const [action, arg1] = event.value.split(',');
    const session = new BaseSession([], event, client);

    if (action === 'listJoinChannelLast') {
        const page = parseInt(arg1) || 1;
        listChannelToJoin(session, page - 1);
    }
    if (action === 'listJoinChannelNext') {
        const page = parseInt(arg1) || 1;
        listChannelToJoin(session, page + 1);
    }
    if (action === 'joinChannel') {
        const channelId = arg1;
        const joinChannelId = await listFirstJoinChannelId();
        if (joinChannelId) {
            leaveChannel(session, joinChannelId);
        }
        if (channelId) {
            client.API.voice.join(channelId, {}).then(({ err, data }) => {
                if (err) {
                    client.logger.error("Join voice channel error:", err);
                } else {
                    client.logger.info("Join voice channel success:", data);
                    const vc = new VoiceClient(data as IAudioJoinResponse);
                    const AUDIO_FILE_PATH = path.join(__dirname, '..', 'audio', '16k.wav');
                    vc.streamAudio(AUDIO_FILE_PATH).then(() => {
                        client.logger.info("Audio streaming finished.");
                    }).catch((error) => {
                        client.logger.error("Audio streaming error:", error);
                    });
                }
            });
        }
    }

    if (action === 'listVoiceChannelLast') {
        const page = parseInt(arg1) || 1;
        channelList.listChannel(session, 'voice', page - 1);
    }
    if (action === 'listVoiceChannelNext') {
        const page = parseInt(arg1) || 1;
        channelList.listChannel(session, 'voice', page + 1);
    }

    if (action === 'listTextChannelLast') {
        const page = parseInt(arg1) || 1;
        channelList.listChannel(session, 'text', page - 1);
    }
    if (action === 'listTextChannelNext') {
        const page = parseInt(arg1) || 1;
        channelList.listChannel(session, 'text', page + 1);
    }
});
