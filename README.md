# 玉成智造官网 · TanStack Start + Cloudflare Workers

六个中文内容页、图片与微信预览、手动轮播、咨询模板复制和自定义 404。使用 React + TypeScript，TanStack Start 在 Worker 中渲染 HTML；禁用 JavaScript 后仍能阅读正文、使用导航、打开联系图片和工艺原图。无需数据库。

源码仓库：[2902648473/YC-website](https://github.com/2902648473/YC-website)。当前已准备部署配置，Cloudflare 上的创建和上线由维护者操作。GitHub 源码地址不是网站访问地址。

## 1. 从 GitHub 部署到 Cloudflare Worker

在 Cloudflare 的 **Workers & Pages** 中创建应用，选择连接 GitHub 仓库的 Worker 流程，授权访问本仓库，然后填写：

| 配置项 | 填写内容 |
| --- | --- |
| GitHub 仓库 | `2902648473/YC-website` |
| 生产分支 | `main` |
| Worker 名称 | `yc-website`，与 `wrangler.jsonc` 的 `name` 一致 |
| 项目根目录 | 仓库根目录 `/` |
| 构建命令 | `npm run check && npm test && npm run build` |
| 部署命令 | `npx wrangler deploy` |
| 构建变量 | `NODE_VERSION=24` |

平台按 `package-lock.json` 安装依赖；如果要求填写安装命令，使用 `npm ci`。Worker 名称已被自己的其他项目使用时，请先同步修改配置文件和界面中的名称。

本项目采用 [Cloudflare 官方 TanStack Start 集成](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)，Vite 生成 `dist/client` 浏览器资源和 `dist/server` Worker 程序。`wrangler deploy` 读取 `.wrangler/deploy/config.json` 指向的构建配置，一并上传程序与资源。**不要设置为只上传 dist 的静态站点，也不需要填写 Pages 输出目录。**

部署成功后，用 Cloudflare 界面显示的实际 `workers.dev` 地址验收。该地址取决于你的账号子域名，本仓库不预设地址。后续向 `main` 推送代码会触发已连接的 Workers Builds；设置说明见 [Cloudflare 文档](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)。本仓库的 GitHub Actions 只执行检查，不部署、不保存 Cloudflare 令牌。

## 2. 绑定正式域名和开启搜索收录

首次部署默认关闭收录，页面正常访问，但不会主动要求搜索引擎收录测试网址。先验收网站，再绑定正式域名。

1. 将自己的域名接入 Cloudflare，在 Worker 的 **Settings → Domains & Routes → Add → Custom Domain** 添加正式域名，等待 DNS 与证书生效。参考 [Custom Domains 官方步骤](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)。
2. 编辑仓库根目录 `wrangler.jsonc` 的 `vars`。将 `SITE_URL` 填为实际 HTTPS 域名根地址，例如 `https://www.example.com`；正式准备被收录时，将 `SITE_INDEXING` 改为字符串 `"true"`。
3. 提交到 `main` 并等待重新部署。确认正式网址的页面源代码存在正确的 canonical 和 `index, follow`，`/robots.txt` 允许抓取，`/sitemap.xml` 返回六个内容页。
4. 在百度搜索资源平台等站长平台添加并验证实际域名，按平台当前可用入口提交网址或站点地图。收录、展示时间和“报废车回收”的排名由搜索引擎决定，上线不等于立即能搜到。

`SITE_URL` 和 `SITE_INDEXING` 是 **Worker 运行时变量**，不是 `VITE_*` 构建变量。以仓库中的 `wrangler.jsonc` 为配置来源；只改 Cloudflare 面板的同名变量，后续部署可能被文件覆盖。虽然扩展名是 `.jsonc`，本项目校验脚本要求保持合法 JSON，不加入注释。只有请求来源与 `SITE_URL` 完全一致才开放收录，其他预览域名继续 `noindex`。关闭收录时 sitemap 返回 404，这是预期行为。

如果通过文件管理域名，可在 `wrangler.jsonc` 增加 `routes: [{ "pattern": "你的实际域名", "custom_domain": true }]`，并保证该域名已在对应 Cloudflare 账号生效。不要提交示例域名。

## 3. 本地运行与检查

使用 Node.js 24（最低 22.12.0），依赖版本已锁定。

```sh
npm ci
npm run dev
```

开发网址为 `http://127.0.0.1:3000/`，由 Cloudflare Vite 插件在本地 Worker 运行时执行；修改 React、样式后自动更新。

验证生产构建：

```sh
npm run check
npm test
npm run build
npm run deploy:check
npm run preview
```

打开 `http://127.0.0.1:4173/`。另开终端运行 `npm run test:smoke`，检查 SSR 正文、状态码、资源、锚点、旧首页重定向和 SEO 端点。`deploy:check` 使用 `--dry-run`，不上传、不部署。停止服务用 Ctrl+C。换端口可加 `-- --port 4180`，冒烟检查对应加 `-- --url http://127.0.0.1:4180/`。

`npm run test:browser` 复用已有 Playwright 与浏览器，覆盖手机/桌面、键盘导航、弹窗、轮播滑动、复制成功与失败、禁用 JS 和减少动画；可用 `PLAYWRIGHT_MODULE` / `BROWSER_EXECUTABLE` 指定已有安装。脚本不自动下载浏览器。缩放检查是视口重排近似，不代表真实浏览器缩放测试。

也可在自己的终端登录并部署：

```sh
npx wrangler login
npm run deploy
```

这两条命令涉及你的 Cloudflare 账号和真实部署。

## 4. 文件与维护

| 位置 | 用途 |
| --- | --- |
| `src/routes/` | TanStack 文件路由、SSR 文档、robots 与 sitemap |
| `src/components/pages/` | 六个内容页与 404 的 React 组件 |
| `src/components/shared.tsx` | 导航、页脚、弹窗、轮播、复制与共用组件 |
| `src/data/site.mjs`、`about.mjs` | 联系方式、问答、图片、集团历程 |
| `src/data/pages.ts` | 各页标题、描述和内页导语 |
| `src/styles/` | 既有蓝绿企业风格及响应式样式 |
| `public/` | 会公开发布的品牌、联系图片、证照与工艺素材 |
| `src/lib/deployment-config.mjs` | 域名校验、收录策略与 sitemap |
| `wrangler.jsonc`、`vite.config.ts` | Cloudflare 与框架构建配置 |
| `.github/workflows/build.yml` | 安装、类型检查、测试、构建、dry-run 和 HTTP 验证 |

首页是 `/`；原 `/index.html` 永久重定向到首页，保留查询参数和锚点。其余页面仍使用 `/services.html`、`/guide.html`、`/facilities.html`、`/about.html`、`/contact.html`。不存在的地址返回真正的 HTTP 404。

`src/routeTree.gen.ts` 由 TanStack 插件生成并随源码提交，使干净克隆可以先执行类型检查；新增路由后运行构建更新它。`worker-configuration.d.ts` 由 `npm run check` 自动生成。不要编辑 `dist/` 或上传 `node_modules`、本地密钥、原始内部资料。素材来源见 `THIRD_PARTY_NOTICES.md`。

## 5. 上线验收

- 在实际域名打开六个页面和不存在的地址，确认 200/404、手机菜单、图片放大、复制、电话和微信入口可用。
- 用真实微信验证二维码；浏览器检查不能替代微信客户端确认。
- 面向中国大陆访客时，在大陆手机流量和宽带上实际测量可达性与加载速度。本地 Worker 测试不能证明公网体验。
- 搜索收录前确认正式域名、页面标题、企业资料与联系信息，完成站长平台验证。当前没有在线预约提交、支付或客户信息存储功能。

GitHub Actions 成功后可以下载 `yc-website-worker-build` 留档，包含完整 `dist`。推荐通过 Git 连接重新构建部署；离线检查产物需同时保留 client/server 目录，不能只取其中一半。
