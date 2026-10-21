import { homeFaqs, gallery, homeHero, qualificationDocuments } from '../data/site.mjs';

export function renderHome({ site, helpers }) {
  const { icon, stepsHtml, faqHtml, photoHtml } = helpers;
  return {
    title: '玉成智造｜报废汽车回收与资源循环利用',
    description: `玉成智造立足上海嘉定，面向个人车主提供车辆回收咨询，面向企业开展车辆处置对接与产业合作。了解业务、车辆价值沟通、交接准备和企业证照，联系${site.contactName}：${site.phone}。`,
    body: `
      <section class="hero" aria-labelledby="hero-title"><div class="container hero-inner">
        <div class="hero-copy"><p class="hero-location">${icon('location')}立足上海嘉定</p>
          <h1 id="hero-title">报废汽车回收<br>与资源循环利用</h1>
          <p class="hero-description">个人车辆回收咨询、企业车辆处置对接，<br class="desktop-break">衔接零部件回用与材料资源利用。<br><strong>从车辆情况、价值沟通到交接准备，理清每一步。</strong></p>
          <div class="button-row"><a class="button" href="#business">了解我们的业务${icon('arrow')}</a><a class="button button-outline" href="${site.phoneHref}">${icon('phone')}电话咨询</a></div><div class="hero-bottom">
          <a class="text-link hero-process-link" href="#process">查看办理流程${icon('arrow')}</a><a class="text-link hero-process-link" href="#qualifications">查看企业证照${icon('arrow')}</a></div>
        </div>
        ${photoHtml(homeHero, { className: 'hero-photo', priority: true })}
      </div></section>
      <section class="section home-business" id="business" aria-labelledby="business-title"><div class="container">
        <div class="section-heading"><div><h2 class="section-title" id="business-title">业务概况</h2><p class="section-intro">玉成智造立足上海嘉定，围绕<strong>报废机动车回收与资源循环利用</strong>开展业务。个人车主关注一辆车的处置，企业客户关注多辆车的统筹，产业伙伴关注零部件与材料的后续利用。</p></div><a class="text-link" href="/about.html">了解玉成智造${icon('arrow')}</a></div>
        <div class="home-business-grid">
          <article><div class="home-business-heading">${icon('car')}<h3>个人车辆回收咨询</h3></div><p>准备处理一辆车，先把车况、资料与交接事项说清楚。</p><ul><li><strong>车辆情况：</strong>车型、停放地区、能否行驶</li><li><strong>费用安排：</strong>回收价值、拖运与结算方式</li><li><strong>交接准备：</strong>所需资料、接车安排与后续材料</li></ul><a class="text-link" href="/services.html#personal">查看个人车辆服务${icon('arrow')}</a></article>
          <article><div class="home-business-heading">${icon('building')}<h3>企业车辆处置对接</h3></div><p>多车、多地点或分批处置，围绕清单组织对接，便于内部核对。</p><ul><li><strong>车辆清单：</strong>数量、所在地、车况与资料状态</li><li><strong>批次安排：</strong>内部授权、交接计划与现场联系人</li><li><strong>资料核对：</strong>车辆、交接记录与后续材料对应</li></ul><a class="text-link" href="/services.html#enterprise">查看企业处置对接${icon('arrow')}</a></article>
          <article><div class="home-business-heading">${icon('recycle')}<h3>汽车循环产业合作</h3></div><p>从具体车辆、零部件或材料需求出发，沟通合作环节和分工。</p><ul><li><strong>回收拆解：</strong>车源、处置需求与项目协作</li><li><strong>零部件利用：</strong>回用件、总成件与再制造方向</li><li><strong>材料利用：</strong>拆解产物、资源流向与供需对接</li></ul><a class="text-link" href="/services.html#cooperation">查看产业合作方向${icon('arrow')}</a></article>
        </div>
      </div></section>
      <section class="section soft home-benefits" id="advantages" aria-labelledby="advantages-title"><div class="container">
        <div class="section-heading"><div><h2 class="section-title" id="advantages-title">为什么选择玉成</h2><p class="section-intro">了解车辆价值的依据，核对交车对象，理清多车处置信息。从这三件具体的事开始。</p></div></div>
        <div class="home-benefits-layout">
          <div class="home-benefits-visual">${photoHtml(gallery[2], { className: 'home-benefits-photo' })}<p class="home-benefits-photo-note">从可回用零部件到再生材料，<br><strong>车辆的不同部分，有各自的利用路径。</strong></p><a class="text-link" href="/about.html#group-support">了解产业能力背景${icon('arrow')}</a></div>
          <div class="home-benefits-list">
            <article><h3>精细拆解与回用渠道，让车辆价值谈得更具体</h3><p>玉成有限公司的业务涵盖精细拆解、回用件销售和总成件再制造，为车辆与零部件提供多种利用路径。沟通回收价值时，可结合车型、车况和部件完整性逐项说明。</p><p class="home-benefit-value"><strong>对车主：</strong>了解报价考虑了哪些车辆信息，再把拖运等费用一并核对，比较实际到手金额。</p></article>
            <article><h3>证照公开，交车前有据可查</h3><p>首页提供回收拆解企业资质认定证书和营业执照，可放大核对证载名称。交车前，将证照信息与实际承接、签约单位对应起来。</p><p class="home-benefit-value"><strong>对车主与企业：</strong>先确认车交给谁、由谁负责后续事项，留好交接依据。</p><a class="text-link" href="#qualifications">查看本公司证照${icon('arrow')}</a></article>
            <article><h3>多车信息一次整理，减少漏项和反复说明</h3><p>企业车辆清单模板可直接复制使用，把车型、所在地、行驶状态、资料、批次和联系人一次整理清楚。多辆车逐项区分，交接安排和资料接收也有明确的核对起点。</p><p class="home-benefit-value"><strong>对企业经办人：</strong>先汇总、再对接，减少多地点、多批次处置时的信息遗漏，方便内部流转和后续核对。</p><a class="text-link" href="/services.html#vehicle-checklist-title">使用企业车辆清单${icon('arrow')}</a></article>
          </div>
        </div>
      </div></section>
      <section class="section home-process" id="process" aria-labelledby="process-title"><div class="container">
        <div class="section-heading"><div><h2 class="section-title" id="process-title">车辆回收咨询流程</h2><p class="section-intro">围绕车辆、材料、费用和交接，五步理清办理前后的沟通事项。</p></div><a class="text-link" href="/guide.html">查看详细准备清单${icon('arrow')}</a></div>
        ${stepsHtml()}
        <div class="home-preparation"><p><strong>第一次咨询，不知道从哪里说起？</strong>先整理车辆所在地、车型数量、能否行驶和资料情况。</p><a class="text-link" href="/guide.html#consultation-template">使用首次咨询模板${icon('arrow')}</a></div>
      </div></section>
      <section class="section soft" aria-labelledby="faq-title"><div class="container faq-layout">
        <div><h2 class="section-title" id="faq-title">车辆处置，您可能还关心</h2><p class="section-intro">咨询前怎么准备、不能行驶的车怎么拖运、企业多辆车怎么对接，先看这些常见问题。</p><a class="text-link" href="/guide.html#questions">查看全部问题${icon('arrow')}</a></div>
        ${faqHtml(homeFaqs)}
      </div></section>
      <section class="section home-certificates" id="qualifications" aria-labelledby="qualifications-title"><div class="container">
        <div class="section-heading"><div><h2 class="section-title" id="qualifications-title">企业资质与证照</h2><p class="certificate-company">证照载明企业名称：<strong>${qualificationDocuments.companyName}</strong></p><p class="section-intro">回收拆解企业资质认定证书与营业执照，点击证照可放大查看。</p></div></div>
        <div class="certificate-grid">${qualificationDocuments.pages.map((document, index) => `<figure class="certificate-card"><a class="certificate-preview" href="${document.image}" data-lightbox data-title="${document.title}" data-watermark="${qualificationDocuments.watermark}" data-caption="${qualificationDocuments.watermark}。" aria-label="放大查看${document.title}"><img src="${document.image}" width="${document.width}" height="${document.height}" alt="${document.title}，保留原有水印的完整页面" loading="lazy" decoding="async"><span class="certificate-zoom">${icon('zoom')}放大查看</span></a><figcaption><p>第 ${index + 1} 页</p><h3>${document.title}</h3></figcaption></figure>`).join('')}</div>
      </div></section>`,
  };
}
