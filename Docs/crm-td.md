# Disney授权CRM小程序 — 技术设计文档

> 版本: v0.3 | 日期: 2026-04-09 | 作者: [你的名字]
> 
> v0.3 更新：新增防伪标管理、客户合作品类、合同权限控制、财务角色
> v0.2 更新：多端架构（微信小程序 + Web），分阶段备案策略，CloudBase HTTP API打通方案

---

## 1. 项目概述

为家庭公司搭建一套轻量级CRM系统，用于管理Disney授权业务的客户、项目、合同和跟进记录。系统采用**多端架构**：国内团队通过微信小程序使用，技术管理员及桌面用户通过Web端使用，两端共享同一套后端API和数据。

### 1.1 业务背景

公司持有Disney家具家居类目授权，核心业务是将授权分销给有意愿开发IP产品的制造商。三种合作模式：

| 模式 | 说明 | 典型客户 |
|------|------|----------|
| FAMA授权 | 客户获得Disney授权，自主生产销售 | 青岛迪斯兔、东莞乐领 |
| 联合开发 | 与客户共同开发产品，共享收益 | 彭设计树屋、纯信科技 |
| 代工/跨境 | 代工生产或跨境电商渠道分销 | 义乌/广州temu卖家 |

### 1.2 用户画像

- **销售人员**（5-10人）：日常使用，录入客户、更新跟进、查看分配给自己的项目
- **管理层**（1-2人）：查看全局数据、业绩看板、合同到期提醒
- **技术管理员**（1人，即你）：远程维护系统、发布更新

### 1.3 设计原则

- **移动优先，桌面兼顾**：小程序适配手机竖屏；Web端适配桌面宽屏，同时支持响应式移动访问
- **最少录入**：能选不填，能扫不打，减少员工抵触
- **后端API化**：所有业务逻辑在后端API层，前端只是"皮"，支持多端共用
- **可扩展**：数据模型和API预留未来字段，不做硬编码

---

## 2. 技术架构

### 2.1 整体架构

```
┌──────────────────────┐    ┌──────────────────────┐
│    微信小程序          │    │      Web 应用         │
│  (国内团队日常使用)     │    │  (桌面办公 / 管理后台) │
│                      │    │                      │
│  原生小程序 或 Taro    │    │  React / Next.js     │
│  WeUI / Vant Weapp   │    │  Ant Design / shadcn │
└──────────┬───────────┘    └──────────┬───────────┘
           │ wx.cloud SDK              │ HTTPS (REST)
           │                           │
┌──────────▼───────────────────────────▼───────────┐
│                  后端 API 层                       │
│                                                   │
│  Phase 1: 腾讯 CloudBase                          │
│    ┌─────────────────────────────────────────┐    │
│    │  云函数 (Node.js)                        │    │
│    │  ← 小程序通过 wx.cloud.callFunction     │    │
│    │  ← Web端通过 CloudBase HTTP API         │    │
│    ├─────────────────────────────────────────┤    │
│    │  云数据库 (JSON文档, MongoDB-like)        │    │
│    │  云存储 (合同附件、跟进记录图片)           │    │
│    └─────────────────────────────────────────┘    │
│                                                   │
│  Phase 2+: 自建后端 (备案完成后可迁移)              │
│    ┌─────────────────────────────────────────┐    │
│    │  Node.js (Express/Koa) 或 Python (FastAPI)│   │
│    │  MongoDB / PostgreSQL                    │    │
│    │  腾讯云COS (文件存储)                     │    │
│    │  部署在腾讯云轻量服务器 (已备案域名)        │    │
│    └─────────────────────────────────────────┘    │
│                                                   │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│              未来扩展层 (Phase 3+)                  │
│  - 天眼查/企查查 API (拓客)                        │
│  - AI Agent (客户评分/智能推荐)                     │
│  - 腾讯云语音API (智能呼叫)                        │
│  - 企业微信API (消息推送/到期提醒)                  │
└──────────────────────────────────────────────────┘
```

### 2.2 分阶段方案

采用"先快后迁"策略，分两步走：

**Phase 1：CloudBase 快速上线（无需域名备案）**

- 小程序端直接调用云函数（`wx.cloud.callFunction`），自带微信鉴权，零配置
- Web端通过 CloudBase HTTP API 访问同一套云函数和数据库
  - 微信官方提供了 HTTP API，可在小程序外部访问云开发资源
  - Web端需使用 CloudBase JS SDK 或直接调 REST 接口（需 access_token）
