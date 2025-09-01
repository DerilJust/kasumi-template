# Simple-KOOK-Bot

基于 Node.js + TypeScript 开发的KOOK（开黑啦）机器人，在 [Kasumi-Template](https://github.com/IonicCompound/kasumi-template) 的基础上开发。

## 功能特性
-🤖 AI 智能问答 - 集成大型语言模型，提供智能对话功能

-🔊 TTS 语音回答 - 支持将文本转换为语音消息

-📢 B 站开播通知 - 监控 B 站主播状态，开播时自动发送通知

## 快速开始
环境准备
```bash
# 安装依赖
npm install
```
安装[FFmpeg](https://ffmpeg.org/download.html)

创建`.env`文件
```bash
cp .env-template .env
```
在`.env`中填入对应参数
```
CONFIG_PATH="Your config path"
GUILD_ID="Your guild id"
STAY_CHANNEL_ID="Your stay channel id"

ALIYUN_AK_ID="Your aliyun ak id"
ALIYUN_AK_SECRET="Your aliyun ak secret"
ALIYUN_APPKEY="Your aliyun appkey"

OPENAI_API_KEY="Your ai api key"
```
创建`config.json5`文件
```bash
cd config
# 使用webhook也行
cp template-websocket-config.json5 config.json5
```
启动项目
```bash
npm run start:pretty
```