# 素材与工具说明

网站使用 React、TanStack Start / Router、Vite 和 Cloudflare Workers。所用依赖及其精确版本保存在 package-lock.json；各依赖遵循自身许可证。网站不加载第三方在线字体、地图 SDK 或分析脚本。

企业标识、车辆拆解及仓储照片、微信联系卡、企业证照预览来自项目方提供的材料，相关权利归其各自权利人所有。它们不因存放于公开 GitHub 仓库而被授予开源或再使用许可。工艺照片包含集团资料，不应擅自解释为上海基地实拍。证照预览展示其载明的信息，不等于对任何主体身份或授权关系的额外认证。

原始 PPT/PDF、内部来源核对记录、未被当前网站使用的旧联系人图片均不包含在本源码快照中。Vite 会发布 public/ 中的全部文件；只应在其中保存可以公开的素材。

图片在本地使用 Pillow（MIT-CMU License）、pypdfium2 和 Poppler 等工具处理，工具程序及二进制不随网站分发。可选浏览器验收使用 Playwright（Apache-2.0）及本机浏览器，它们不属于网站运行依赖。

- Pillow：https://github.com/python-pillow/Pillow
- pypdfium2：https://github.com/pypdfium2-team/pypdfium2
- Poppler：https://poppler.freedesktop.org/
- Playwright：https://github.com/microsoft/playwright

项目未授权通用开源许可；企业素材和证照的公开使用范围由项目方确认。
