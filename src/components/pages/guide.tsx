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

export function GuidePage() {
  return (
    <>
      <section className="section" id="consultation-template">
        <div className="container">
          <PreparationConsultation />
        </div>
      </section>
      <section className="section soft" id="preparation">
        <div className="container">
          <div className="guide-introduction">
            <div>
              <h2 className="section-title">咨询前，先整理一份基本信息</h2>
              <p className="section-intro">
                先说明车辆与需求，再了解适用的受理和材料要求。以下内容供咨询准备使用；具体提交材料及办理安排，由实际承接单位说明。
              </p>
            </div>
            <a className="text-link" href="/index.html#process">
              查看首页五步流程 <Icon name="arrow" />
            </a>
          </div>
          <div className="guide-preparation">
            <article className="guide-preparation__column">
              <h3>
                <Icon name="car" /> 个人车主
              </h3>
              <dl className="guide-info-list">
                <div>
                  <dt>车辆基本情况</dt>
                  <dd>
                    车辆类型、当前所在地、能否正常行驶，以及是否存在影响交接的停放或移动条件。
                  </dd>
                </div>
                <div>
                  <dt>登记与权属情况</dt>
                  <dd>
                    车辆登记人与实际联系人的关系；如涉及代办、权属信息差异，先说明情况。
                  </dd>
                </div>
                <div>
                  <dt>现有资料状态</dt>
                  <dd>
                    整理已持有的车辆及身份相关资料，列出缺失或信息不一致的部分，咨询时一并说明。
                  </dd>
                </div>
                <div>
                  <dt>处置意向与问题</dt>
                  <dd>
                    希望了解的受理、拖运、费用或后续手续问题，以及您方便联系和交接的时间。
                  </dd>
                </div>
              </dl>
            </article>
            <article
              className="guide-preparation__column"
              id="enterprise-preparation"
            >
              <h3>
                <Icon name="building" /> 企业与车队
              </h3>
              <dl className="guide-info-list">
                <div>
                  <dt>车辆基础清单</dt>
                  <dd>
                    按车辆类型、所在地点、基本车况和计划批次整理，便于区分不同车辆的安排。
                  </dd>
                </div>
                <div>
                  <dt>内部对接关系</dt>
                  <dd>
                    明确业务联系人、车辆管理人员和资料接收人员，说明内部审批与授权的进度。
                  </dd>
                </div>
                <div>
                  <dt>计划与现场条件</dt>
                  <dd>
                    说明预期批次、停放地点和现场交接条件；多个地区的车辆可分别列明。
                  </dd>
                </div>
                <div>
                  <dt>归档与结果需求</dt>
                  <dd>
                    提前列出企业需要留存的交接记录、结果资料及内部归档要求，便于双方沟通。
                  </dd>
                </div>
              </dl>
            </article>
          </div>
          <p className="note guide-preparation-note">
            首次咨询可先提供基本描述。涉及个人、企业或车辆资料时，确认接收单位、用途与提供方式后再提交。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">需要提前说明的特殊情况</h2>
            <p className="section-intro">
              不同车辆的准备重点可能不同。提前说明特殊情况，有助于减少后续反复沟通。
            </p>
          </div>
          <div className="guide-situations">
            <article>
              <h3>资料缺失或信息不一致</h3>
              <p>
                列出缺少哪类资料、哪些登记信息与现状不一致，以及目前能够提供的说明。先沟通受理条件与处理途径，再准备后续材料。
              </p>
            </article>
            <article>
              <h3>车辆无法行驶或异地停放</h3>
              <p>
                说明实际停放地区、车辆移动条件和现场联系人。拖运能否安排、交接地点、时间及费用，需要结合车辆情况具体沟通。
              </p>
            </article>
            <article>
              <h3>企业分批或多地点处置</h3>
              <p>
                将车辆按地点与批次分组，标明各组负责人和资料状态。交接时逐组核对，结果材料也按相同批次归档。
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="section soft" id="process">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">交接与后续结果核对</h2>
            <p className="section-intro">
              <strong>
                把交接记录与后续材料对应保存，才能清楚跟进每辆车或每个批次。
              </strong>
              记录中应便于找到车辆、交接事项和负责联系的人员。
            </p>
          </div>
          <div className="guide-confirmation">
            <article>
              <h3>交接前后</h3>
              <dl className="guide-info-list">
                <div>
                  <dt>确认承接与交接安排</dt>
                  <dd>
                    核对实际承接及签约单位、时间、地点、拖运安排与费用约定，记下现场交接和资料接收人员，确认各自负责的事项。
                  </dd>
                </div>
                <div>
                  <dt>逐项清点车辆与资料</dt>
                  <dd>
                    按车辆或批次核对数量、车况和随附资料。缺失、信息不一致或与原沟通有变化的部分，单独记录并确认补充及处理方式。
                  </dd>
                </div>
                <div>
                  <dt>留存双方认可的记录</dt>
                  <dd>
                    确认记录所对应的车辆、批次和交接内容，了解双方如何确认与保存。企业客户可与内部审批及车辆清单一起归档。
                  </dd>
                </div>
              </dl>
            </article>
            <article>
              <h3>后续跟进</h3>
              <dl className="guide-info-list">
                <div>
                  <dt>核对结果资料</dt>
                  <dd>
                    按约定核对收到的材料种类、车辆与单位信息；尚未取得的材料继续记录负责方和取得方式，便于后续跟进。
                  </dd>
                </div>
                <div>
                  <dt>按约定节点查询</dt>
                  <dd>
                    保留查询联系人与渠道，了解当前进展及需要补充配合的事项。交付方式或安排有变化时，同步更新已有记录。
                  </dd>
                </div>
                <div>
                  <dt>发现问题及时反馈</dt>
                  <dd>
                    说明对应车辆或批次、具体差异及已收到的材料，附上相关沟通和交接记录，便于业务人员查找并继续对接。
                  </dd>
                </div>
              </dl>
            </article>
          </div>
        </div>
      </section>
      <section className="section" id="questions">
        <div className="container guide-questions">
          <div className="guide-questions__intro">
            <h2 className="section-title">常见问题</h2>
            <p>进一步了解首次咨询、交接准备与后续结果的核对方法。</p>
            <a className="text-link" href="/contact.html">
              联系{site.contactName} <Icon name="arrow" />
            </a>
          </div>
          <div>
            <Faq />
          </div>
        </div>
      </section>
    </>
  );
}
