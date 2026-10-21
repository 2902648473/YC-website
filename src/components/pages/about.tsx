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

const aboutPhotos = [
  supplementalGallery[0],
  gallery[1],
  gallery[2],
  supplementalGallery[2],
];
function HistoryTimeline() {
  return (
    <>
      {historyMilestones.map((item) => (
        <li key={item.year}>
          <div className="about-timeline-year">
            <time dateTime={item.year}>{item.year}</time>
          </div>
          <div className="about-timeline-content">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </li>
      ))}
    </>
  );
}
export function AboutPage() {
  return (
    <>
      <section
        className="section about-introduction"
        aria-labelledby="about-company-title"
      >
        <div className="container about-company-grid">
          <div className="about-company-copy">
            <h2 className="section-title" id="about-company-title">
              {site.brandName}
            </h2>
            <p className="about-company-lead">
              立足{site.region}
              <br />
              关注报废汽车回收与资源循环利用
            </p>
            <p>
              {site.brandName}
              面向个人车主、企业与车队、产业合作伙伴，围绕车辆回收、处置对接及零部件与材料的后续利用开展业务交流。
            </p>
            <p>
              个人车辆关注资料、费用和交接；企业车辆关注清单、批次和结果归档；产业合作关注资源条件与具体分工。您可以在业务服务页直接查看相应的准备事项与流程。
            </p>
            <div className="about-company-links">
              <a className="text-link" href="/services.html">
                查看业务与资料准备
                <Icon name="arrow" />
              </a>
              <a className="text-link" href="#group-support">
                了解发展历程
                <Icon name="arrow" />
              </a>
            </div>
          </div>
          <aside
            className="about-credentials"
            aria-labelledby="about-credentials-title"
          >
            <div className="about-credentials-heading">
              <Icon name="check" />
              <h3 id="about-credentials-title">企业证照，公开可查</h3>
            </div>
            <p className="certificate-company">
              证照载明企业名称：
              <strong>{qualificationDocuments.companyName}</strong>
            </p>
            <ul>
              <li>报废机动车回收拆解企业资质认定证书</li>
              <li>营业执照</li>
            </ul>
            <p>
              两份证照已在首页完整展示，可放大核对证载名称和业务信息，为交车前核对承接主体提供依据。
            </p>
            <a className="text-link" href="/index.html#qualifications">
              查看企业资质与证照
              <Icon name="arrow" />
            </a>
          </aside>
        </div>
      </section>

      <section
        className="section soft about-history"
        id="group-support"
        aria-labelledby="about-history-title"
      >
        <div className="container">
          <div className="about-history-heading">
            <div>
              <h2 className="section-title" id="about-history-title">
                玉成有限公司的发展历程
              </h2>
              <p className="section-intro">
                从车辆回收拆解出发，逐步拓展回用件、信息管理和企业运营服务。以下集团发展节点依据公司介绍整理，展示专业经验的形成过程。
              </p>
            </div>
            <p className="about-history-subject">
              集团产业背景
              <br />
              <strong>玉成有限公司</strong>
            </p>
          </div>
          <ol className="about-timeline">
            <HistoryTimeline />
          </ol>
        </div>
      </section>

      <section
        className="section about-experience"
        aria-labelledby="about-experience-title"
      >
        <div className="container">
          <div className="about-experience-heading">
            <h2 className="section-title" id="about-experience-title">
              专业积累，体现在具体业务里
            </h2>
            <p className="section-intro">
              玉成有限公司的产业体系覆盖车辆、零部件与材料的不同利用环节。拆解、仓储和资源加工的实践，共同构成对汽车循环利用的认识。
            </p>
          </div>
          <div className="about-experience-visual">
            <Carousel
              slides={aboutPhotos}
              id="about-industry-photos"
              label="玉成产业场景图片"
            />
            <div className="about-experience-summary">
              <h3>从拆解工位，到零部件与材料利用</h3>
              <p>
                车辆进入回收环节后，需要经过核对、拆解和分类。适合继续利用的零部件与需要加工的材料，后续路径各不相同。
              </p>
              <p>
                集团业务资料中的回收拆解、相得易配回用件、总成件再制造和滁州产业园，体现了从整车到部件、再到材料的产业经验。
              </p>
              <p>
                <strong>
                  对客户而言，值得了解的是车辆怎样处理、不同资源如何利用，以及每个环节怎样对应记录。
                </strong>
              </p>
              <a className="text-link" href="/facilities.html">
                查看具体产业环节
                <Icon name="arrow" />
              </a>
            </div>
          </div>
          <div className="about-experience-grid">
            <article>
              <h3>标准化建设与运营</h3>
              <p>
                集团在工厂选址、规划、工艺、设备、环保与岗位管理等环节形成企业标准，将现场作业和经营管理联系起来。其价值在于让不同环节有明确要求，便于检查和管理。
              </p>
            </article>
            <article>
              <h3>精细拆解与多环节利用</h3>
              <p>
                回收拆解业务延伸至回用件销售、总成件再制造和材料加工。车辆价值需要结合车况、部件状态和后续用途理解，这些业务积累为具体沟通提供产业背景。
              </p>
            </article>
            <article>
              <h3>车辆信息与业务记录对应</h3>
              <p>
                玉成有限公司的信息化业务涉及车辆信息、单车评估、报价、核算与财务业务管理。清楚记录车辆和事项，是企业多车处置、内部核对与后续查询的重要基础。
              </p>
            </article>
            <article>
              <h3>回收企业运营服务经验</h3>
              <p>
                公司介绍记载了北京、上海回收企业的运营合作。从工厂管理到车辆处置项目，这类经验涉及现场组织、业务流程和部门协作，体现对实际经营环节的长期参与。
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        className="section soft about-development"
        aria-labelledby="about-development-title"
      >
        <div className="container about-development-grid">
          <div>
            <h2 className="section-title" id="about-development-title">
              持续关注的方向
            </h2>
            <p className="section-intro">
              围绕汽车产业变化，进一步关注资源利用和业务管理的完善。
            </p>
          </div>
          <div>
            <dl>
              <div>
                <dt>零部件与材料利用</dt>
                <dd>
                  关注回用件、再制造及新能源汽车相关资源的利用需求，让不同资源与适合的处理环节相衔接。
                </dd>
              </div>
              <div>
                <dt>信息协同与区域合作</dt>
                <dd>
                  围绕上海及周边的业务交流，关注车辆信息、交接记录和产业资源的协同，为具体项目讨论提供方向。
                </dd>
              </div>
            </dl>
            <p className="about-development-note">
              具体业务可承接范围、项目参与单位与实施安排，结合车辆或合作需求确认。
            </p>
            <a className="text-link" href="/services.html#cooperation">
              查看产业合作准备事项
              <Icon name="arrow" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
