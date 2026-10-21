// 未确认字段保持 null；候选名称、地址与核对事项仅存于内部文档。
export const site = Object.freeze({
  brandName: '玉成智造',
  legalName: null,
  contactName: '姚经理',
  phone: '18321103133',
  phoneHref: 'tel:18321103133',
  region: '上海嘉定',
  address: null,
  wechatImage: '/assets/contact/contact-manager.png',
  businessHours: null,
  icpNumber: null,
});

export const navigation = [
  ['index', '/index.html', '首页'],
  ['services', '/services.html', '业务服务'],
  ['guide', '/guide.html', '咨询与办理准备'],
  ['facilities', '/facilities.html', '工艺与产业协同'],
  ['about', '/about.html', '关于玉成'],
  ['contact', '/contact.html', '联系我们'],
];

export const qualificationDocuments = {
  companyName: '玉成智造（上海）科技有限公司',
  watermark: '玉成智造 · 仅供官网展示',
  pages: [
    { title: '报废机动车回收拆解企业资质认定证书', image: '/assets/documents/recycling-qualification-page-1.webp', width: 1684, height: 1190 },
    { title: '营业执照', image: '/assets/documents/recycling-qualification-page-2.webp', width: 1684, height: 1213 },
  ],
};

export const steps = [
  ['说明车辆情况', '提供车型、所在地、车况与资料情况；企业客户补充车辆数量。'],
  ['确认受理安排', '了解受理条件与承接单位，说明个人需求或企业处置计划。'],
  ['准备所需材料', '按确认的清单整理资料，提前说明缺失或需要补充的内容。'],
  ['核对车辆交接', '明确费用、拖运、时间与地点，并留存车辆和资料交接记录。'],
  ['确认后续事项', '核对资料领取方式和后续联络人，保留相关记录便于查询。'],
];

export const faqs = [
  ['如何联系业务人员？', `您可以联系${site.contactName}，拨打 ${site.phone}，或扫描页面中的二维码添加微信。手机也可保存联系图片后在微信中识别。`],
  ['咨询前需要准备哪些信息？', '先说明车辆在哪里、是什么类型、能否正常行驶，以及登记人与联系人的关系。企业客户可按所在地和计划批次整理车辆清单。资料有缺失或信息不一致时，一并说明；具体需要提交的材料及方式，请与业务人员核对。'],
  ['车辆交接前，需要问清哪些事项？', '重点是承接主体、费用安排和后续资料。先核对实际承接与签约单位，再确认拖运、交接及结算如何安排，由谁承担相关费用。同时问清车辆和资料怎样清点、交接记录如何留存、后续由谁交付哪些材料及向谁查询，确认后再安排交接。'],
  ['是否可以安排车辆拖运？', '先说明停放地区、车辆能否移动，以及现场的进出条件和联系人。再与业务人员确认能否安排拖运、由谁承接、到哪里交接、费用由谁承担及如何结算。不能正常行驶或停放条件特殊时，应在安排前说明，具体服务以沟通结果为准。'],
  ['车辆报废是否可以获得补贴？', '补贴适用条件、金额和申领方式需核对当地现行官方政策。具体是否符合条件，应以相关部门的规定及审核结果为准。'],
  ['企业有多辆车，如何对接？', '建议按所在地、车辆类型和计划批次建立清单，逐项记录车况、资料状态及现场联系人，并说明内部审批和授权进度。沟通时逐批确认受理条件、交接安排及资料接收人；后续记录按同一车辆或批次归档，便于内部核对和查询。'],
];

export const gallery = [
  { image: '/assets/images/dismantling-1.webp', original: '/assets/images/dismantling-1-original.jpg', width: 1080, height: 602, title: '车辆举升拆解' },
  { image: '/assets/images/dismantling-2.webp', original: '/assets/images/dismantling-2-original.jpg', width: 1080, height: 600, title: '拆解作业工位' },
  { image: '/assets/images/parts-warehouse.webp', original: '/assets/images/parts-warehouse-original.png', width: 1600, height: 725, title: '回用件仓储' },
];

// 首页只展示代表内容；内页仍复用完整问答和图库，避免出现两份文案。
export const homeFaqs = [faqs[1], faqs[3], faqs[5]];
// 第 14 页滁州产业园照片；来源记录于 content-sources.md，不作上海实拍描述。
export const homeHero = { image: '/assets/images/vehicle-dismantling.webp', original: '/assets/images/vehicle-dismantling-original.jpg', width: 960, height: 640, title: '报废车辆拆解作业' };

// 来自原公司介绍的补充照片；详细来源与拍摄地点边界记录于 content-sources.md。
export const supplementalGallery = [
  { image: '/assets/images/parts-campus.webp', original: '/assets/images/parts-campus-original.png', width: 1600, height: 786, title: '回用件业务场区' },
  { image: '/assets/images/parts-workshop.webp', original: '/assets/images/parts-workshop-original.png', width: 1600, height: 791, title: '零部件存放车间' },
  { image: '/assets/images/recycling-line.webp', original: '/assets/images/recycling-line-original.jpg', width: 1600, height: 1067, title: '资源循环利用作业场景' },
];
