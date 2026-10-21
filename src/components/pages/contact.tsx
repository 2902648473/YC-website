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

export function ContactPage() {
  return (
    <>
      <section className="section">
        <div className="container contact-layout">
          <div className="contact-details">
            <h2>{site.contactName}</h2>
            <p className="contact-details__brand">
              {site.brandName} · {site.region}
            </p>
            <dl className="contact-methods">
              <div>
                <dt>
                  <Icon name="phone" /> 联系电话
                </dt>
                <dd>
                  <a className="contact-phone" href={site.phoneHref}>
                    {site.phone}
                  </a>
                  <button
                    type="button"
                    className="contact-copy js-only"
                    data-copy-phone=""
                    data-phone={site.phone}
                  >
                    复制电话
                  </button>
                </dd>
              </div>
              <div>
                <dt>
                  <Icon name="location" /> 所在区域
                </dt>
                <dd>{site.region}</dd>
              </div>
              <div>
                <dt>
                  <Icon name="wechat" /> 微信联系
                </dt>
                <dd>
                  扫描页面中的二维码添加微信。手机可保存联系图片，再在微信中识别二维码。
                </dd>
              </div>
            </dl>
            <div className="button-row">
              <a className="button" href={site.phoneHref}>
                <Icon name="phone" /> 电话咨询
              </a>
              <a
                className="button button-outline"
                href={site.wechatImage}
                data-wechat=""
              >
                <Icon name="wechat" /> 放大查看二维码
              </a>
            </div>
            <div className="contact-visit-note">
              <h3>来访安排</h3>
              <p>
                如需来访，请先联系{site.contactName}
                说明目的、人数及希望讨论的事项，确认具体地点、接待人员与时间后再规划行程。
              </p>
            </div>
          </div>
          <figure className="contact-poster">
            <a
              href={site.wechatImage}
              data-wechat=""
              aria-label={`放大查看${site.contactName}的微信二维码`}
            >
              <img
                src={site.wechatImage}
                width="960"
                height="1424"
                alt={`${site.contactName}的联系图片，包含电话${site.phone}和微信二维码`}
                fetchPriority="high"
              />
            </a>
            <figcaption>
              <strong>微信联系{site.contactName}</strong>
              <span>
                点击图片放大查看二维码。手机可保存联系图片后，在微信中识别。
              </span>
              <a className="text-link" href={site.wechatImage} download>
                保存联系图片 <Icon name="arrow" />
              </a>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">首次联系，可以这样介绍</h2>
            <p className="section-intro">
              先说明所在地、车辆或项目情况及具体需求；需要补充资料时，确认接收人、用途与提供方式。
            </p>
          </div>
          <div className="contact-topics">
            <article>
              <h3>个人车辆</h3>
              <blockquote>
                “我的车辆在……，车型是……，目前可以／不能正常行驶，想了解车辆回收和交接准备。”
              </blockquote>
              <p>可补充车辆登记、资料情况，以及您最关心的问题。</p>
              <a className="text-link" href="/guide.html#preparation">
                查看个人准备清单 <Icon name="arrow" />
              </a>
            </article>
            <article>
              <h3>企业车辆</h3>
              <blockquote>
                “我们有一批车辆计划处置，分别位于……，希望按……批次沟通，想了解受理与交接安排。”
              </blockquote>
              <p>可补充数量、基本车况、内部审批和资料接收要求。</p>
              <a className="text-link" href="/services.html#enterprise">
                查看企业对接事项 <Icon name="arrow" />
              </a>
            </article>
            <article>
              <h3>产业合作</h3>
              <blockquote>
                “我们关注……环节，项目在……，已有……资源，希望交流……方面的合作。”
              </blockquote>
              <p>可补充项目阶段、参与单位和希望对接的具体内容。</p>
              <a className="text-link" href="/services.html#cooperation">
                查看产业合作方向 <Icon name="arrow" />
              </a>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
