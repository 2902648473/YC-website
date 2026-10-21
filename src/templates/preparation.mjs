import { escapeHtml } from './components.mjs';

const vehicleFields = [
  ['车牌号／内部编号', '每辆车使用可核对的编号'],
  ['车辆类型', '按实际车辆类型填写'],
  ['所在地区', '写明实际停放地点'],
  ['能否行驶', '可行驶、不可行驶或尚不清楚'],
  ['现有资料状态', '分别写明登记证书、行驶证及号牌是否齐全'],
  ['计划批次', '按本次处置计划填写'],
  ['现场联系人', '填写可联系的现场人员'],
];

const vehicleTemplate = `${vehicleFields.map(([field]) => field).join('\t')}\n${vehicleFields.map(() => '________').join('\t')}\n${vehicleFields.map(() => '________').join('\t')}`;

const consultationText = [
  '车辆所在地：________',
  '车辆类型与数量：________',
  '目前能否行驶：________',
  '本人／代办／企业联系人：________',
  '现有资料及缺失情况：________',
  '最关心的问题：________',
].join('\n');

export function vehicleChecklist() {
  return `<div class="preparation-tool" aria-labelledby="vehicle-checklist-title">
    <h3 id="vehicle-checklist-title">企业车辆清单示例</h3>
    <p class="preparation-tool__intro">每辆车一行，分别写明所在地点和计划批次，方便逐车核对安排。</p>
    <p class="preparation-table-hint">左右滑动表格，查看完整字段。</p>
    <div class="preparation-table-scroll" role="region" aria-label="企业车辆清单字段整理提示，可横向滚动" tabindex="0">
      <table class="preparation-table">
        <caption class="visually-hidden">企业车辆清单的七个字段及填写提示</caption>
        <thead><tr>${vehicleFields.map(([field]) => `<th scope="col">${escapeHtml(field)}</th>`).join('')}</tr></thead>
        <tbody><tr>${vehicleFields.map(([, hint]) => `<td>${escapeHtml(hint)}</td>`).join('')}</tr></tbody>
      </table>
    </div>
    <div class="preparation-template preparation-template--compact">
      <label for="vehicle-checklist-template">空白清单</label>
      <p id="vehicle-checklist-help" class="preparation-template__help">复制到电子表格后填写，按车辆数量增加行。此清单用于咨询准备。</p>
      <textarea class="preparation-template__text preparation-template__text--table" id="vehicle-checklist-template" rows="3" readonly wrap="off" spellcheck="false" aria-describedby="vehicle-checklist-help">${escapeHtml(vehicleTemplate)}</textarea>
      <div class="preparation-template__actions"><button class="button button-outline js-only" type="button" data-copy-template="vehicle-checklist-template" data-copy-success="企业车辆空白清单已复制。">复制空白清单</button></div>
    </div>
  </div>`;
}

export function consultationTemplate() {
  return `<div class="consultation-template" aria-labelledby="consultation-template-title">
    <div class="consultation-template__intro">
      <h2 class="section-title" id="consultation-template-title">首次咨询信息模板</h2>
      <p>复制后补充车辆情况与最关心的问题，首次联系时可直接参照这份信息说明。</p>
      <p>暂时不清楚的项目可以注明情况；正式材料的接收人、用途与提供方式，在沟通后再确认。</p>
    </div>
    <div class="preparation-template">
      <label for="consultation-info-template">可复制的咨询内容</label>
      <textarea class="preparation-template__text" id="consultation-info-template" rows="6" readonly spellcheck="false" aria-describedby="consultation-template-help">${escapeHtml(consultationText)}</textarea>
      <div class="preparation-template__actions"><button class="button js-only" type="button" data-copy-template="consultation-info-template" data-copy-success="首次咨询信息模板已复制。">复制咨询模板</button><p id="consultation-template-help" class="preparation-template__help">也可选中文字手动复制。</p></div>
    </div>
  </div>`;
}
