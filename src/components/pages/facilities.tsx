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

export function FacilitiesPage() {
  return (
    <>
      <IndustryOverview />
      <section className="section soft" id="group-gallery">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">工艺与产业场景</h2>
            <p className="section-intro">
              车辆拆解、回用件仓储与后端资源利用，从不同侧面展示汽车循环利用产业。图片可放大查看。
            </p>
          </div>
          <div className="facilities-features">
            <article className="facilities-feature">
              <Photo item={gallery[1]} />
              <div className="facilities-feature__copy">
                <h3>拆解作业与分类</h3>
                <dl className="guide-info-list">
                  <div>
                    <dt>处理对象</dt>
                    <dd>
                      以整车及拆出的零部件、材料为对象，集团资料以“全流程精拆”介绍相关业务方向。
                    </dd>
                  </div>
                  <div>
                    <dt>环节作用</dt>
                    <dd>
                      拆解工位、人员与分类安排相互配合，将车辆中的不同资源对象分离并对应记录。
                    </dd>
                  </div>
                  <div>
                    <dt>后续联系</dt>
                    <dd>
                      部件与材料按各自状态和用途，进一步衔接回用件、再制造或材料加工环节。
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
            <article className="facilities-feature facilities-feature--reverse">
              <Photo item={gallery[2]} />
              <div className="facilities-feature__copy">
                <h3>回用件仓储与信息对应</h3>
                <dl className="guide-info-list">
                  <div>
                    <dt>处理对象</dt>
                    <dd>
                      拆解分类后的汽车零部件。集团相得易配业务资料介绍回用件销售与流通，并展示零部件仓储场景。
                    </dd>
                  </div>
                  <div>
                    <dt>环节作用</dt>
                    <dd>
                      通过分类存放和部件信息对应，连接入库、查找与需求沟通，重点核对车型、部件名称、状态和用途。
                    </dd>
                  </div>
                  <div>
                    <dt>后续联系</dt>
                    <dd>
                      结合具体需求了解适配、库存及交付要求。资料照片用于理解仓储环节，实际可供资源需进一步沟通。
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
            <article className="facilities-feature">
              <Photo item={supplementalGallery[2]} />
              <div className="facilities-feature__copy">
                <h3>后端加工与材料利用</h3>
                <dl className="guide-info-list">
                  <div>
                    <dt>处理对象</dt>
                    <dd>
                      拆解分类后的材料与相关资源。集团滁州产业园资料涉及废钢生产加工、轮胎加工及总成件集散等方向。
                    </dd>
                  </div>
                  <div>
                    <dt>环节作用</dt>
                    <dd>
                      将前端分类结果与后端接收、加工需求相对应，不同资源类别衔接不同的利用环节。
                    </dd>
                  </div>
                  <div>
                    <dt>后续联系</dt>
                    <dd>
                      项目交流需说明资源类别、状态、数量及所在地点，再了解接收要求、处理条件和参与单位。
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">业务咨询与合作</h2>
            <p className="section-intro">
              根据车辆或项目需求，了解相应的业务事项；具体合作资源、参与单位与责任分工结合项目确认。
            </p>
          </div>
          <div className="facilities-chain">
            <article>
              <h3>个人车辆</h3>
              <p>介绍车辆类型、所在地与现状，了解受理条件和交接准备。</p>
              <a className="text-link" href="/services.html#personal">
                了解车辆咨询 <Icon name="arrow" />
              </a>
            </article>
            <article>
              <h3>企业车辆</h3>
              <p>按车辆地点与批次整理清单，说明现场条件和内部协同要求。</p>
              <a className="text-link" href="/services.html#enterprise">
                了解企业对接 <Icon name="arrow" />
              </a>
            </article>
            <article>
              <h3>产业合作</h3>
              <p>
                说明项目地点、资源类别、现有条件和拟参与的环节，进一步讨论接收要求、交付内容及各方职责。
              </p>
              <a className="text-link" href="/services.html#cooperation">
                了解合作事项 <Icon name="arrow" />
              </a>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
