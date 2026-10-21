import { gallery, supplementalGallery } from '../data/site.mjs';
import { consultationTemplate } from '../templates/preparation.mjs';
import { industryOverview } from '../templates/industry.mjs';
import { renderServices } from './services.mjs';
import { renderAbout } from './about.mjs';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export function renderInnerPages({ site, helpers }) {
  const { faqHtml, photoHtml, icon } = helpers;
  const brand = escapeHtml(site.brandName);
  const contact = escapeHtml(site.contactName);
  const phone = escapeHtml(site.phone);
  const phoneHref = escapeHtml(site.phoneHref);
  const region = escapeHtml(site.region);
  const wechatImage = escapeHtml(site.wechatImage);

  return {
    services: renderServices({ site, helpers }),

    guide: {
      title: `咨询与办理准备｜${site.brandName}`,
      description: '了解个人与企业车辆咨询的信息清单、资料缺失与异地车辆等常见情景，以及交接记录、后续材料和查询联系的整理建议。',
      heading: '咨询与办理准备',
      intro: '把车辆情况、资料状态和交接要求准备好，让每次沟通更具体。',
      body: `
        <section class="section" id="consultation-template"><div class="container">${consultationTemplate()}</div></section>
        <section class="section soft" id="preparation">
          <div class="container">
            <div class="guide-introduction"><div><h2 class="section-title">咨询前，先整理一份基本信息</h2><p class="section-intro">先说明车辆与需求，再了解适用的受理和材料要求。以下内容供咨询准备使用；具体提交材料及办理安排，由实际承接单位说明。</p></div><a class="text-link" href="/index.html#process">查看首页五步流程 ${icon('arrow')}</a></div>
            <div class="guide-preparation">
              <article class="guide-preparation__column"><h3>${icon('car')} 个人车主</h3><dl class="guide-info-list"><div><dt>车辆基本情况</dt><dd>车辆类型、当前所在地、能否正常行驶，以及是否存在影响交接的停放或移动条件。</dd></div><div><dt>登记与权属情况</dt><dd>车辆登记人与实际联系人的关系；如涉及代办、权属信息差异，先说明情况。</dd></div><div><dt>现有资料状态</dt><dd>整理已持有的车辆及身份相关资料，列出缺失或信息不一致的部分，咨询时一并说明。</dd></div><div><dt>处置意向与问题</dt><dd>希望了解的受理、拖运、费用或后续手续问题，以及您方便联系和交接的时间。</dd></div></dl></article>
              <article class="guide-preparation__column" id="enterprise-preparation"><h3>${icon('building')} 企业与车队</h3><dl class="guide-info-list"><div><dt>车辆基础清单</dt><dd>按车辆类型、所在地点、基本车况和计划批次整理，便于区分不同车辆的安排。</dd></div><div><dt>内部对接关系</dt><dd>明确业务联系人、车辆管理人员和资料接收人员，说明内部审批与授权的进度。</dd></div><div><dt>计划与现场条件</dt><dd>说明预期批次、停放地点和现场交接条件；多个地区的车辆可分别列明。</dd></div><div><dt>归档与结果需求</dt><dd>提前列出企业需要留存的交接记录、结果资料及内部归档要求，便于双方沟通。</dd></div></dl></article>
            </div>
            <p class="note guide-preparation-note">首次咨询可先提供基本描述。涉及个人、企业或车辆资料时，确认接收单位、用途与提供方式后再提交。</p>
          </div>
        </section>

        <section class="section">
          <div class="container"><div class="section-heading"><h2 class="section-title">需要提前说明的特殊情况</h2><p class="section-intro">不同车辆的准备重点可能不同。提前说明特殊情况，有助于减少后续反复沟通。</p></div><div class="guide-situations"><article><h3>资料缺失或信息不一致</h3><p>列出缺少哪类资料、哪些登记信息与现状不一致，以及目前能够提供的说明。先沟通受理条件与处理途径，再准备后续材料。</p></article><article><h3>车辆无法行驶或异地停放</h3><p>说明实际停放地区、车辆移动条件和现场联系人。拖运能否安排、交接地点、时间及费用，需要结合车辆情况具体沟通。</p></article><article><h3>企业分批或多地点处置</h3><p>将车辆按地点与批次分组，标明各组负责人和资料状态。交接时逐组核对，结果材料也按相同批次归档。</p></article></div></div>
        </section>
        <section class="section soft" id="process">
          <div class="container"><div class="section-heading"><h2 class="section-title">交接与后续结果核对</h2><p class="section-intro"><strong>把交接记录与后续材料对应保存，才能清楚跟进每辆车或每个批次。</strong>记录中应便于找到车辆、交接事项和负责联系的人员。</p></div><div class="guide-confirmation"><article><h3>交接前后</h3><dl class="guide-info-list"><div><dt>确认承接与交接安排</dt><dd>核对实际承接及签约单位、时间、地点、拖运安排与费用约定，记下现场交接和资料接收人员，确认各自负责的事项。</dd></div><div><dt>逐项清点车辆与资料</dt><dd>按车辆或批次核对数量、车况和随附资料。缺失、信息不一致或与原沟通有变化的部分，单独记录并确认补充及处理方式。</dd></div><div><dt>留存双方认可的记录</dt><dd>确认记录所对应的车辆、批次和交接内容，了解双方如何确认与保存。企业客户可与内部审批及车辆清单一起归档。</dd></div></dl></article><article><h3>后续跟进</h3><dl class="guide-info-list"><div><dt>核对结果资料</dt><dd>按约定核对收到的材料种类、车辆与单位信息；尚未取得的材料继续记录负责方和取得方式，便于后续跟进。</dd></div><div><dt>按约定节点查询</dt><dd>保留查询联系人与渠道，了解当前进展及需要补充配合的事项。交付方式或安排有变化时，同步更新已有记录。</dd></div><div><dt>发现问题及时反馈</dt><dd>说明对应车辆或批次、具体差异及已收到的材料，附上相关沟通和交接记录，便于业务人员查找并继续对接。</dd></div></dl></article></div></div>
        </section>
        <section class="section" id="questions"><div class="container guide-questions"><div class="guide-questions__intro"><h2 class="section-title">常见问题</h2><p>进一步了解首次咨询、交接准备与后续结果的核对方法。</p><a class="text-link" href="/contact.html">联系${contact} ${icon('arrow')}</a></div><div>${faqHtml()}</div></div></section>`,
    },

    facilities: {
      title: `工艺与产业协同｜${site.brandName}`,
      description: '通过集团工艺场景，了解车辆举升拆解、作业工位、回用件仓储和资源循环利用场景，并查看相关合作沟通方向。',
      heading: '工艺与产业协同',
      intro: '从车辆拆解到零部件回用与资源利用，了解集团资料中的产业环节。',
      body: `
        ${industryOverview()}
        <section class="section soft" id="group-gallery">
          <div class="container"><div class="section-heading"><h2 class="section-title">工艺与产业场景</h2><p class="section-intro">车辆拆解、回用件仓储与后端资源利用，从不同侧面展示汽车循环利用产业。图片可放大查看。</p></div>
            <div class="facilities-features">
              <article class="facilities-feature">${photoHtml(gallery[1])}<div class="facilities-feature__copy"><h3>拆解作业与分类</h3><dl class="guide-info-list"><div><dt>处理对象</dt><dd>以整车及拆出的零部件、材料为对象，集团资料以“全流程精拆”介绍相关业务方向。</dd></div><div><dt>环节作用</dt><dd>拆解工位、人员与分类安排相互配合，将车辆中的不同资源对象分离并对应记录。</dd></div><div><dt>后续联系</dt><dd>部件与材料按各自状态和用途，进一步衔接回用件、再制造或材料加工环节。</dd></div></dl></div></article>
              <article class="facilities-feature facilities-feature--reverse">${photoHtml(gallery[2])}<div class="facilities-feature__copy"><h3>回用件仓储与信息对应</h3><dl class="guide-info-list"><div><dt>处理对象</dt><dd>拆解分类后的汽车零部件。集团相得易配业务资料介绍回用件销售与流通，并展示零部件仓储场景。</dd></div><div><dt>环节作用</dt><dd>通过分类存放和部件信息对应，连接入库、查找与需求沟通，重点核对车型、部件名称、状态和用途。</dd></div><div><dt>后续联系</dt><dd>结合具体需求了解适配、库存及交付要求。资料照片用于理解仓储环节，实际可供资源需进一步沟通。</dd></div></dl></div></article>
              <article class="facilities-feature">${photoHtml(supplementalGallery[2])}<div class="facilities-feature__copy"><h3>后端加工与材料利用</h3><dl class="guide-info-list"><div><dt>处理对象</dt><dd>拆解分类后的材料与相关资源。集团滁州产业园资料涉及废钢生产加工、轮胎加工及总成件集散等方向。</dd></div><div><dt>环节作用</dt><dd>将前端分类结果与后端接收、加工需求相对应，不同资源类别衔接不同的利用环节。</dd></div><div><dt>后续联系</dt><dd>项目交流需说明资源类别、状态、数量及所在地点，再了解接收要求、处理条件和参与单位。</dd></div></dl></div></article>
            </div>
          </div>
        </section>
        <section class="section"><div class="container"><div class="section-heading"><h2 class="section-title">业务咨询与合作</h2><p class="section-intro">根据车辆或项目需求，了解相应的业务事项；具体合作资源、参与单位与责任分工结合项目确认。</p></div><div class="facilities-chain"><article><h3>个人车辆</h3><p>介绍车辆类型、所在地与现状，了解受理条件和交接准备。</p><a class="text-link" href="/services.html#personal">了解车辆咨询 ${icon('arrow')}</a></article><article><h3>企业车辆</h3><p>按车辆地点与批次整理清单，说明现场条件和内部协同要求。</p><a class="text-link" href="/services.html#enterprise">了解企业对接 ${icon('arrow')}</a></article><article><h3>产业合作</h3><p>说明项目地点、资源类别、现有条件和拟参与的环节，进一步讨论接收要求、交付内容及各方职责。</p><a class="text-link" href="/services.html#cooperation">了解合作事项 ${icon('arrow')}</a></article></div></div></section>`,
    },

    about: renderAbout({ site, helpers }),

    contact: {
      title: `联系我们｜${site.brandName}`,
      description: `联系${site.brandName}${site.contactName}，电话${site.phone}，所在区域${site.region}。了解电话、微信和来访沟通方式，并查看首次咨询准备建议。`,
      heading: '联系我们',
      intro: '车辆咨询、企业车辆处置与产业合作，欢迎联系业务人员说明您的需求。',
      body: `
        <section class="section"><div class="container contact-layout">
          <div class="contact-details"><h2>${contact}</h2><p class="contact-details__brand">${brand} · ${region}</p><dl class="contact-methods"><div><dt>${icon('phone')} 联系电话</dt><dd><a class="contact-phone" href="${phoneHref}">${phone}</a><button type="button" class="contact-copy js-only" data-copy-phone data-phone="${phone}">复制电话</button></dd></div><div><dt>${icon('location')} 所在区域</dt><dd>${region}</dd></div><div><dt>${icon('wechat')} 微信联系</dt><dd>扫描页面中的二维码添加微信。手机可保存联系图片，再在微信中识别二维码。</dd></div></dl><div class="button-row"><a class="button" href="${phoneHref}">${icon('phone')} 电话咨询</a><a class="button button-outline" href="${wechatImage}" data-wechat>${icon('wechat')} 放大查看二维码</a></div><div class="contact-visit-note"><h3>来访安排</h3><p>如需来访，请先联系${contact}说明目的、人数及希望讨论的事项，确认具体地点、接待人员与时间后再规划行程。</p></div></div>
          <figure class="contact-poster"><a href="${wechatImage}" data-wechat aria-label="放大查看${contact}的微信二维码"><img src="${wechatImage}" width="960" height="1424" alt="${contact}的联系图片，包含电话${phone}和微信二维码" fetchpriority="high"></a><figcaption><strong>微信联系${contact}</strong><span>点击图片放大查看二维码。手机可保存联系图片后，在微信中识别。</span><a class="text-link" href="${wechatImage}" download>保存联系图片 ${icon('arrow')}</a></figcaption></figure>
        </div></section>
        <section class="section soft"><div class="container"><div class="section-heading"><h2 class="section-title">首次联系，可以这样介绍</h2><p class="section-intro">先说明所在地、车辆或项目情况及具体需求；需要补充资料时，确认接收人、用途与提供方式。</p></div><div class="contact-topics"><article><h3>个人车辆</h3><blockquote>“我的车辆在……，车型是……，目前可以／不能正常行驶，想了解车辆回收和交接准备。”</blockquote><p>可补充车辆登记、资料情况，以及您最关心的问题。</p><a class="text-link" href="/guide.html#preparation">查看个人准备清单 ${icon('arrow')}</a></article><article><h3>企业车辆</h3><blockquote>“我们有一批车辆计划处置，分别位于……，希望按……批次沟通，想了解受理与交接安排。”</blockquote><p>可补充数量、基本车况、内部审批和资料接收要求。</p><a class="text-link" href="/services.html#enterprise">查看企业对接事项 ${icon('arrow')}</a></article><article><h3>产业合作</h3><blockquote>“我们关注……环节，项目在……，已有……资源，希望交流……方面的合作。”</blockquote><p>可补充项目阶段、参与单位和希望对接的具体内容。</p><a class="text-link" href="/services.html#cooperation">查看产业合作方向 ${icon('arrow')}</a></article></div></div></section>`,
    },

    '404': {
      title: `页面未找到｜${site.brandName}`,
      description: '您访问的页面暂时无法找到。可以返回玉成智造首页、查看业务服务或联系业务人员。',
      heading: '页面未找到',
      intro: '您访问的页面可能已移动，或链接地址有误。',
      body: `<section class="section"><div class="container error-content"><p class="error-number" aria-hidden="true">404</p><h2>继续了解${brand}</h2><p>您可以返回首页查看业务介绍，或直接联系${contact}沟通。</p><div class="button-row"><a class="button" href="/index.html">返回首页</a><a class="button button-outline" href="/contact.html">联系业务人员 ${icon('arrow')}</a></div></div></section>`,
    },
  };
}
