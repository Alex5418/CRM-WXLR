# Disney授权CRM — 项目状态跟踪

> 最后更新: 2026-04-07

## 当前阶段: Phase 1 — MVP (Web Prototype)

### 已完成

- [x] 技术设计文档 (crm-td.md v0.2)
- [x] Web前端项目搭建 (Vite + React + TypeScript + Tailwind CSS v4)
- [x] 数据模型定义 (types/index.ts — 5张表 + 全部枚举)
- [x] Excel数据清洗 → mock数据 (30客户、30项目、15跟进记录、4合同)
- [x] API抽象层 (api/*.ts — mock模式，可切换REST)
- [x] 首页看板 (统计卡片 + Pipeline柱状图 + 最近跟进)
- [x] 客户模块 (列表搜索筛选 + 详情 + 新建/编辑表单)
- [x] 项目模块 (看板视图 + 列表视图 + 阶段/类型/负责人筛选)
- [x] 项目详情 (可点击Stage Pipeline + 跟进Timeline + 合同信息)
- [x] 合同列表 (按到期排序 + 即将到期预警)
- [x] 响应式布局 (桌面侧边栏 + 移动端抽屉菜单)
- [x] 暗色模式支持

### 进行中

- [ ] 与业务方确认模糊客户名（"赣州罗总"、"胡总电竞椅"等的真实公司名）
- [ ] 与父母确认员工名单（姓名、手机号）

### Phase 1 待办 — 后端 & 小程序

- [ ] 父母注册微信小程序账号（企业主体）+ 提交小程序备案
- [ ] 购买域名 + 提交ICP备案
- [ ] CloudBase云开发环境初始化
- [ ] 云函数开发 (Staff / Customer / Project / ProgressLog CRUD)
- [ ] 基础权限控制 (admin / manager / sales)
- [ ] Excel数据迁移脚本
- [ ] 微信小程序前端开发
- [ ] Web端对接CloudBase HTTP API（替换mock）
- [ ] 部署Web端到Vercel

### Phase 2 待办 — 完善 & 多端正式化

- [ ] Contract模块完善 + 到期提醒（小程序订阅消息）
- [ ] 项目看板拖拽切换阶段
- [ ] 员工业绩统计看板
- [ ] 数据导出（Excel格式）
- [ ] 后端迁移到自建API服务器（若ICP备案完成）
- [ ] Web端部署到已备案域名

### Phase 3 待办 — 智能化

- [ ] 企业微信集成（消息推送）
- [ ] 天眼查/企查查API对接
- [ ] AI Agent集成（客户评分、跟进建议）

---

## 技术债务

| 项目 | 优先级 | 说明 |
|------|--------|------|
| 表单校验 | 中 | 目前仅有HTML required，需加业务规则校验 |
| 错误处理 | 中 | API层缺少统一错误处理和用户提示 |
| 加载状态 | 低 | 页面数据加载时无skeleton/spinner |
| 单元测试 | 低 | 目前无测试覆盖 |

## 关键决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-04-07 | Web前端选用 Vite + React（非Next.js） | Phase 1仅需静态SPA，无需SSR，更轻量 |
| 2026-04-07 | 手写shadcn风格组件（非shadcn CLI） | 避免CLI兼容性问题，保持对组件的完全控制 |
| 2026-04-07 | 原生`<select>`替代Radix Select | 原生select在表单中更稳定，避免下拉菜单样式问题 |
| 2026-04-07 | Tailwind CSS v4（@theme语法） | 最新版，直接import无需postcss配置 |
