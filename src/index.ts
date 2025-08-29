import dotenv from 'dotenv';
import { client } from "init/client";
import * as fs from 'fs';
import upath from 'upath';
import './event';

dotenv.config();
(async () => {
    await client.connect()
    const menuPath = upath.join(__dirname, 'menu');
    const menus = fs.readdirSync(menuPath);
    for (const menu of menus) {
        try {
            require(upath.join(menuPath, menu, "index"));
        } catch (e) {
            client.logger.error('Error loading menu');
            client.logger.error(e);
        }
    }
    const commandPath = upath.join(__dirname, 'command');
    const commands = fs.readdirSync(commandPath);
    for (const command of commands) {
        try {
            require(upath.join(commandPath, command));
        } catch (e) {
            client.logger.error('Error loading command');
            client.logger.error(e);
        }
    }
})()