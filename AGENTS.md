# AGENTS.md

## 项目概览

班会破冰互动网页应用 - 多人实时共享数据的兴趣标签互动平台。

### 核心功能
- 昵称注册（支持 emoji）
- 五大兴趣板块：音乐🎵、游戏🎮、动漫📺、影视🎬、运动⚽，外加「其他」板块（用于闲聊如五排开黑等）
- 标签 +1 投票（每人每标签限一次，可取消）
- 热门排行
- 标签详情（查看添加者和投票者）
- 标签防重复（大小写、全角半角、中英文标点归一化）
- 标签详情弹窗内 emoji 互动墙
- 数据每 5 秒自动刷新

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: Tailwind CSS 4 + 自定义 CSS
- **Database**: Supabase (PostgreSQL)
- **包管理**: pnpm

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── users/route.ts        # POST - 创建用户
│   │   ├── tags/route.ts         # GET - 查询标签, POST - 创建标签
│   │   ├── tags/[id]/route.ts    # GET - 标签详情
│   │   ├── votes/route.ts        # POST - 切换投票
│   │   └── emoji-reactions/route.ts  # GET - 查询emoji, POST - 发送emoji
│   ├── layout.tsx
│   ├── page.tsx                  # 主入口（昵称判断）
│   └── globals.css               # 全局样式 + 自定义动画
├── components/
│   ├── NicknameEntry.tsx         # 昵称输入页
│   ├── MainBoard.tsx             # 主界面（板块网格）
│   ├── BoardSection.tsx          # 单个板块（标签列表+添加）
│   ├── TagPill.tsx               # 标签药丸组件
│   ├── TagDetailModal.tsx        # 标签详情弹窗
│   └── HotRanking.tsx            # 热门排行弹窗
├── lib/
│   ├── utils.ts                  # 通用工具
│   └── tag-normalize.ts          # 标签名归一化
└── storage/database/
    ├── supabase-client.ts        # Supabase 客户端
    └── shared/schema.ts          # 数据库表定义
```

## 数据库表

- `users` - 用户表（id, nickname, created_at）
- `tags` - 标签表（id, board, name, normalized_name, created_by, created_at）
- `tag_votes` - 投票表（id, tag_id, user_id, created_at），唯一约束 (tag_id, user_id)
- `emoji_reactions` - emoji互动表（id, tag_id, user_id, emoji, created_at）

## 开发命令

- 安装依赖：`pnpm install`
- 开发：`pnpm dev`
- 构建：`pnpm build`
- 类型检查：`pnpm ts-check`
- Lint：`pnpm lint`

## 关键实现细节

- 用户标识：localStorage 存储 user_id 和 nickname
- 数据刷新：前端每 5 秒轮询 + 操作后立即刷新
- 标签归一化：全角→半角、CJK标点→ASCII、小写、空格合并
- 防重复：唯一索引 (board, normalized_name)
- 投票匿名（后端强约束）：GET /api/tags 与 /api/tags/[id] 必须带 user_id。完全匿名规则：仅当该用户「已加入」该标签（本人为发起人，或已 +1 投票）时才返回发起人 creator_name；仅当该用户已 +1 投票时才返回 voter_names/voters；未加入用户一律只返回 vote_count（禁止下发任何发起人/投票者的 ID或昵称）
- 详情弹窗内可发送 emoji 互动，emoji 互动墙昵称公开