- Web端部署在 Vercel / Netlify（仅你个人使用，不需要国内访问）
- 此阶段只需完成**小程序备案**，不需要域名ICP备案

**Phase 2：自建后端 + 正式Web端（需域名备案）**

- 触发条件：(1) 域名备案完成 (2) CloudBase能力不够用 (3) 需要企业微信集成
- 将云函数逻辑迁移到独立 Node.js/Python API 服务
- 小程序改为调用自建API（配置服务器域名）
- Web端部署到已备案域名下，国内团队也可通过浏览器访问
- 数据从云数据库迁移到 MongoDB/PostgreSQL

### 2.3 备案策略

系统涉及两类备案，务必分清：

| 备案类型 | 是否必需 | 何时办理 | 谁来办 | 周期 |
|----------|----------|----------|--------|------|
| 小程序备案 | **必须** | 开发前就启动 | 父母（营业执照+法人身份证） | 1-3周 |
| 域名ICP备案 | Phase 2才需要 | Phase 1期间并行启动 | 父母（在腾讯云/阿里云提交） | 2-3周 |

**小程序备案流程**：登录微信公众平台 → 设置 → 小程序备案 → 填写企业信息 → 上传营业执照 → 平台初审(1-2工作日) → 工信部短信核验 → 管局审核(1-20工作日)。

**域名ICP备案流程**：在腾讯云购买域名 → 实名认证(2-3天) → 通过腾讯云控制台提交ICP备案 → 人脸核验 → 管局审核(约2周)。

**建议**：小程序备案和域名备案可以**同时启动**，互不影响。这样Phase 1开发完成时，两个备案大概率也都下来了。

### 2.4 多端认证方案

两端使用不同的认证机制，但映射到同一套 staff 数据：

| 端 | 认证方式 | 说明 |
|----|----------|------|
| 小程序 | 微信 openid | 自动获取，首次使用由admin绑定到staff记录 |
| Web端 (Phase 1) | CloudBase 匿名登录 + 手动关联 | 你个人使用，简化处理 |
| Web端 (Phase 2) | 手机号 + 验证码 或 账号密码 | 正式多用户方案 |

### 2.5 迁移策略

云开发的锁定风险通过以下方式缓解：

1. **Service层抽象**：云函数内部按service模块组织（customerService, projectService等），不直接在handler里写数据库操作
2. **数据模型标准化**：所有collection的字段命名遵循本文档定义，迁移时只需替换数据库驱动
3. **API接口契约**：云函数的输入输出格式与未来REST API保持一致，Web端调用代码迁移时只需改baseURL

---

## 3. 数据模型

### 3.1 集合/表定义

#### customers（客户）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 自动 | 主键 |
| company_name | string | 是 | 公司名称（如"青岛迪斯兔婴童用品有限公司"） |
| short_name | string | 否 | 简称（如"迪斯兔"），用于列表显示 |
| contact_person | string | 否 | 主要联系人姓名 |
| contact_phone | string | 否 | 联系电话 |
| contact_wechat | string | 否 | 微信号 |
| region | string | 否 | 所在地区（如"青岛"、"东莞"） |
| industry | string | 否 | 行业标签（如"婴童用品"、"家具"） |
| source | string | 否 | 客户来源（展会/转介绍/主动拓客/其他） |
| product_categories | string[] | 否 | 主营品类（自由填写，如"地毯"、"椅子"、"桌子"、"床品"） |
| status | enum | 是 | 客户状态：`active` / `inactive` / `blacklist` |
| created_by | string | 是 | 创建人staff_id |
| created_at | timestamp | 自动 | 创建时间 |
| updated_at | timestamp | 自动 | 更新时间 |

#### projects（项目）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 自动 | 主键 |
| customer_id | string | 是 | 关联客户ID |
| biz_type | enum | 是 | 合作模式：`fama` / `joint_dev` / `oem_cross_border` |
| product_category | string | 是 | 产品类目（如"儿童学习桌"、"电竞椅"） |
| stage | enum | 是 | 项目阶段（见3.2） |
| owner_id | string | 是 | 主负责人staff_id |
| co_owners | string[] | 否 | 协作负责人staff_id列表 |
| est_revenue | number | 否 | 预估销售额（万元） |
| priority | enum | 否 | 优先级：`high` / `medium` / `low` |
| notes | string | 否 | 备注 |
| created_at | timestamp | 自动 | |
| updated_at | timestamp | 自动 | |

