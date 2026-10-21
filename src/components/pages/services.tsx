import {
  site,
  homeFaqs,
  gallery,
  supplementalGallery,
  homeHero,
  qualificationDocuments,
} from "../../data/site.mjs";
import { historyMilestones } from "../../data/about.mjs";
import {
  Icon,
  Steps,
  Faq,
  Photo,
  Carousel,
  PreparationConsultation,
  PreparationChecklist,
  IndustryOverview,
} from "../shared";

type DetailItems = [string, string][];
function Materials({ items }: { items: DetailItems }) {
  return (
    <dl className="service-material-list">
      {items.map(([name, detail]) => (
        <div key={name}>
          <dt>{name}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}
function Actions({ items }: { items: DetailItems }) {
  return (
    <ol className="service-action-list">
      {items.map(([title, detail]) => (
        <li key={title}>
          <strong>{title}</strong>
          <p>{detail}</p>
        </li>
      ))}
    </ol>
  );
}
function ServiceRoute({ items }: { items: DetailItems }) {
  return (
    <ol className="service-route">
      {items.map(([title, detail], index) => (
        <li key={title}>
          <span className="service-route-number" aria-hidden="true">
            {index + 1}
          </span>
          <h4>{title}</h4>
          <p>{detail}</p>
        </li>
      ))}
    </ol>
  );
}
export function ServicesPage() {
  return (
    <>
      <section
        className="section service-start"
        id="service-start"
        aria-labelledby="service-start-title"
      >
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title" id="service-start-title">
              先选您的身份，准备对应资料
            </h2>
            <p className="section-intro">
              首次联系先说明车辆或项目情况；证件、授权和详细资料，在确认接收单位与用途后提供。资料暂缺时，先把缺什么说清楚。
            </p>
          </div>
          <nav
            className="service-audience-grid"
            aria-label="按服务对象查看准备事项"
          >
            <a href="#personal">
              <span className="service-audience-title">
                <Icon name="car" />
                <strong>个人车主</strong>
              </span>
              <span className="service-audience-summary">
                车辆情况＋车主及车辆证件
              </span>
              <span className="service-audience-detail">
                先找出行驶证、登记证书，说明车在哪里、能否行驶、是否本人办理。
              </span>
              <span className="text-link">
                查看个人清单与流程
                <Icon name="arrow" />
              </span>
            </a>
            <a href="#enterprise">
              <span className="service-audience-title">
                <Icon name="building" />
                <strong>企业与车队</strong>
              </span>
              <span className="service-audience-summary">
                逐车清单＋单位及授权资料
              </span>
              <span className="service-audience-detail">
                整理每辆车的证件状态、停放地点和批次，明确经办人与内部审批安排。
              </span>
              <span className="text-link">
                查看企业清单与流程
                <Icon name="arrow" />
              </span>
            </a>
            <a href="#cooperation">
              <span className="service-audience-title">
                <Icon name="recycle" />
                <strong>产业合作伙伴</strong>
              </span>
              <span className="service-audience-summary">
                项目简述＋资源或需求清单
              </span>
              <span className="service-audience-detail">
                列出资源品类、规格、数量、状态和地点，说明希望对方承担什么。
              </span>
              <span className="text-link">
                查看合作清单与流程
                <Icon name="arrow" />
              </span>
            </a>
          </nav>
        </div>
      </section>

      <section
        className="section soft service-detail"
        id="personal"
        aria-labelledby="personal-title"
      >
        <div className="container">
          <div className="service-detail-heading">
            <div>
              <h2 className="section-title" id="personal-title">
                个人车主：先盘点车辆和证件
              </h2>
              <p className="section-intro">
                适合本人车辆回收咨询，也适合先了解代办、异地停放或资料缺失如何处理。
              </p>
            </div>
            <a className="text-link" href="#service-start">
              返回服务分类
              <Icon name="arrow" />
            </a>
          </div>
          <div className="service-preparation-grid">
            <div className="service-materials">
              <h3>需要准备什么</h3>
              <p className="service-block-intro">
                先检查手里有哪些，首次咨询可先说明资料状态。
              </p>
              <Materials
                items={[
                  [
                    "车辆信息与照片",
                    "车牌号、车型、实际停放地区、能否行驶；可准备车辆外观和现状照片，说明事故、缺件或无法移动的情况。",
                  ],
                  [
                    "车主身份证明",
                    "车主有效身份证件，例如居民身份证。首次联系先说明本人还是代办，正式核验方式在确认受理后落实。",
                  ],
                  [
                    "车辆证件与号牌",
                    "机动车登记证书原件（通常称“绿本”）、机动车行驶证原件、机动车号牌。逐项检查是否齐全。",
                  ],
                  [
                    "委托代办资料",
                    "由他人代办时，另准备代办人有效证件、车主授权委托书，按受理要求完成身份核验。",
                  ],
                  [
                    "交接与联系信息",
                    "停车位置、现场进出和拖运条件、现场联系人，以及您方便交接的时间。",
                  ],
                ]}
              />
            </div>
            <div className="service-actions">
              <h3>您要做的事</h3>
              <Actions
                items={[
                  [
                    "先说清车辆现状",
                    "说明所在地、车型、是否能开、资料是否齐全；代办、异地或资料不一致一并提出。",
                  ],
                  [
                    "确认后再交证件、约交车",
                    "核对实际承接单位、材料清单、提交方式、回收价款与拖运费用，再确定接车安排。",
                  ],
                  [
                    "交车时逐项清点",
                    "取走个人物品，按确认清单交接车辆、证件和号牌，保留车辆与资料交接记录。",
                  ],
                ]}
              />
              <p className="service-special">
                <strong>证件或号牌遗失：</strong>
                先说明缺哪一项，按受理要求准备车主书面情况说明及相应补充材料。
              </p>
            </div>
          </div>
          <div className="service-followup">
            <h3>联系后，按什么顺序推进</h3>
            <ServiceRoute
              items={[
                [
                  "说明情况",
                  "您提供车辆和资料状态，业务人员据此核对受理条件及需补充的内容。",
                ],
                [
                  "确认安排",
                  "双方确认材料、费用、拖运、时间与交接地点，明确各自负责事项。",
                ],
                [
                  "交车与办理",
                  "您交车并保存交接记录；回收企业按规定核验、拆解并申请注销登记。",
                ],
                [
                  "核对凭证",
                  "按告知方式查看、领取回收与注销凭证，核对车辆信息；缺少的结果继续联系跟进。",
                ],
              ]}
            />
          </div>
          <div className="service-result-note">
            <h3>交车后，分清两类凭证</h3>
            <dl>
              <div>
                <dt>《报废机动车回收证明》</dt>
                <dd>
                  上海由监管平台在拆解审核后生成电子证明，回收企业告知查看、取得方式。
                </dd>
              </div>
              <div>
                <dt>《机动车注销证明》</dt>
                <dd>
                  公安交管部门完成注销登记后的凭证，由回收企业按规定交给车主。
                </dd>
              </div>
            </dl>
            <p>
              这些是办理后要核对的结果，不是首次咨询要准备的材料。交车时问清跟进人员和取得方式，交车记录不等于注销完成。
            </p>
          </div>
          <a
            className="text-link service-detail-link"
            href="/guide.html#consultation-template"
          >
            使用首次咨询信息模板
            <Icon name="arrow" />
          </a>
        </div>
      </section>

      <section
        className="section service-detail"
        id="enterprise"
        aria-labelledby="enterprise-title"
      >
        <div className="container">
          <div className="service-detail-heading">
            <div>
              <h2 className="section-title" id="enterprise-title">
                企业与车队：按车、按批次准备
              </h2>
              <p className="section-intro">
                适合企业自有车辆、多地点或分批处置。车辆管理、经办授权、现场交接和资料归档分别落实到人。
              </p>
            </div>
            <a className="text-link" href="#service-start">
              返回服务分类
              <Icon name="arrow" />
            </a>
          </div>
          <div className="service-preparation-grid">
            <div className="service-materials">
              <h3>需要准备什么</h3>
              <p className="service-block-intro">
                车辆资料逐车对应，单位和经办资料按本次对接安排准备。
              </p>
              <Materials
                items={[
                  [
                    "企业车辆清单",
                    "每辆车一行：车牌号或内部编号、车型、停放地点、能否行驶、证件状态、计划批次和现场联系人；车辆识别代号可在核对时补充。",
                  ],
                  [
                    "逐车证件与号牌",
                    "各车辆的机动车登记证书原件、机动车行驶证原件和号牌；在清单中标明缺失、登记信息差异或需补充说明的车辆。",
                  ],
                  [
                    "单位与经办资料",
                    "加盖单位公章的营业执照复印件，或相应单位登记材料；单位授权委托书、经办人身份证件。提交形式按实际受理要求核对。",
                  ],
                  [
                    "审批与交接计划",
                    "处置审批或授权进度、拟处置批次、期望时间、交接场地与负责人；内部制度要求的记录可一并列明。",
                  ],
                  [
                    "结算及归档要求",
                    "列出企业需要的费用明细、结算凭据、车辆回收与注销结果资料，明确财务和资料接收人员；具体可提供内容在对接时确认。",
                  ],
                ]}
              />
            </div>
            <div className="service-actions">
              <h3>您要做的事</h3>
              <Actions
                items={[
                  [
                    "汇总清单，标出例外车辆",
                    "按地点和批次分组；证件缺失、车辆无法移动或登记信息不一致的，单独标记。",
                  ],
                  [
                    "落实审批与经办授权",
                    "确定企业业务联系人、现场负责人和资料接收人，按内部制度完成必要审批。",
                  ],
                  [
                    "确认每批交接与结算口径",
                    "对照清单核对受理车辆、实际签约单位、费用、清点方式和结果资料接收方式。",
                  ],
                  [
                    "交接后按车辆逐项核对",
                    "将交接记录、费用记录及回收、注销结果对应到每辆车；未完成事项列出负责方继续跟进。",
                  ],
                ]}
              />
              <p className="service-special">
                <strong>多地点或分批处理：</strong>
                每批安排一名可联系的现场人员，交接前同步车辆和资料的变化，避免新旧清单混用。
              </p>
            </div>
          </div>
          <div className="service-followup">
            <h3>资料整理后，如何推进</h3>
            <ServiceRoute
              items={[
                [
                  "清单核对",
                  "先确认本批车辆、所在地与资料缺项，列出需要单独核实的车辆。",
                ],
                [
                  "确定方案",
                  "对接承接单位、授权与签约安排，确认批次、费用和资料交付要求。",
                ],
                [
                  "分批交接",
                  "现场按清单逐车清点，核对证件、号牌及交接记录，记录变化。",
                ],
                [
                  "对账归档",
                  "逐车跟进回收证明与注销结果，核对约定费用和已取得资料后归档。",
                ],
              ]}
            />
          </div>
          <PreparationChecklist />
          <p className="service-checklist-extra">
            资料状态可写：“登记证书齐全、行驶证齐全、号牌缺失”。车辆识别代号及内部归档字段，可按正式核对需要继续补充。
          </p>
        </div>
      </section>

      <section
        className="section soft service-detail"
        id="cooperation"
        aria-labelledby="cooperation-title"
      >
        <div className="container">
          <div className="service-detail-heading">
            <div>
              <h2 className="section-title" id="cooperation-title">
                产业合作：先把资源和需求说具体
              </h2>
              <p className="section-intro">
                围绕车辆回收、回用件与再制造、材料利用，说明您有什么、需要什么，以及希望如何合作。
              </p>
            </div>
            <a className="text-link" href="#service-start">
              返回服务分类
              <Icon name="arrow" />
            </a>
          </div>
          <div className="service-preparation-grid">
            <div className="service-materials">
              <h3>需要准备什么</h3>
              <p className="service-block-intro">
                先用一页项目说明和一份清单即可展开交流，不必一开始准备完整方案书。
              </p>
              <Materials
                items={[
                  [
                    "单位与项目简述",
                    "单位名称、项目所在地、当前阶段、联系人，以及本次希望解决的具体问题。",
                  ],
                  [
                    "车辆项目资料",
                    "车辆清单、车型数量、车况、停放地区和计划批次；可附车辆与场地现状照片，并说明希望对接的环节。",
                  ],
                  [
                    "零部件供需资料",
                    "说明供应、采购或协作需求，列出部件名称、适用车型或型号、数量、状态和地点；可附型号或铭牌照片、现有检测和来源记录。",
                  ],
                  [
                    "材料资源资料",
                    "材料类别、数量或重量、规格、分类与混杂情况、存放地点；可附现状照片、已有称重或检测记录，采购方补充接收要求。",
                  ],
                  [
                    "合作条件与计划",
                    "本方可以提供的资源或工作、希望对方承担的事项、计划批次和时间；说明运输、存放、验收等具体要求。",
                  ],
                ]}
              />
            </div>
            <div className="service-actions">
              <h3>您要做的事</h3>
              <Actions
                items={[
                  [
                    "选定本次要谈的对象",
                    "先明确是整车、零部件、材料还是项目协作，避免把多个不同需求混在一份笼统介绍中。",
                  ],
                  [
                    "提供能核对的清单与样例",
                    "将照片、型号、数量和现状对应起来，区分现有资源与预计资源，列出需对方确认的问题。",
                  ],
                  [
                    "先明确分工，再安排交付",
                    "对接资源适配、验收、运输、费用及各方职责，确认下一阶段要补充的资料和行动。",
                  ],
                ]}
              />
              <p className="service-special">
                <strong>有现成资料就先提供：</strong>
                资源清单、项目介绍或照片均可作为起点。涉及检测、现场沟通或补充资料时，结合项目另行确认。
              </p>
            </div>
          </div>
          <div className="service-followup">
            <h3>合作需求如何推进</h3>
            <ServiceRoute
              items={[
                [
                  "需求初步匹配",
                  "根据品类、地点、数量和目标，明确本次讨论范围与参与方。",
                ],
                [
                  "核对资源条件",
                  "交流现有资料；需要补充检测信息、样例或现场沟通的，明确具体事项。",
                ],
                [
                  "明确合作分工",
                  "形成可讨论的交付内容、验收要求、费用与职责，再决定是否推进。",
                ],
                [
                  "约定后实施",
                  "达成约定后按批次或节点推进，核对交付记录并跟进问题。",
                ],
              ]}
            />
          </div>
          <div className="service-cooperation-context">
            <Photo item={supplementalGallery[1]} />
            <div>
              <h3>零部件与材料需求，尽量描述到具体对象</h3>
              <p>
                例如说明“某车型变速箱的型号、数量和现状”，或“某类材料的规格、数量和存放地点”。对象越明确，越容易判断资料缺项和下一步对接内容。
              </p>
              <a className="text-link" href="/facilities.html">
                了解相关产业环节
                <Icon name="arrow" />
              </a>
            </div>
          </div>
        </div>
      </section>
      <section
        className="section service-reference"
        aria-labelledby="service-reference-title"
      >
        <div className="container">
          <h2 className="section-title" id="service-reference-title">
            准备好基本情况，就可以开始联系
          </h2>
          <p>
            以上为咨询准备示例。正式材料、提交形式、受理条件、实际承接单位及费用安排，结合车辆或项目确认；资料有缺项，也可以先说明情况。
          </p>
          <div className="section-links">
            <a href="/guide.html">查看详细准备与交接说明</a>
            <a href="/contact.html">联系{site.contactName}</a>
            <a href="/index.html#process">查看首页五步流程</a>
          </div>
          <p className="service-official-source">
            证件与后续凭证参考：
            <a href="https://www.shanghai.gov.cn/gwk/search/content/10634e24e4ba480b87c82271ebeaca71">
              《上海市报废机动车回收管理实施办法》第十八、十九条
            </a>
            及
            <a href="https://www.shanghai.gov.cn/nw17239/20260317/1b1cc3f162614eb0b3b0c47ce3c9ca89.html">
              上海政府报废注销办事说明
            </a>
            。核对日期：2026年10月22日。
          </p>
        </div>
      </section>
    </>
  );
}
