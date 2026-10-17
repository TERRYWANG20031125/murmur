# 喃喃 (Murmur) 全栈开发与 Supabase 数据库集成指南

本项目已完成从纯前端到**前后端一体化全栈应用**的升级，数据存储全面支持 **Supabase (PostgreSQL)** 云数据库，并配备智能离线/双向缓存降级机制与 Gemini 温暖共情回音大模型。

---

## 目录
1. [系统整体架构](#一系统整体架构)
2. [Supabase 数据库配置三步法](#二supabase-数据库配置三步法)
3. [环境变量说明 (.env)](#三环境变量说明-env)
4. [本地启动与运行](#四本地启动与运行)
5. [后端 RESTful API 接口文档](#五后端-restful-api-接口文档)
6. [双向降级与高可用设计](#六双向降级与高可用设计)

---

## 一、系统整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                       前端 (React 19 + Vite)                │
│  - TimelineScreen (心绪流淌)   - EchoesScreen (回音纸飞机)    │
│  - GalaxyScreen (心绪星系)     - ComposeScreen (轻语创作)    │
│  - SanctuaryScreen (自留地/树洞/时间盲盒)                    │
│  - DatabaseStatusModal (可视化 Supabase 状态与探针)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP /api/* 请求 (Vite 代理)
┌──────────────────────────────▼──────────────────────────────┐
│                    后端服务 (Express + TSX)                 │
│  - routes/timeline.ts        - routes/echoes.ts             │
│  - routes/capsules.ts        - routes/draft.ts              │
│  - routes/echoResonance.ts (Gemini AI 共情)                 │
│  - routes/health.ts (数据库连通性诊断)                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ @supabase/supabase-js
┌──────────────────────────────▼──────────────────────────────┐
│                  Supabase (云端 PostgreSQL)                 │
│  - timeline_items (心绪流淌日签表)                          │
│  - echo_items (回音之海纸飞机表)                            │
│  - time_capsules (封存时间盲盒表)                           │
│  - user_drafts (心盒草稿表)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、Supabase 数据库配置三步法

### 第 1 步：注册并创建 Supabase 项目
1. 打开 [https://supabase.com](https://supabase.com) 并登录/注册账号。
2. 点击 **“New Project”**，输入项目名称（如 `murmur-db`），设置数据库密码并选择就近区域（如 Tokyo 或 Singapore）。

### 第 2 步：一键初始化数据表与安全策略
1. 进入 Supabase 项目控制台，在左侧导航栏点击 **“SQL Editor”**。
2. 点击 **“New query”**。
3. 打开本项目中的 [`supabase/schema.sql`](./supabase/schema.sql) 文件，复制全部 SQL 脚本并粘贴到 SQL Editor 中。
4. 点击右下角 **“Run”**（或快捷键 `Ctrl + Enter`）。
   > 该脚本会自动创建：
   > - `timeline_items`、`echo_items`、`time_capsules`、`user_drafts` 4 张数据表；
   > - 性能优化索引；
   > - Row Level Security (RLS) 安全读写策略；
   > - 自动填入精美的初始演示心绪和回音数据。

### 第 3 步：复制 API 密钥至本地 `.env`
1. 在 Supabase 控制台左侧点击 **“Project Settings”**（齿轮图标） -> **“API”**。
2. 找到以下两项信息：
   - **Project URL**（格式如 `https://xxxxxxxxxxxx.supabase.co`）
   - **Project API keys** 中的 **`anon` `public`** 密钥
3. 打开项目根目录下的 `.env` 文件，填入对应项：
   ```env
   SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
   SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

---

## 三、环境变量说明 (.env)

项目根目录的 `.env` 完整配置如下：

```env
# 服务端运行端口（前后端联通时前端通过代理访问此端口）
PORT=3001

# Supabase 云数据库配置
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# 可选：管理端专属密钥（若填写则优先用于免鉴权服务端操作）
SUPABASE_SERVICE_ROLE_KEY=""

# 可选：Google Gemini API Key
# 用于回音海纸飞机由 AI 旅人撰写极具诗意与共情的定制回音；
# 留空时系统会自动降级至高水准治愈文案库。
GEMINI_API_KEY=""

# 前端应用访问地址
APP_URL="http://localhost:3000"
```

---

## 四、本地启动与运行

在命令行中执行以下命令：

### 1. 安装项目依赖
```bash
npm install
```

### 2. 方式 A：一键全栈开发模式（推荐）
在两个终端窗口中分别启动后端和前端：

- **终端 1 启动后端服务**：
  ```bash
  npm run server
  ```
  > 服务启动后监听在 `http://localhost:3001`，并自动检测 Supabase 连通状态。

- **终端 2 启动前端应用**：
  ```bash
  npm run dev
  ```
  > 前端启动在 `http://localhost:3000`，Vite 自动将 `/api/*` 请求透明代理至后端 `3001` 端口。

### 3. 方式 B：前后端一体化生产模式
```bash
npm run build
npm start
```
> 一键打包前端静态资源并由 Express 服务统一托管在 `http://localhost:3001`，真正实现单一进程前后端一体化运行！

---

## 五、后端 RESTful API 接口文档

| 模块 | 方法 | 路径 | 功能说明 |
| :--- | :--- | :--- | :--- |
| **系统** | `GET` | `/api/health` | 诊断后端与 Supabase 数据库连接状态、AI 状态、数据条数统计 |
| **心绪流淌** | `GET` | `/api/timeline` | 获取心绪列表（支持 `?visibility=public|private` 筛选） |
| | `POST` | `/api/timeline` | 发布新心绪 |
| | `PUT` | `/api/timeline/:id` | 更新心绪（互动点亮微光、披上毛毯等） |
| | `DELETE` | `/api/timeline/:id` | 删除心绪 |
| | `POST` | `/api/timeline/reset`| 重置为默认初始数据 |
| **回音之海** | `GET` | `/api/echoes` | 获取回音列表（支持 `?category=hug|light|daily|night` 筛选） |
| | `POST` | `/api/echoes` | 放飞载有心事的纸飞机 |
| | `PUT` | `/api/echoes/:id` | 更新互动点赞与抚慰数 |
| | `POST` | `/api/echoes/:id/notes` | 递送远方旅人温暖小纸条 |
| | `DELETE` | `/api/echoes/:id` | 删除回音 |
| | `POST` | `/api/echoes/reset`| 重置为默认回音数据 |
| **时间盲盒** | `GET` | `/api/capsules` | 获取封存的时间盲盒列表 |
| | `POST` | `/api/capsules` | 封存一封写给未来的信 |
| | `PATCH` | `/api/capsules/:id/unseal` | 拆开/解封时间盲盒 |
| | `DELETE` | `/api/capsules/:id` | 删除时间盲盒 |
| **心盒草稿** | `GET` | `/api/draft` | 读取暂存在心盒中的草稿 |
| | `POST` | `/api/draft` | 存入草稿到心盒 |
| | `DELETE` | `/api/draft` | 清空草稿 |
| **AI 共鸣** | `POST` | `/api/echo-resonance` | 呼唤远方旅人生成充满诗意与共鸣的暖心回音 |

---

## 六、双向降级与高可用设计

为了确保应用在任何网络环境下均能完美运行：
1. **未配置 Supabase 时的自愈降级**：
   若开发者尚未申请 Supabase 凭证，后端将自动转为内存降级存储，前端同时保留 LocalStorage 本地镜像，写操作即刻生效，应用绝不报错瘫痪。
2. **可视化状态指示器**：
   在应用底部的 **“自留地 (Sanctuary)”** 界面中，设置了实时的 `Supabase 存储状态` 徽章。点击可打开弹窗实时探针检测数据库连通性、查看数据表统计，并获取配置指引。
3. **配置完成后无缝接入**：
   只需在 `.env` 中填入 Supabase URL 和 Key 并重启后端，系统即自动连接云端 PostgreSQL 数据库，并持久化保存每一次心绪与回音。