#### contracts（合同）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 自动 | 主键 |
| project_id | string | 是 | 关联项目ID |
| customer_id | string | 是 | 关联客户ID（冗余，方便查询） |
| license_type | enum | 是 | 授权IP：`disney` / `marvel` / `starwars` / `other` |
| licensed_categories | string[] | 是 | 授权类目列表 |
| sign_date | date | 否 | 签约日期 |
| start_date | date | 否 | 授权生效日期 |
| expiry_date | date | 否 | 授权到期日期 |
| royalty_rate | number | 否 | 版税费率（%） |
| contract_value | number | 否 | 合同金额（万元） |
| file_urls | string[] | 否 | 合同附件PDF（云存储路径，支持多文件） |
| visible_to | string[] | 否 | 可查看此合同的staff_id列表（关联业务员+财务），为空时仅manager/admin可见 |
| is_active | boolean | 是 | 是否生效中 |
| remind_days | number | 否 | 到期前N天提醒，默认30 |
| created_at | timestamp | 自动 | |

#### staff（员工）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 自动 | 主键 |
| name | string | 是 | 姓名 |
| role | enum | 是 | 角色：`admin` / `manager` / `sales` / `finance` |
| phone | string | 否 | 手机号 |
| wechat_openid | string | 否 | 微信小程序openid（登录绑定） |
| is_active | boolean | 是 | 在职状态 |

#### progress_logs（跟进记录）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 自动 | 主键 |
| project_id | string | 是 | 关联项目ID |
| customer_id | string | 是 | 关联客户ID（冗余） |
| staff_id | string | 是 | 记录人 |
| content | string | 是 | 跟进内容 |
| stage_snapshot | enum | 否 | 记录时的项目阶段（便于回溯） |
| attachments | string[] | 否 | 附件（图片/文件） |
| created_at | timestamp | 自动 | |

#### label_orders（防伪标订单）

每次客户购买防伪标新增一条记录，支持按客户查询购买历史和金额统计。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 自动 | 主键 |
| customer_id | string | 是 | 关联客户ID |
| unit_price | number | 是 | 单价（元/个） |
| quantity | number | 是 | 购买数量（个） |
| total_amount | number | 自动 | 总金额（元），= unit_price × quantity |
| order_date | date | 是 | 订单日期 |
| staff_id | string | 是 | 经办人staff_id |
| notes | string | 否 | 备注 |
| created_at | timestamp | 自动 | 创建时间 |

### 3.2 项目阶段（Stage Pipeline）

```
lead → contacted → sampling → contract_signing → production → live → completed
 线索     已联系      打样中       签约中          生产中     已上线    已完结
```

每个阶段的含义：

| 阶段 | 说明 | 对应Excel中的描述 |
|------|------|------------------|
| lead | 刚发现的潜在客户，尚未正式接触 | （新增） |
| contacted | 已初步沟通，了解意向 | （新增） |
| sampling | 产品打样/设计稿开发中 | "样品跟进"、"设计稿落实中" |
| contract_signing | 合同谈判/签约流程中 | "合同处理中" |
| production | 已签约，产品生产中 | （新增） |
| live | 产品已上线销售 | "即将上线"、"上线" |
| completed | 项目结束（成功交付或终止） | （新增） |

### 3.3 索引建议

```
customers:     [company_name, status, created_by]
projects:      [customer_id, stage, owner_id, biz_type]
contracts:     [project_id, expiry_date, is_active, visible_to]
progress_logs: [project_id, created_at DESC]
label_orders:  [customer_id, order_date DESC]
```

---

## 4. API 设计

RESTful风格，云函数按资源分文件。所有接口需验证登录态（小程序openid → staff匹配）。

### 4.1 客户模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /customers | 客户列表（支持分页、搜索、状态筛选） |
| GET | /customers/:id | 客户详情（含关联项目列表） |
| POST | /customers | 新建客户 |
| PUT | /customers/:id | 更新客户 |

### 4.2 项目模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /projects | 项目列表（支持按阶段/负责人/类型筛选） |
| GET | /projects/:id | 项目详情（含跟进记录、合同） |
| POST | /projects | 新建项目 |
| PUT | /projects/:id | 更新项目（含阶段变更） |
| PUT | /projects/:id/stage | 单独更新阶段（触发日志记录） |

### 4.3 跟进记录模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /projects/:id/logs | 获取项目跟进记录（按时间倒序） |
| POST | /projects/:id/logs | 新增跟进记录 |

