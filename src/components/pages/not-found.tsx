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

export function NotFoundPage() {
  return (
    <>
      <section className="section">
        <div className="container error-content">
          <p className="error-number" aria-hidden="true">
            404
          </p>
          <h2>继续了解{site.brandName}</h2>
          <p>您可以返回首页查看业务介绍，或直接联系{site.contactName}沟通。</p>
          <div className="button-row">
            <a className="button" href="/index.html">
              返回首页
            </a>
            <a className="button button-outline" href="/contact.html">
              联系业务人员 <Icon name="arrow" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
