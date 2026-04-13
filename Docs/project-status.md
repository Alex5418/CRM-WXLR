# Disney授权CRM — 项目状态跟踪

> 最后更新: 2026-04-12 (CloudBase后端接入完成)

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
- [x] 项目详情 (只读Stage Pipeline + 跟进Timeline + 合同信息)
- [x] 合同列表 (按到期排序 + 即将到期预警)
- [x] 响应式布局 (桌面侧边栏 + 移动端抽屉菜单)
- [x] 暗色模式支持
- [x] 防伪标管理 (LabelOrder数据模型 + API + 客户详情页购买记录展示/新增)
- [x] 客户合作品类 (Customer新增product_categories字段 + 详情展示 + 表单编辑)
- [x] 新增 `finance`（财务）角色
- [x] 前端权限框架 (AuthContext + AuthProvider + useAuth hook，mock登录态)

### 进行中

- [x] 权限判断工具函数 + 合同权限控制（canViewContract + ContractList过滤）
- [ ] 与业务方确认模糊客户名（"赣州罗总"、"胡总电竞椅"等的真实公司名）
- [ ] 与父母确认员工名单（姓名、手机号）

### Phase 1 待办 — 后端 & 小程序

- [ ] 父母注册微信小程序账号（企业主体）+ 提交小程序备案
- [ ] 购买域名 + 提交ICP备案
- [x] CloudBase云开发环境初始化（环境ID: my-test-env-0gif1eyrbc6d63e1，上海区）
- [x] 云函数开发 (Staff / Customer / Project / ProgressLog / Contract / LabelOrder CRUD)
- [x] 云接入HTTP服务配置（API地址: https://my-test-env-0gif1eyrbc6d63e1.service.tcloudbase.com/api）
- [x] Mock数据迁移到CloudBase数据库（30客户、30项目、15跟进、4合同、6防伪标、4员工）
- [x] Web端对接CloudBase HTTP API（替换mock，支持mock/rest双模式切换）
- [x] Excel导出功能（客户/合同/防伪标导出）
- [ ] 基础权限控制 (admin / manager / sales / finance)
- [ ] 微信小程序前端开发
- [ ] 部署Web端到Vercel/CloudBase静态托管

### Phase 2 待办 — 完善 & 多端正式化

**v0.3 新增需求（2026-04-09）**：
- [x] 防伪标管理：客户维度的购买记录（单价、数量、金额、历史查询）
- [x] 客户合作品类：客户页面展示主营类目（自由填写）
- [x] 合同权限控制：合同仅对关联业务员+财务+管理层可见
- [ ] 合同PDF上传：支持上传合同PDF附件到云存储
- [x] 新增 `finance`（财务）角色

**原有待办**：
- [ ] Contract模块完善 + 到期提醒（小程序订阅消息）
- [ ] 项目看板拖拽切换阶段
- [ ] 员工业绩统计看板
- [ ] 数据导出（Excel格式）
- [ ] 后端迁移到自建API服务器（若ICP备案完成）
- [ ] Web端部署到已备案域名

### Phase 3 待办 — AI智能化

**3a. 合同智能识别（优先）**：
- [ ] 后端AI服务层搭建（调用Claude/OpenAI API）
- [ ] 合同PDF上传 → AI提取关键字段 → 预填表单 → 人工确认入库

**3b. 数据分析Agent**：
- [ ] 定义Agent工具集（映射CRM API端点）
- [ ] 自然语言问答界面（Web端/小程序）
- [ ] 支持数据查询、统计分析、生成报表

**3c. 主动智能提醒**：
- [ ] 合同到期预警推送
- [ ] 项目跟进超期提醒
- [ ] 周报自动生成

**3d. 其他**：
- [ ] 企业微信集成（消息推送）
- [ ] 天眼查/企查查API对接
- [ ] AI客户评分（跟进频率、合同金额、合作历史）

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