### 4.4 合同模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /contracts | 合同列表（支持按到期时间排序） |
| GET | /contracts/expiring | 即将到期合同（N天内） |
| POST | /contracts | 新建合同 |
| PUT | /contracts/:id | 更新合同 |

### 4.5 防伪标模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /customers/:id/labels | 获取客户防伪标购买记录（按日期倒序） |
| POST | /customers/:id/labels | 新增防伪标订单 |
| GET | /labels/stats | 防伪标销售统计（按客户/按月） |

### 4.6 统计模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /stats/pipeline | 各阶段项目数量统计 |
| GET | /stats/revenue | 销售额统计（按负责人/按月） |
| GET | /stats/staff-performance | 员工业绩看板 |

---

## 5. 小程序页面结构

```
pages/
├── index/              # 首页（看板 + 快捷入口）
├── customers/
│   ├── list            # 客户列表（搜索 + 筛选）
│   ├── detail          # 客户详情（项目列表、基本信息）
│   └── edit            # 新建/编辑客户
├── projects/
│   ├── list            # 项目列表（可按阶段看板视图/列表视图切换）
│   ├── detail          # 项目详情（阶段进度条 + 跟进记录timeline）
│   └── edit            # 新建/编辑项目
├── contracts/
│   ├── list            # 合同列表（到期排序）
│   └── edit            # 新建/编辑合同
├── logs/
│   └── add             # 快捷添加跟进记录（从首页直接进入）
└── me/
    └── index           # 个人中心（我的客户、我的业绩）
```

### 5.1 核心页面说明

#### 首页（index）

- 顶部：今日待办数量（需跟进客户、即将到期合同）
- 中部：Pipeline漏斗简图（各阶段项目数，点击可跳转筛选后的列表）
- 底部：快捷操作按钮（+新客户、+跟进记录、+新项目）

#### 项目看板（projects/list）

- 默认看板视图：按stage分列显示，卡片可左右滑动切换阶段
- 列表视图：传统列表，支持按 biz_type / owner / stage 筛选
- 每张卡片显示：客户简称、产品类目、负责人、最近一次跟进时间

#### 项目详情（projects/detail）

- 顶部：阶段进度条（可点击直接跳转阶段）
- 基本信息区：客户、类目、合作模式、负责人、预估销售额
- 跟进记录Timeline：按时间倒序，每条记录显示时间、记录人、内容
- 底部悬浮按钮：+添加跟进记录

---

## 6. 权限模型

简单的四级权限，不做复杂RBAC，优先保证数据不泄露：

| 角色 | 可见范围 | 操作权限 |
|------|----------|----------|
| sales | 仅自己负责的客户和项目 | 新建客户/项目、添加跟进记录 |
| finance | 全部客户（只读）+ 被授权的合同 | 查看合同详情和金额、查看防伪标订单 |
| manager | 全部客户和项目 | 全部操作 + 查看统计 |
| admin | 全部 | 全部操作 + 员工管理 |

### 6.1 合同可见性规则

合同是敏感数据，采用白名单机制：

1. `manager` / `admin` 角色：可查看所有合同
2. `finance` 角色：可查看所有合同（只读，不可编辑）
3. `sales` 角色：仅可查看 `visible_to` 字段包含自己 staff_id 的合同
4. 合同创建时，系统自动将关联项目的 `owner_id` 和 `co_owners` 加入 `visible_to`

### 6.2 登录方式

小程序启动时自动获取微信openid，首次使用时由admin绑定到staff记录。

---

## 7. 初始数据迁移

将现有Excel数据清洗后导入系统。清洗规则：

1. **客户名称标准化**：
   - "赣州罗总" → company_name: "赣州罗总公司"（待补全）, contact_person: "罗总"
   - "胡总电竞椅" → company_name: "待补全", contact_person: "胡总", product_category: "电竞桌椅"

2. **负责人标准化**：
   - "张宇航，王新华" / "张宇航 王新华" → owner_id: 王新华, co_owners: [张宇航]
   - "刘勇，" → owner_id: 刘勇（去除尾部逗号）

3. **阶段映射**：
   - "即将上线" → `live`
   - "上线" → `live`
   - "样品跟进" → `sampling`
   - "设计稿落实中" → `sampling`
   - "合同处理中" → `contract_signing`
   - "小批量" → `production`
   - "还需要开发新的" → `sampling`
   - 空值 → `contacted`（默认）

