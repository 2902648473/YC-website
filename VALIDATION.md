# TanStack Start / Workers 迁移验证

2026-10-22，在 Windows + Node.js 24.22.0 下验证本次迁移；Cloudflare 线上部署由维护者后续执行。

- 从用于 GitHub 的独立源码目录执行 `npm ci`：安装成功，审计报告 0 个已知漏洞。
- `npm run check`：运行时设置校验、Wrangler 类型生成及 TypeScript 检查通过。
- `npm test`：5 项收录与域名规则测试通过。
- `npm run build` 和 `npm run deploy:check`：生成 Worker 与浏览器资源；dry-run 成功，Worker 压缩体积约 240 KiB。没有上传到 Cloudflare。
- `npm run preview` 的本地 Worker 生产预览 + `test:smoke`：六页 SSR、真实 404、51 个本地链接/资源、锚点、301 首页重定向及 robots/sitemap 通过。
- 现有 Playwright 浏览器脚本：52/52 通过。覆盖 320、375、768、1440 CSS px、菜单键盘导航、图片弹窗焦点恢复、证照水印、轮播方向键/触摸滑动、图片失败恢复、真实剪贴板读回、复制拒绝/不可用、禁用 JS 与减少动画。
- 将原模板输出与 React SSR 正文逐页比对：7 页文字内容一致。已目视检查首页手机与桌面截图。
- 使用本地 Worker 运行时注入测试域名验证正式收录：页面 canonical、robots.txt、六页 sitemap 正确；预览来源保持 noindex、禁抓取与 sitemap 404。测试域名未写入发布配置。
- 按项目 web-design-guidelines 技能检查改动的 React 页面与交互，依据 [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)：检查语义、控件名称、标签、焦点、键盘、图片尺寸与替代文本、响应式和减少动画。

Vite 构建成功时仍有上游 `vite:css-post` 的 SSR CSS source map 提示，不影响本次页面、Worker 运行与部署预检查；需要调试 CSS 映射时应留意该限制。

未覆盖 Cloudflare 真实账号部署、实际域名与大陆公网速度、微信客户端扫码有效性、搜索引擎收录。200% 缩放检查为视口重排近似，不声称完成真实浏览器缩放验证。

## 2026-10-22 线上首页 500 修复

- 只读访问 `https://yucheng.dpdns.org/` 确认 HTTP 500，服务端错误为 `SITE_URL must be an absolute HTTPS domain`；GitHub 提交 `5b352e8` 的配置缺少 `https://`。
- 修正正式域名为 `https://yucheng.dpdns.org`，保留已开启的收录设置。运行时只对明确的 SEO 配置错误关闭收录并记录日志，正常显示页面；构建阶段继续严格拒绝错误配置。
- 类型检查、7 项单元测试、生产构建与部署 dry-run 全部通过。
- 生产 Worker 本地运行时验证：正确域名、缺少 HTTPS 前缀、JSON 布尔值三种场景下，六个内容页均返回 200；正确配置生成 canonical 和六页 sitemap，错误配置移除 canonical、robots 禁抓取、sitemap 返回 404。
- 本地生产预览验证：六页 SSR、404、51 个链接与资源、重定向和 SEO 端点通过；现有浏览器回归 52/52 通过。
- 此记录中的修复验证在本地完成；线上恢复需等待 Cloudflare 部署新提交后另行确认。
