import type { Customer, Project, Staff, ProgressLog, Contract, LabelOrder } from '@/types'

// ===== Staff =====
export const mockStaff: Staff[] = [
  { _id: 's1', name: '王新华', role: 'manager', phone: '13800000001', is_active: true },
  { _id: 's2', name: '张宇航', role: 'sales', phone: '13800000002', is_active: true },
  { _id: 's3', name: '刘勇', role: 'sales', phone: '13800000003', is_active: true },
  { _id: 's4', name: '杨宇', role: 'sales', phone: '13800000004', is_active: true },
]

// Helper: find staff id by name
const sid = (name: string) => mockStaff.find(s => s.name === name)?._id ?? 's1'

// ===== Customers (cleaned from Excel per TD §7) =====
export const mockCustomers: Customer[] = [
  // --- fama客户 ---
  { _id: 'c1', company_name: '青岛迪斯兔婴童用品有限公司', short_name: '迪斯兔', contact_person: undefined, region: '青岛', industry: '婴童用品', status: 'active', created_by: sid('王新华'), created_at: '2025-01-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c2', company_name: '东莞乐领儿童家具有限公司', short_name: '乐领', region: '东莞', industry: '儿童家具', status: 'active', created_by: sid('王新华'), created_at: '2025-02-10T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c3', company_name: '深圳生活诚品儿童桌', short_name: '生活诚品', region: '深圳', industry: '儿童家具', status: 'active', created_by: sid('王新华'), created_at: '2025-03-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c4', company_name: '中山市晶鑫光电有限公司', short_name: '晶鑫光电', region: '中山', industry: '灯具', status: 'active', created_by: sid('王新华'), created_at: '2025-03-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c5', company_name: '胡总电竞椅公司（待补全）', short_name: '胡总电竞椅', contact_person: '胡总', industry: '电竞桌椅', status: 'active', created_by: sid('王新华'), created_at: '2025-04-01T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c6', company_name: '天津客户（待补全）', short_name: '天津客户', region: '天津', industry: '地垫', status: 'active', created_by: sid('刘勇'), created_at: '2025-04-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c7', company_name: '南通唯岛纺织有限公司', short_name: '唯岛纺织', contact_person: '陆游', region: '南通', industry: '纺织', status: 'active', created_by: sid('张宇航'), created_at: '2025-05-01T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c8', company_name: '赣州罗总公司（待补全）', short_name: '赣州罗总', contact_person: '罗总', region: '赣州', industry: '家具', status: 'active', created_by: sid('刘勇'), created_at: '2025-05-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c9', company_name: '义乌氚达服饰有限公司', short_name: '氚达服饰', region: '义乌', industry: '家居用品', status: 'active', created_by: sid('刘勇'), created_at: '2025-06-01T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c10', company_name: '酷漫居', short_name: '酷漫居', industry: '儿童家具', status: 'active', created_by: sid('张宇航'), created_at: '2025-06-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },

  // --- 联合开发 ---
  { _id: 'c11', company_name: '彭设计树屋', short_name: '彭设计树屋', industry: '儿童家具', status: 'active', created_by: sid('王新华'), created_at: '2025-07-01T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c12', company_name: '迪士尼青竹地毯', short_name: '青竹地毯', industry: '地毯', status: 'active', created_by: sid('张宇航'), created_at: '2025-07-10T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c13', company_name: '杭州八九间', short_name: '八九间', contact_person: '姚总', contact_phone: '13777882324', region: '杭州', industry: '学习桌椅', status: 'active', created_by: sid('王新华'), created_at: '2025-07-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c14', company_name: '纯信科技（托瑞斯）', short_name: '纯信科技', contact_person: '赵总', industry: '电竞椅', status: 'active', created_by: sid('王新华'), created_at: '2025-08-01T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c15', company_name: 'Rex关总电竞桌公司（待补全）', short_name: 'Rex关总', contact_person: '关总', industry: '电竞桌', status: 'active', created_by: sid('王新华'), created_at: '2025-08-10T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c16', company_name: '钱总沙发公司（待补全）', short_name: '钱总沙发', contact_person: '钱总', industry: '沙发', status: 'active', created_by: sid('杨宇'), created_at: '2025-08-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c17', company_name: '苏小姐懒人桌（临沂）', short_name: '苏小姐懒人桌', contact_person: '苏小姐', region: '临沂', industry: '懒人桌', status: 'active', created_by: sid('杨宇'), created_at: '2025-09-01T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c18', company_name: '义乌元总公司（待补全）', short_name: '义乌元总', contact_person: '元总', region: '义乌', industry: '充气床垫', status: 'active', created_by: sid('王新华'), created_at: '2025-09-10T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c19', company_name: '徐总收纳箱公司（待补全）', short_name: '徐总收纳箱', contact_person: '徐总', industry: '学习桌椅', status: 'active', created_by: sid('王新华'), created_at: '2025-09-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c20', company_name: '厦门矫姿椅公司（待补全）', short_name: '厦门矫姿椅', region: '厦门', industry: '矫姿椅', status: 'active', created_by: sid('杨宇'), created_at: '2025-10-01T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c21', company_name: '康好梦', short_name: '康好梦', industry: '矫姿椅', status: 'active', created_by: sid('杨宇'), created_at: '2025-10-10T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c22', company_name: '东八矫姿椅', short_name: '东八', industry: '矫姿椅', status: 'active', created_by: sid('杨宇'), created_at: '2025-10-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c23', company_name: '宣总公司（待补全）', short_name: '宣总', contact_person: '宣总', industry: '儿童家具', status: 'active', created_by: sid('杨宇'), created_at: '2025-11-01T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c24', company_name: '汕头羽兴诚', short_name: '羽兴诚', region: '汕头', industry: '抱枕', status: 'active', created_by: sid('张宇航'), created_at: '2025-11-10T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c25', company_name: '扬州贵总公司（待补全）', short_name: '扬州贵总', contact_person: '贵总', region: '扬州', industry: '抱枕', status: 'active', created_by: sid('刘勇'), created_at: '2025-11-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c26', company_name: '上海PapaHug', short_name: 'PapaHug', contact_person: '宋总', region: '上海', industry: '家居设计', status: 'active', created_by: sid('刘勇'), created_at: '2025-12-01T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c27', company_name: '金总梳妆椅公司（待补全）', short_name: '金总', contact_person: '金总', industry: '梳妆椅', status: 'active', created_by: sid('刘勇'), created_at: '2025-12-10T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c28', company_name: '永康艾总公司（待补全）', short_name: '艾总帐篷', contact_person: '艾总', region: '永康', industry: '帐篷', status: 'active', created_by: sid('刘勇'), created_at: '2025-12-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },

  // --- 代工/跨境 ---
  { _id: 'c29', company_name: '义乌跨境卖家（待补全）', short_name: '义乌跨境', region: '义乌', industry: '跨境电商', status: 'active', created_by: sid('王新华'), created_at: '2026-01-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'c30', company_name: '广州跨境卖家（待补全）', short_name: '广州跨境', region: '广州', industry: '跨境电商', status: 'active', created_by: sid('王新华'), created_at: '2026-01-10T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
]

// ===== Projects (cleaned from Excel per TD §7) =====
export const mockProjects: Project[] = [
  // --- fama ---
  { _id: 'p1', customer_id: 'c1', biz_type: 'fama', product_category: '坐姿调整器', stage: 'live', owner_id: sid('王新华'), est_revenue: 10, created_at: '2025-01-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p2', customer_id: 'c2', biz_type: 'fama', product_category: '儿童房家具家居', stage: 'live', owner_id: sid('王新华'), est_revenue: 30, created_at: '2025-02-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p3', customer_id: 'c3', biz_type: 'fama', product_category: '儿童学习桌', stage: 'contacted', owner_id: sid('王新华'), est_revenue: 30, created_at: '2025-03-10T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p4', customer_id: 'c4', biz_type: 'fama', product_category: '灯具', stage: 'live', owner_id: sid('王新华'), co_owners: [sid('张宇航')], est_revenue: 25, created_at: '2025-03-25T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p5', customer_id: 'c5', biz_type: 'fama', product_category: '电竞桌椅', stage: 'live', owner_id: sid('王新华'), co_owners: [sid('刘勇')], est_revenue: 50, priority: 'high', created_at: '2025-04-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p6', customer_id: 'c6', biz_type: 'fama', product_category: '地垫', stage: 'contacted', owner_id: sid('刘勇'), est_revenue: 15, created_at: '2025-04-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p7', customer_id: 'c7', biz_type: 'fama', product_category: '床垫/午睡枕/床笠', stage: 'live', owner_id: sid('王新华'), co_owners: [sid('张宇航')], est_revenue: 40, created_at: '2025-05-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p8', customer_id: 'c8', biz_type: 'fama', product_category: '桌椅/沙发/床/摇椅', stage: 'live', owner_id: sid('王新华'), co_owners: [sid('刘勇')], priority: 'high', created_at: '2025-05-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p9', customer_id: 'c9', biz_type: 'fama', product_category: '桌垫/懒人沙发/地垫', stage: 'contacted', owner_id: sid('刘勇'), est_revenue: 30, created_at: '2025-06-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p10', customer_id: 'c10', biz_type: 'fama', product_category: '儿童家具', stage: 'contacted', owner_id: sid('王新华'), co_owners: [sid('张宇航')], created_at: '2025-06-20T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },

  // --- joint_dev ---
  { _id: 'p11', customer_id: 'c11', biz_type: 'joint_dev', product_category: '树屋儿童床', stage: 'contacted', owner_id: sid('王新华'), est_revenue: 30, created_at: '2025-07-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p12', customer_id: 'c12', biz_type: 'joint_dev', product_category: '中档地毯', stage: 'contacted', owner_id: sid('王新华'), co_owners: [sid('张宇航')], created_at: '2025-07-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p13', customer_id: 'c13', biz_type: 'joint_dev', product_category: '高端学习桌椅/功能椅', stage: 'contacted', owner_id: sid('王新华'), created_at: '2025-07-25T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p14', customer_id: 'c14', biz_type: 'joint_dev', product_category: '电竞椅', stage: 'contacted', owner_id: sid('王新华'), created_at: '2025-08-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p15', customer_id: 'c15', biz_type: 'joint_dev', product_category: '电竞桌', stage: 'sampling', owner_id: sid('王新华'), notes: '广州震升家具，高阜电竞', created_at: '2025-08-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p16', customer_id: 'c16', biz_type: 'joint_dev', product_category: '小沙发', stage: 'sampling', owner_id: sid('杨宇'), created_at: '2025-08-25T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p17', customer_id: 'c17', biz_type: 'joint_dev', product_category: '懒人桌', stage: 'sampling', owner_id: sid('杨宇'), created_at: '2025-09-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p18', customer_id: 'c18', biz_type: 'joint_dev', product_category: '充气床垫/沙发', stage: 'contract_signing', owner_id: sid('王新华'), created_at: '2025-09-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p19', customer_id: 'c19', biz_type: 'joint_dev', product_category: '学习桌椅/积木桌椅', stage: 'contacted', owner_id: sid('王新华'), created_at: '2025-09-25T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p20', customer_id: 'c20', biz_type: 'joint_dev', product_category: '矫姿椅（漫威）', stage: 'sampling', owner_id: sid('杨宇'), created_at: '2025-10-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p21', customer_id: 'c21', biz_type: 'joint_dev', product_category: '矫姿椅（TPE/礼盒）', stage: 'production', owner_id: sid('杨宇'), created_at: '2025-10-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p22', customer_id: 'c22', biz_type: 'joint_dev', product_category: '矫姿椅（发热/功能款）', stage: 'contacted', owner_id: sid('杨宇'), created_at: '2025-10-25T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p23', customer_id: 'c23', biz_type: 'joint_dev', product_category: '小沙发/小座椅/积木桌', stage: 'contacted', owner_id: sid('杨宇'), co_owners: [sid('刘勇')], created_at: '2025-11-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p24', customer_id: 'c24', biz_type: 'joint_dev', product_category: '抱枕被/腰靠', stage: 'contacted', owner_id: sid('王新华'), co_owners: [sid('张宇航')], created_at: '2025-11-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p25', customer_id: 'c25', biz_type: 'joint_dev', product_category: '抱枕/腰靠', stage: 'contacted', owner_id: sid('刘勇'), created_at: '2025-11-25T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p26', customer_id: 'c26', biz_type: 'joint_dev', product_category: '特殊调性产品设计', stage: 'contacted', owner_id: sid('刘勇'), created_at: '2025-12-05T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p27', customer_id: 'c27', biz_type: 'joint_dev', product_category: '梳妆椅', stage: 'contacted', owner_id: sid('刘勇'), created_at: '2025-12-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p28', customer_id: 'c28', biz_type: 'joint_dev', product_category: '帐篷', stage: 'contacted', owner_id: sid('刘勇'), created_at: '2025-12-25T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },

  // --- oem_cross_border ---
  { _id: 'p29', customer_id: 'c29', biz_type: 'oem_cross_border', product_category: 'Temu/Shein渠道', stage: 'lead', owner_id: sid('王新华'), created_at: '2026-01-10T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { _id: 'p30', customer_id: 'c30', biz_type: 'oem_cross_border', product_category: 'Temu/Shein渠道', stage: 'lead', owner_id: sid('王新华'), created_at: '2026-01-15T08:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
]

// ===== Progress Logs (sample entries) =====
export const mockProgressLogs: ProgressLog[] = [
  { _id: 'l1', project_id: 'p1', customer_id: 'c1', staff_id: sid('王新华'), content: '坐姿调整器样品已确认，准备上线', stage_snapshot: 'live', created_at: '2026-02-20T10:30:00Z' },
  { _id: 'l2', project_id: 'p1', customer_id: 'c1', staff_id: sid('王新华'), content: '与迪斯兔确认上线时间表，预计下月上架', stage_snapshot: 'live', created_at: '2026-03-05T14:00:00Z' },
  { _id: 'l3', project_id: 'p2', customer_id: 'c2', staff_id: sid('王新华'), content: '乐领儿童房系列设计稿已通过Disney审核', stage_snapshot: 'live', created_at: '2026-02-15T09:00:00Z' },
  { _id: 'l4', project_id: 'p4', customer_id: 'c4', staff_id: sid('张宇航'), content: '灯具打样第二版寄出，等待反馈', stage_snapshot: 'sampling', created_at: '2026-01-20T16:00:00Z' },
  { _id: 'l5', project_id: 'p4', customer_id: 'c4', staff_id: sid('王新华'), content: '晶鑫灯具样品通过Disney授权审核，准备量产', stage_snapshot: 'live', created_at: '2026-02-28T11:00:00Z' },
  { _id: 'l6', project_id: 'p5', customer_id: 'c5', staff_id: sid('王新华'), content: '电竞椅已上线销售，首月销量反馈良好', stage_snapshot: 'live', created_at: '2026-03-10T10:00:00Z' },
  { _id: 'l7', project_id: 'p5', customer_id: 'c5', staff_id: sid('刘勇'), content: '协助处理电竞椅售后问题，已与客户沟通解决', stage_snapshot: 'live', created_at: '2026-03-15T15:30:00Z' },
  { _id: 'l8', project_id: 'p15', customer_id: 'c15', staff_id: sid('王新华'), content: '电竞桌供应商考察中，广州震升和高阜两家候选', stage_snapshot: 'sampling', created_at: '2026-02-10T09:30:00Z' },
  { _id: 'l9', project_id: 'p16', customer_id: 'c16', staff_id: sid('杨宇'), content: '小沙发设计稿第一版完成，发给客户审阅', stage_snapshot: 'sampling', created_at: '2026-03-01T13:00:00Z' },
  { _id: 'l10', project_id: 'p17', customer_id: 'c17', staff_id: sid('杨宇'), content: '懒人桌样品已寄出，等待苏小姐确认', stage_snapshot: 'sampling', created_at: '2026-03-08T11:00:00Z' },
  { _id: 'l11', project_id: 'p18', customer_id: 'c18', staff_id: sid('王新华'), content: '合同条款基本敲定，本周签约', stage_snapshot: 'contract_signing', created_at: '2026-03-20T09:00:00Z' },
  { _id: 'l12', project_id: 'p21', customer_id: 'c21', staff_id: sid('杨宇'), content: '康好梦矫姿椅小批量生产已启动', stage_snapshot: 'production', created_at: '2026-03-12T10:00:00Z' },
  { _id: 'l13', project_id: 'p7', customer_id: 'c7', staff_id: sid('张宇航'), content: '唯岛床垫系列包装设计定稿', stage_snapshot: 'live', created_at: '2026-03-18T14:00:00Z' },
  { _id: 'l14', project_id: 'p8', customer_id: 'c8', staff_id: sid('刘勇'), content: '赣州罗总系列产品清单确认，进入上线准备', stage_snapshot: 'live', created_at: '2026-03-22T16:00:00Z' },
  { _id: 'l15', project_id: 'p20', customer_id: 'c20', staff_id: sid('杨宇'), content: '厦门矫姿椅漫威主题设计稿提交Disney审核', stage_snapshot: 'sampling', created_at: '2026-03-25T10:30:00Z' },
]

// ===== Contracts (sample) =====
export const mockContracts: Contract[] = [
  { _id: 'ct1', project_id: 'p1', customer_id: 'c1', license_type: 'disney', licensed_categories: ['坐姿调整器'], sign_date: '2025-06-01', start_date: '2025-07-01', expiry_date: '2027-06-30', royalty_rate: 8, is_active: true, remind_days: 30, created_at: '2025-06-01T08:00:00Z', visible_to: ['s1'] },
  { _id: 'ct2', project_id: 'p2', customer_id: 'c2', license_type: 'disney', licensed_categories: ['儿童房家具', '家居用品'], sign_date: '2025-08-01', start_date: '2025-09-01', expiry_date: '2027-08-31', royalty_rate: 10, is_active: true, remind_days: 30, created_at: '2025-08-01T08:00:00Z', visible_to: ['s1'] },
  { _id: 'ct3', project_id: 'p5', customer_id: 'c5', license_type: 'disney', licensed_categories: ['电竞桌椅'], sign_date: '2025-10-15', start_date: '2025-11-01', expiry_date: '2027-10-31', royalty_rate: 8, contract_value: 50, is_active: true, remind_days: 30, created_at: '2025-10-15T08:00:00Z', visible_to: ['s1', 's3'] },
  { _id: 'ct4', project_id: 'p7', customer_id: 'c7', license_type: 'disney', licensed_categories: ['床垫', '午睡枕', '床笠'], sign_date: '2025-12-01', start_date: '2026-01-01', expiry_date: '2027-12-31', royalty_rate: 8, is_active: true, remind_days: 30, created_at: '2025-12-01T08:00:00Z', visible_to: ['s2'] },
]

// ===== Label Orders (防伪标订单) =====
export const mockLabelOrders: LabelOrder[] = [
  { _id: 'lo1', customer_id: 'c1', unit_price: 0.5, quantity: 2000, total_amount: 1000, order_date: '2025-08-10', staff_id: sid('王新华'), notes: '首批防伪标', created_at: '2025-08-10T08:00:00Z' },
  { _id: 'lo2', customer_id: 'c1', unit_price: 0.5, quantity: 5000, total_amount: 2500, order_date: '2026-01-15', staff_id: sid('王新华'), created_at: '2026-01-15T08:00:00Z' },
  { _id: 'lo3', customer_id: 'c2', unit_price: 0.45, quantity: 3000, total_amount: 1350, order_date: '2025-10-20', staff_id: sid('王新华'), created_at: '2025-10-20T08:00:00Z' },
  { _id: 'lo4', customer_id: 'c5', unit_price: 0.6, quantity: 10000, total_amount: 6000, order_date: '2026-01-05', staff_id: sid('刘勇'), notes: '电竞椅系列防伪标', created_at: '2026-01-05T08:00:00Z' },
  { _id: 'lo5', customer_id: 'c7', unit_price: 0.5, quantity: 4000, total_amount: 2000, order_date: '2026-02-01', staff_id: sid('张宇航'), created_at: '2026-02-01T08:00:00Z' },
  { _id: 'lo6', customer_id: 'c5', unit_price: 0.55, quantity: 8000, total_amount: 4400, order_date: '2026-03-20', staff_id: sid('刘勇'), notes: '第二批补货', created_at: '2026-03-20T08:00:00Z' },
]