4. **biz_type映射**：
   - Sheet "fama客户" → `fama`
   - Sheet "联合开发" → `joint_dev`
   - Sheet "代工 跨境" → `oem_cross_border`

---

## 8. 开发计划

### Phase 1 — MVP（目标：2-3周）

核心：让国内团队能用小程序替代Excel，同时你能通过Web管理数据

**前置任务（并行启动，不阻塞开发）**：
- [ ] 父母用营业执照注册微信小程序账号（企业主体）
- [ ] 提交小程序备案
- [ ] 购买域名 + 提交ICP备案（为Phase 2做准备）
- [ ] 把你的微信号添加为小程序开发者

**后端（CloudBase云函数）**：
- [ ] 云开发环境初始化
- [ ] Staff模块（员工注册、openid绑定）
- [ ] Customer CRUD（增删改查 + 列表搜索）
- [ ] Project CRUD + 阶段管理
- [ ] ProgressLog 添加 + Timeline查询
- [ ] 基础权限控制（role-based）
- [ ] Excel数据迁移脚本

**小程序前端**：
- [ ] 项目初始化（原生小程序 或 Taro）
- [ ] 登录流程（openid自动获取 → staff绑定）
- [ ] 客户列表 + 详情 + 编辑页
- [ ] 项目列表 + 详情 + 编辑页
- [ ] 跟进记录添加 + Timeline展示

**Web前端（简易版，仅你个人使用）**：
- [ ] React项目初始化（Next.js 或 Vite + React）
- [ ] 通过CloudBase HTTP API / JS SDK连接后端
- [ ] 客户/项目列表 + CRUD页面
- [ ] 部署到Vercel（你在美国访问）

### Phase 2 — 完善 + 多端正式化（目标：Phase 1后2-4周）

- [ ] Contract模块 + 到期提醒（小程序订阅消息）
- [ ] 首页看板（Pipeline统计图表）
- [ ] 项目看板视图（拖拽切换阶段）
- [ ] 员工业绩统计
- [ ] 数据导出（Excel格式，方便过渡期并行使用）
- [ ] （若ICP备案完成）后端迁移到自建API服务器
- [ ] （若ICP备案完成）Web端部署到已备案域名，国内团队可选用

### Phase 3 — AI智能化（远期）

#### 3a. 合同/文档智能识别（优先）

上传合同PDF或拍照 → AI自动提取关键字段 → 预填表单 → 人工确认后入库。

- 调用大模型多模态API（Claude/GPT-4），输入合同图片或PDF
- Prompt指定提取字段：签约日期、到期日期、授权品类、版税费率、合同金额等
- 返回结构化JSON，前端预填到合同表单
- **必须保留人工确认环节** — 合同数据敏感，AI识别可能有误

```
用户上传合同PDF
    ↓
后端调用大模型API，提取合同关键信息
    ↓
返回 { sign_date, expiry_date, royalty_rate, contract_value, ... }
    ↓
前端预填表单 → 用户核对 → 确认保存
```

#### 3b. 数据分析Agent

用自然语言提问 → AI Agent调用CRM API查询数据 → 返回分析结果。

- 基于大模型Tool Use能力，定义可用工具集（对应现有API端点）：
  - `getCustomers` — 查询客户
  - `getProjects` — 查询项目（按阶段/负责人/类型）
  - `getContracts` / `getExpiringContracts` — 查询合同
  - `getCustomerLabelOrders` — 查询防伪标订单
  - `getPipelineStats` — Pipeline统计
- 支持的问答示例：
  - "上个季度防伪标销售最多的三个客户是谁？"
  - "哪些合同在未来60天内到期？"
  - "目前处于打样阶段的项目有哪些，负责人分别是谁？"
  - "本月新增了多少客户？"

#### 3c. 主动智能提醒

定时任务自动分析数据，生成提醒推送给相关人员：

- 合同到期预警（30天/7天）
- 项目跟进超期提醒（超过N天无跟进记录）
- 周报自动生成（本周新增客户、阶段变更、防伪标销售汇总）

#### 3d. 其他智能化

- 企业微信集成（消息推送、到期提醒）
- 天眼查/企查查API对接（拓客辅助）
- AI客户评分（基于跟进频率、合同金额、合作历史等维度）
- 自动化工作流：平台搜索 → 企业查询 → 初步接触 → 人工转化

#### AI集成技术要求

现有架构已具备AI集成基础：

