import { Bilibili } from "@/util/bilibili";
import Bot from "./bot";
import { voiceBot } from "./voiceBot";

(async () => {
    new Bot(await Bilibili.getLiveRoomInfo(510), '阿梓');
})()