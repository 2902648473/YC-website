import { gallery, supplementalGallery, qualificationDocuments } from '../data/site.mjs';
import { historyMilestones } from '../data/about.mjs';
import { escapeHtml } from '../templates/components.mjs';
import { photoCarouselHtml } from '../templates/carousel.mjs';

export function renderAbout({ site, helpers }) {
  const { icon } = helpers;
  const brand = escapeHtml(site.brandName);
  const region = escapeHtml(site.region);
  const photos = [supplementalGallery[0], gallery[1], gallery[2], supplementalGallery[2]];
  return {
    title: `关于玉成｜${site.brandName}`,
    description: '了解玉成智造的业务定位和企业证照，以及玉成有限公司从创立、标准化工厂、回用件业务到运营服务的发展历程与专业积累。',
    heading: '关于玉成',
    intro: '了解企业证照、发展历程与专业积累，让选择有具体依据。',
    body: `
      <section class="section about-introduction" aria-labelledby="about-company-title"><div class="container about-company-grid">
        <div class="about-company-copy"><h2 class="section-title" id="about-company-title">${brand}</h2><p class="about-company-lead">立足${region}<br>关注报废汽车回收与资源循环利用</p><p>${brand}面向个人车主、企业与车队、产业合作伙伴，围绕车辆回收、处置对接及零部件与材料的后续利用开展业务交流。</p><p>个人车辆关注资料、费用和交接；企业车辆关注清单、批次和结果归档；产业合作关注资源条件与具体分工。您可以在业务服务页直接查看相应的准备事项与流程。</p><div class="about-company-links"><a class="text-link" href="/services.html">查看业务与资料准备${icon('arrow')}</a><a class="text-link" href="#group-support">了解发展历程${icon('arrow')}</a></div></div>
        <aside class="about-credentials" aria-labelledby="about-credentials-title"><div class="about-credentials-heading">${icon('check')}<h3 id="about-credentials-title">企业证照，公开可查</h3></div><p class="certificate-company">证照载明企业名称：<strong>${escapeHtml(qualificationDocuments.companyName)}</strong></p><ul><li>报废机动车回收拆解企业资质认定证书</li><li>营业执照</li></ul><p>两份证照已在首页完整展示，可放大核对证载名称和业务信息，为交车前核对承接主体提供依据。</p><a class="text-link" href="/index.html#qualifications">查看企业资质与证照${icon('arrow')}</a></aside>
      </div></section>

      <section class="section soft about-history" id="group-support" aria-labelledby="about-history-title"><div class="container">
        <div class="about-history-heading"><div><h2 class="section-title" id="about-history-title">玉成有限公司的发展历程</h2><p class="section-intro">从车辆回收拆解出发，逐步拓展回用件、信息管理和企业运营服务。以下集团发展节点依据公司介绍整理，展示专业经验的形成过程。</p></div><p class="about-history-subject">集团产业背景<br><strong>玉成有限公司</strong></p></div>
        <ol class="about-timeline">${historyMilestones.map(item => `<li><div class="about-timeline-year"><time datetime="${escapeHtml(item.year)}">${escapeHtml(item.year)}</time></div><div class="about-timeline-content"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`).join('')}</ol>
      </div></section>

      <section class="section about-experience" aria-labelledby="about-experience-title"><div class="container">
        <div class="about-experience-heading"><h2 class="section-title" id="about-experience-title">专业积累，体现在具体业务里</h2><p class="section-intro">玉成有限公司的产业体系覆盖车辆、零部件与材料的不同利用环节。拆解、仓储和资源加工的实践，共同构成对汽车循环利用的认识。</p></div>
        <div class="about-experience-visual">
          ${photoCarouselHtml(photos, { id: 'about-industry-photos', label: '玉成产业场景图片' })}
          <div class="about-experience-summary"><h3>从拆解工位，到零部件与材料利用</h3><p>车辆进入回收环节后，需要经过核对、拆解和分类。适合继续利用的零部件与需要加工的材料，后续路径各不相同。</p><p>集团业务资料中的回收拆解、相得易配回用件、总成件再制造和滁州产业园，体现了从整车到部件、再到材料的产业经验。</p><p><strong>对客户而言，值得了解的是车辆怎样处理、不同资源如何利用，以及每个环节怎样对应记录。</strong></p><a class="text-link" href="/facilities.html">查看具体产业环节${icon('arrow')}</a></div>
        </div>
        <div class="about-experience-grid">
          <article><h3>标准化建设与运营</h3><p>集团在工厂选址、规划、工艺、设备、环保与岗位管理等环节形成企业标准，将现场作业和经营管理联系起来。其价值在于让不同环节有明确要求，便于检查和管理。</p></article>
          <article><h3>精细拆解与多环节利用</h3><p>回收拆解业务延伸至回用件销售、总成件再制造和材料加工。车辆价值需要结合车况、部件状态和后续用途理解，这些业务积累为具体沟通提供产业背景。</p></article>
          <article><h3>车辆信息与业务记录对应</h3><p>玉成有限公司的信息化业务涉及车辆信息、单车评估、报价、核算与财务业务管理。清楚记录车辆和事项，是企业多车处置、内部核对与后续查询的重要基础。</p></article>
          <article><h3>回收企业运营服务经验</h3><p>公司介绍记载了北京、上海回收企业的运营合作。从工厂管理到车辆处置项目，这类经验涉及现场组织、业务流程和部门协作，体现对实际经营环节的长期参与。</p></article>
        </div>
      </div></section>

      <section class="section soft about-development" aria-labelledby="about-development-title"><div class="container about-development-grid"><div><h2 class="section-title" id="about-development-title">持续关注的方向</h2><p class="section-intro">围绕汽车产业变化，进一步关注资源利用和业务管理的完善。</p></div><div><dl><div><dt>零部件与材料利用</dt><dd>关注回用件、再制造及新能源汽车相关资源的利用需求，让不同资源与适合的处理环节相衔接。</dd></div><div><dt>信息协同与区域合作</dt><dd>围绕上海及周边的业务交流，关注车辆信息、交接记录和产业资源的协同，为具体项目讨论提供方向。</dd></div></dl><p class="about-development-note">具体业务可承接范围、项目参与单位与实施安排，结合车辆或合作需求确认。</p><a class="text-link" href="/services.html#cooperation">查看产业合作准备事项${icon('arrow')}</a></div></div></section>`,
  };
}