| 已有基础 | 对AI的价值 |
|---|---|
| API抽象层（api/*.ts） | Agent工具直接对应现有API端点 |
| 标准化数据模型 | 结构化数据便于模型理解和查询 |
| 合同file_urls字段 | PDF上传后直接传给模型做OCR/识别 |

新增组件：
- AI服务层（后端，调用Claude/OpenAI API，管理prompt和tool定义）
- 对话界面（Web端或小程序内嵌）
- Agent工具集定义（映射到CRM API端点）

---

## 9. 待确认事项

在开发前需要和父母确认：

1. [ ] 用公司营业执照注册微信小程序账号（企业主体）
2. [ ] 提交小程序备案（营业执照 + 法人身份证 + 法人手机号）
3. [ ] 购买域名并提交ICP备案（可与小程序备案同步进行）
4. [ ] 把你的微信号添加为小程序开发者
5. [ ] 确认员工名单（至少需要：姓名、手机号），用于初始化staff表
6. [ ] 确认Excel中模糊客户名称的真实公司名（如"赣州罗总"、"胡总电竞椅"）
7. [ ] 确认是否有现有合同需要录入（签约日期、到期日期）

---

## 附录 A: 项目结构参考

```
project-root/
│
├── miniprogram/                # 微信小程序前端
│   ├── app.js
│   ├── app.json
│   ├── pages/                  # 页面文件
│   ├── components/             # 公共组件
│   ├── utils/
│   │   ├── api.js              # 云函数调用封装
│   │   ├── auth.js             # 登录态管理
│   │   └── constants.js        # 枚举常量（与web端共享定义）
│   └── styles/
│       └── theme.wxss          # 全局样式变量
│
├── web/                        # Web前端
│   ├── src/
│   │   ├── app/                # Next.js pages 或 React routes
│   │   ├── components/         # UI组件
│   │   ├── lib/
│   │   │   ├── api.ts          # API调用封装（CloudBase HTTP → 自建API可一键切换）
│   │   │   ├── auth.ts         # Web端认证
│   │   │   └── constants.ts    # 枚举常量（与小程序保持同步）
│   │   └── styles/
│   ├── package.json
│   └── next.config.js          # 或 vite.config.ts
│
├── cloudfunctions/             # CloudBase 云函数（Phase 1后端）
│   ├── customer/
│   │   └── index.js
│   ├── project/
│   │   └── index.js
│   ├── contract/
│   │   └── index.js
│   ├── progress-log/
│   │   └── index.js
│   ├── stats/
│   │   └── index.js
│   └── _shared/                # 共享逻辑（service层）
│       ├── services/
│       │   ├── customerService.js
│       │   ├── projectService.js
│       │   └── contractService.js
│       ├── db.js               # 数据库连接 + 公共查询
│       ├── auth.js             # 权限校验中间件
│       └── validators.js       # 参数校验
│
├── server/                     # 自建后端（Phase 2，复用 _shared/services）
│   ├── routes/
│   ├── middleware/
│   ├── package.json
│   └── index.js
│
├── shared/                     # 跨端共享（类型定义、枚举、工具函数）
│   ├── types.ts                # TypeScript类型定义
│   ├── constants.ts            # stage pipeline、biz_type等枚举
│   └── validators.ts           # 参数校验规则
│
└── scripts/
    └── migrate-excel.js        # Excel数据迁移脚本
```

## 附录 B: 关键技术决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 小程序框架 | 原生小程序 或 Taro | 原生最轻、兼容性最好；Taro适合未来多端（H5/企微） |
| Web框架 | Next.js 或 Vite + React | Next.js全栈能力强；Vite+React更轻量，Phase 1够用 |
| Web UI库 | Ant Design 或 shadcn/ui | Ant Design中文生态好；shadcn更现代轻量 |
| 小程序UI库 | WeUI / Vant Weapp | 微信官方设计语言，用户无学习成本 |
| Phase 1 后端 | 腾讯 CloudBase | 零运维、免域名备案、HTTP API支持Web端访问 |
| Phase 2 后端 | Node.js (Express) + MongoDB | 与云开发数据模型兼容，迁移成本最低 |
| 数据库 | 云数据库 → MongoDB | JSON文档型，schema灵活，云开发到自建无缝迁移 |
| 文件存储 | 云开发云存储 → 腾讯云COS | 合同附件、跟进记录图片 |
| Web端部署(Phase 1) | Vercel | 仅你个人使用，海外访问速度快，免费额度够 |
| Web端部署(Phase 2) | 腾讯云 / 同后端服务器 | 国内访问需要已备案域名 |
