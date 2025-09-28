🎤 智能语音对话系统 - 后端服务
✨ 让对话更自然，让交流更智能 - 基于 WebSocket 的实时语音交互后端引擎

🚀 快速开始
📋 前置要求
Node.js 16.0+

npm 或 yarn

麦克风设备（用于语音输入）

现代浏览器（Chrome/Firefox/Safari）

🛠️ 安装与运行
bash
# 1. 克隆项目
git clone <your-repo-url>
cd voice-chat-backend

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置你的服务器设置

# 4. 启动开发服务器
npm run dev

# 5. 或者构建生产版本
npm run build
npm start
🎯 核心功能
🎙️ 实时语音录制 - 支持浏览器原生录音

🔄 WebSocket 双向通信 - 低延迟实时数据传输

🎵 多音色支持 - 动态切换语音合成音色

💬 智能会话管理 - 多轮对话上下文维护

📱 响应式设计 - 完美适配桌面与移动端

🏗️ 架构设计
📦 模块规格
1. WebSocket 通信层 (ChatWebSocket)
typescript
🌐 核心职责：管理实时双向通信
├── 📡 连接管理（自动重连、心跳检测）
├── 📨 消息路由（音频/文本消息分发）
├── 🔄 状态同步（连接状态、会话管理）
└── 🛡️ 错误处理（网络异常、数据校验）
2. 语音处理层 (VoiceStore)
typescript
🎤 核心职责：语音输入输出处理
├── ⏺️ 录音控制（开始/停止/状态管理）
├── 🔊 音频处理（格式转换、数据编码）
├── 🎚️ 音色配置（动态切换、参数管理）
└── 📊 状态指示（录音中、处理中、错误状态）
3. 会话管理层 (ChatStore)
typescript
💬 核心职责：对话上下文维护
├── 🆔 会话标识（唯一会话ID生成）
├── 📝 消息历史（对话记录存储）
├── 🎭 角色管理（角色ID、情感参数）
└── 🔄 上下文维护（多轮对话记忆）
🔗 数据流架构
text
🎤 用户语音输入
    ↓
🔊 VoiceStore (录音处理)
    ↓  
🌐 ChatWebSocket (音频数据传输)
    ↓
🖥️ 后端语音服务 (ASR + TTS)
    ↓
🌐 ChatWebSocket (文本+音频返回)  
    ↓
💬 ChatStore (会话更新)
    ↓
🔊 VoiceStore (音频播放)
    ↓  
👂 用户听到回复
🎨 消息协议设计
📨 音频消息格式
typescript
interface WSAudioMessage {
  type: 'audio'
  messageId: string
  timestamp: number
  data: {
    audioData: string      // Base64编码的音频数据
    format: string         // 音频格式 (webm/wav)
    sessionId: string      // 会话标识
    voiceType: string      // 🎵 音色类型
  }
}
📝 文本消息格式
typescript
interface WSTextMessage {
  type: 'text'
  messageId: string
  timestamp: number  
  data: {
    text: string          // 输入文本
    characterId: string   // 角色标识
    emotion?: string      // 🎭 情感参数
    sessionId: string     // 会话标识
    voiceType: string     // 🎵 音色类型
  }
}
👥 团队分工
模块	负责人	主要职责
🎤 语音处理	Alex	录音控制、音频编解码、音色管理
🌐 网络通信	Taylor	WebSocket连接、消息协议、错误处理
💬 会话管理	Jordan	会话维护、上下文管理、状态同步
🎨 前端集成	Casey	Vue组件、用户交互、响应式设计
🎥 Demo 演示
🎬 演示亮点
🎙️ 实时语音对话 - 按住说话，松开发送

🎵 动态音色切换 - 下拉选择不同音色

🔗 智能重连机制 - 网络中断自动恢复

📱 多端适配 - 桌面端与移动端完美体验

⚡ 低延迟响应 - 流畅的对话交互体验

🎯 使用场景
在线客服 - 智能语音客服系统

语音助手 - 个人语音助理应用

语言学习 - 语音对话练习平台

娱乐聊天 - 智能角色语音互动

🔧 技术栈
前端框架: Vue 3 + TypeScript

状态管理: Pinia

UI组件: Element Plus

实时通信: WebSocket

构建工具: Vite

语音处理: Web Audio API

📈 性能指标
🚀 连接建立: < 100ms

🎙️ 语音延迟: < 200ms

🔄 端到端响应: < 1s

📊 并发支持: 1000+ 连接

🤝 贡献指南
我们欢迎所有形式的贡献！请阅读我们的 贡献指南 开始参与。

🍴 Fork 本项目

🌿 创建功能分支 (git checkout -b feature/AmazingFeature)

💾 提交更改 (git commit -m 'Add some AmazingFeature')

📤 推送到分支 (git push origin feature/AmazingFeature)

🔃 开启 Pull Request

📄 许可证
本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情。

🆘 支持
遇到问题？请：

📖 查看 常见问题解答

🐛 提交 Issue

💬 加入我们的 Discussions

<div align="center">
⭐ 如果这个项目对你有帮助，请给我们一个 star！ ⭐

让智能语音对话触手可及 🎤✨

</div>
