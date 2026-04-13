# Disney授权CRM系统 (CRM-WXLR)

## 项目概述

为家庭公司搭建的Disney授权业务CRM系统，管理客户、项目、合同和跟进记录。

## 技术栈

- **Web前端**: Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui风格组件
- **路由**: React Router v6
- **未来后端**: 腾讯CloudBase (Phase 1) → 自建Node.js/Python API (Phase 2)

## 项目结构

```
CRM-WXLR/
├── CLAUDE.md                 # 本文件
├── cloudbaserc.json          # CloudBase CLI配置
├── cloud/                    # CloudBase云函数
│   └── functions/api/        # 单函数路由分发（6张表CRUD）
│       ├── index.js
│       └── package.json
├── Docs/
│   ├── crm-td.md             # 技术设计文档（数据模型、API设计、页面结构、阶段定义）
│   ├── project-status.md     # 项目状态跟踪
│   └── 迪士尼合作客户进度表(4).xlsx  # 原始客户数据Excel
└── web/                      # Web前端（Vite + React）
    ├── .env                  # VITE_API_MODE=rest|mock（gitignored）
    └── src/
        ├── types/index.ts    # 数据模型 & 枚举常量
        ├── mock/data.ts      # 从Excel清洗的mock数据（开发回退用）
        ├── api/              # API抽象层（mock↔REST双模式）
        │   ├── client.ts     # HTTP客户端，VITE_API_MODE环境变量控制模式
        │   ├── customers.ts
        │   ├── projects.ts
        │   ├── progress-logs.ts
        │   ├── contracts.ts
        │   ├── label-orders.ts
        │   └── staff.ts
        ├── context/
        │   └── auth.tsx      # 权限上下文（AuthProvider + useAuth hook）
        ├── components/
        │   ├── Layout.tsx    # 侧边栏导航 + 响应式移动端抽屉
        │   └── ui/           # shadcn风格基础组件
        ├── pages/            # 页面组件
        │   ├── Dashboard.tsx       # 首页看板
        │   ├── CustomerList.tsx    # 客户列表（搜索+筛选）
        │   ├── CustomerDetail.tsx  # 客户详情
        │   ├── CustomerForm.tsx    # 新建/编辑客户
        │   ├── ProjectList.tsx     # 项目列表（看板/列表双视图）
        │   ├── ProjectDetail.tsx   # 项目详情（Pipeline + Timeline）
        │   ├── ProjectForm.tsx     # 新建/编辑项目
        │   └── ContractList.tsx    # 合同列表
        └── lib/
            ├── utils.ts      # 工具函数（cn, 日期格式化）
            └── permission.ts # 权限判断函数（canViewContract）
```

## 开发命令

```bash
cd web
npm install          # 安装依赖
npm run dev          # 启动开发服务器（如端口被占用，用 npx vite --port 8888）
npm run build        # 生产构建
npm run lint         # ESLint检查
```

## 关键设计决策

- **API抽象层**: 所有数据操作通过 `api/*.ts`，`web/.env` 中 `VITE_API_MODE=rest` 连接CloudBase，`=mock` 使用本地mock数据
- **CloudBase后端**: 单云函数 `api` 路由分发，覆盖6张表CRUD，HTTP访问地址 `https://my-test-env-0gif1eyrbc6d63e1.service.tcloudbase.com/api`
- **Mock数据**: 从Excel按TD第7节规则清洗（客户名标准化、负责人拆分、阶段映射）
- **项目阶段Pipeline**: lead → contacted → sampling → contract_signing → production → live → completed
- **三种合作模式**: fama（FAMA授权）、joint_dev（联合开发）、oem_cross_border（代工/跨境）
- **UI组件**: 手写shadcn风格组件（Button, Card, Badge, Input, Select, Dialog, Textarea），未用shadcn CLI

## 数据模型

详见 `Docs/crm-td.md` 第3节，5张核心表:
- `customers` — 客户
- `projects` — 项目（关联客户，含stage pipeline）
- `contracts` — 合同（关联项目+客户）
- `staff` — 员工
- `progress_logs` — 跟进记录（关联项目+客户）

## 注意事项

- Windows开发环境，Vite监听端口可能受Hyper-V保留端口影响，用 `--port 8888` 等非保留端口
- 数据模型中 `（待补全）` 标记的客户名需与业务方确认真实公司名
- 暗色模式已通过CSS `prefers-color-scheme` 支持
