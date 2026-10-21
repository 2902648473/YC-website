# 玉成智造网站 · GitHub 发布源码

六个内容页面和一个自定义 404 页面，使用原生 HTML、CSS 和 JavaScript。Node.js 在构建时生成静态文件，网站运行不需要 Node.js 服务器、数据库或第三方前端依赖。

仓库：https://github.com/2902648473/YC-website

本仓库提供源码和自动构建流程。推送到 GitHub 不等于网站已经上线，也不等于百度已经收录。

## 本地使用

需要 Node.js 22 或更高版本；GitHub Actions 使用 Node.js 24。无需安装网站依赖。

```powershell
npm test
npm run build
npm run check
npm run preview
```

打开 http://127.0.0.1:4173/ 。预览仅监听本机，按 Ctrl+C 停止。改动源文件后重新构建；不要直接修改 dist。

## 从 GitHub 部署

在支持 GitHub 仓库连接的静态托管平台中，选择本仓库并填写：

| 项目 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 框架预设 | `None` / 无框架 |
| 项目根目录 | 仓库根目录 |
| Node.js | `24` |
| 构建命令 | `npm run build && npm run check` |
| 发布目录 | `dist` |

只将 `dist` 内容发布为网站。根目录中的源码和说明文档不属于网站公开文件。

网站使用 `/assets/...` 等根路径，需部署在域名根目录。不能原样部署到 `用户名.github.io/YC-website/` 这种子目录。当前没有配置 GitHub Pages 自动发布；业务网站选择适合其用途的静态托管服务。

也可以打开本仓库 **Actions → Build website → 成功的运行 → Artifacts → yc-website-dist**，下载构建包并将其中内容上传到静态托管根目录。该压缩包的首页应直接是 `index.html`，而不是嵌套的 `dist/index.html`。

## 正式域名与搜索收录

默认构建是预览模式，禁止索引。确认最终网址和公开内容后，在实际执行构建的平台配置：

| 环境变量 | 设置 |
| --- | --- |
| `SITE_URL` | 真实的 HTTPS 站点根网址，例如你已经绑定并验证可访问的正式域名；不填写 localhost 或仓库地址 |
| `SITE_INDEXING` | `true` 开放内容页索引；默认 `false` |

`SITE_INDEXING=true` 必须同时配置有效的 `SITE_URL`。构建会生成六个内容页的 canonical、分享信息及 sitemap.xml，允许内容抓取；404 页面始终禁止索引且不进入网站地图。预览构建不会擅自猜测域名。

GitHub Actions 的配置位置为 **Settings → Secrets and variables → Actions → Variables**，创建同名 Repository variables。它们是公开站点配置，不是密钥。保存后在 Actions 中手动重新运行工作流。若托管平台自行构建，也必须在该平台设置同名生产环境变量；GitHub 的变量不会自动传给外部平台。预览分支应保持 `SITE_INDEXING=false`。

本地生产构建示例（将网址替换成已确定的真实网址）：

```powershell
$env:SITE_URL = 'https://你的正式域名'
$env:SITE_INDEXING = 'true'
npm run build
npm run check
```

恢复本地预览配置：

```powershell
Remove-Item Env:SITE_URL -ErrorAction SilentlyContinue
Remove-Item Env:SITE_INDEXING -ErrorAction SilentlyContinue
npm run build
```

正式发布后核对：首页和六个内容页可访问，图片与联系方式正常，未知地址返回 HTTP 404，HTTPS 有效，robots.txt 允许抓取，sitemap.xml 使用唯一正式域名，服务器没有额外的禁止索引响应头。再到百度搜索资源平台验证站点并提交网址；是否收录、收录时间和关键词排名由搜索引擎决定。

本仓库保留当前企业展示内容。由个人维护不等于个人性质网站；网站主体、素材使用、备案及业务资质应与实际情况一致。

## 维护位置

- `src/data/`：联系方式、图文清单与关于页数据。
- `src/pages/`、`src/templates/`：页面与共用组件。
- `src/styles/`、`src/scripts/`：样式和浏览器交互。
- `public/`：构建所需公开图片与图标。
- `scripts/build.mjs`、`scripts/check.mjs`：构建与静态检查。
- `scripts/deployment-config.mjs`：正式网址与索引配置。

浏览器检查可运行 `npm run test:browser`，需要先启动预览，并提供可用的 Playwright 和 Chrome/Chromium。可通过 `PLAYWRIGHT_MODULE` 和 `BROWSER_EXECUTABLE` 指定本机工具路径。这些工具只用于开发测试，不进入网站发布目录。

本源码快照不包含原始 PPT/PDF、内部来源记录、代理配置、工作缓存或旧 Git 历史。公开素材的归属见 `THIRD_PARTY_NOTICES.md`。

## 官方参考

- GitHub Actions 构建包：https://docs.github.com/en/actions/tutorials/store-and-share-data
- 静态托管构建配置示例：https://developers.cloudflare.com/pages/configuration/build-configuration/
- GitHub Pages 使用范围：https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- 百度提交入口：https://ziyuan.baidu.com/linksubmit/index
