智能体对话系统 (Agent Dialogue System)
一个基于现代Web技术栈构建的智能体对话平台后端系统，提供完整的角色扮演对话体验，支持文字与语音双模式交互。
项目概述
本项目是一个高性能、可扩展的智能体对话系统后端，采用微服务架构设计，集成了人工智能对话、语音识别与合成、用户管理等功能。系统支持多角色智能体在多样化场景中进行沉浸式对话，为用户提供高质量的交互体验。
核心特性
🤖 智能体管理
​​角色系统​​: 内置多种预设角色（魔法师、战士、学生等），支持自定义角色创建
​​属性配置​​: 支持设置角色性格、背景故事、语音类型、情感倾向等详细属性
​​收藏与分享​​: 用户可收藏喜欢的角色，支持公开角色广场功能
🎭 场景沉浸
​​多场景支持​​: 提供魔法城堡、现代咖啡厅、未来太空站等多样化对话场景
​​场景定制​​: 支持用户自定义场景背景和场景提示词
​​动态切换​​: 对话过程中可随时切换场景，改变对话氛围
💬 双模式交互
​​文字对话​​: 基于DeepSeek AI模型的智能文本对话
​​语音交互​​: 集成语音识别（ASR）和语音合成（TTS）功能
​​实时音频​​: WebSocket支持实时音频流传输与处理
👥 用户系统
​​安全认证​​: JWT令牌认证机制，bcrypt密码加密
​​个性化​​: 用户头像、收藏列表、对话历史管理
​​多设备支持​​: Token机制支持多设备同时登录
技术架构
后端框架
​​Runtime​​: Node.js
​​Web框架​​: Express.js
​​实时通信​​: WebSocket (ws库)
​​数据库​​: MySQL 8.0
云服务集成
​​对象存储​​: 阿里云OSS（音频、图片资源存储）
​​语音服务​​: 七牛云语音识别与合成API
​​AI能力​​: DeepSeek大型语言模型API
数据持久化
├── 用户管理 (users)
├── 角色管理 (characters)
├── 场景管理 (scenes)
├── 收藏关系 (user_favorites)
├── 会话管理 (chat_sessions)
├── 消息记录 (chat_messages)
└── 令牌管理 (user_tokens)
系统特性
高性能设计
连接池管理数据库连接
异步非阻塞I/O处理
内存缓存优化
文件流式处理
安全可靠
SQL注入防护（参数化查询）
XSS攻击防护
音频文件格式验证
令牌黑名单机制
可扩展性
模块化架构设计
清晰的API接口规范
易于集成第三方服务
支持水平扩展
快速开始
环境要求
Node.js 16+
MySQL 8.0+
阿里云OSS账户
七牛云API密钥
DeepSeek API密钥
安装部署
​​克隆项目​​
git clone <repository-url>
cd agent-dialogue-system
​​安装依赖​​
npm install
​​环境配置​​
cp .env.example .env
# 配置数据库和API密钥
​​数据库初始化​​
npm run init-db
​​启动服务​​
# 开发模式
npm run dev

# 生产模式
npm start
API文档
系统提供RESTful API接口，主要端点包括：
POST /api/user/register- 用户注册
POST /api/user/login- 用户登录
GET /api/characters/public- 获取公共角色
POST /api/chat/sessions- 创建对话会话
WebSocket /ws- 实时对话接口
详细的API文档请参考项目Wiki页面。
应用场景
本系统适用于多种应用场景：
​​虚拟陪伴应用​​: 提供情感陪伴和日常对话
​​教育训练​​: 语言学习、面试模拟、技能训练
​​娱乐游戏​​: 游戏NPC对话系统、剧情互动
​​智能客服​​: 拟人化客服对话体验
​​社交应用​​: 虚拟角色社交平台
贡献指南
我们欢迎贡献者参与项目开发，请阅读以下指南：
Fork本项目
创建特性分支 (git checkout -b feature/AmazingFeature)
提交更改 (git commit -m 'Add some AmazingFeature')
推送到分支 (git push origin feature/AmazingFeature)
开启Pull Request
许可证
本项目采用MIT许可证，详见LICENSE文件。
支持
如有问题或建议，请通过以下方式联系：
提交GitHub Issue
发送邮件至项目维护团队
在项目讨论区留言
致谢
感谢以下开源项目和技术服务：
Express.js社区
MySQL团队
七牛云语音服务
DeepSeek AI模型
阿里云OSS服务
