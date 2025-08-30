import { Bilibili } from "@/util/bilibili";
import Bot from "./bot";

(async () => {
    new Bot(await Bilibili.getLiveRoomInfo(510), '阿梓');
})()