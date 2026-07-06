# mihoyy.github.io

米乎是一个静态的米哈游相关资源导航站，整理常用站点入口、阅读资料，并提供原神、崩坏：星穹铁道、绝区零游戏内自创文字的在线翻译效果和字体下载。

## 页面

- `index.html`：站点首页，包含导航、翻译、阅读、工具和下载入口，并将关于与联系方式合并展示。
- `404.html`：404错误页面，当访问不存在的页面时显示，提供返回首页、返回上一页和浏览导航的链接。
- 共享导航栏提供中英文切换按钮；切换到英文时，会从字体清单中随机选择一个自创文字字体渲染英文文案。
- `navigation/`：卡片式网站导航，支持搜索和分类筛选。
- `reading/`：阅读模块，基于 `reading/GI-Ebook/` 的原神 Markdown 文本，支持列表、分类筛选、搜索、收藏、阅读进度和阅读偏好设置。
- `translator/`：文字翻译工具，左侧输入英文、拉丁文或希腊文并选择例句，右侧按游戏和自创语言两级切换，以字体渲染方式实时生成游戏内自创文字效果，并可在预览结果下方保存为 PNG 图片。
- `tools/`：工具集合页，汇总站内翻译、阅读、资源下载和导航检索入口，支持搜索和分类筛选。
- `download/`：资源下载页，目前提供 `fonts/` 下的字体文件下载，展示字体用途说明和字体例句，支持搜索和按游戏分类筛选；字体卡片悬停后显示游戏、格式、大小、文件名和下载入口。

## 字体资源

字体按游戏放置在 `fonts/` 目录：

- `fonts/Genshin-Impact/`
- `fonts/Honkai-Star-Rail/`
- `fonts/Zenless-Zone-Zero/`

翻译页和下载页共用 `js/font-data.js` 中的字体清单。清单包含字体名称、用途说明、文件路径、大小和例句；新增字体时，请同步补充该文件，并更新相关说明。

## CDN配置

项目使用 jsDelivr CDN 加速图片资源访问，配置文件位于 `js/cdn-config.js`。

### CDN地址格式
```
https://cdn.jsdelivr.net/gh/Haagentus/Haagentus.github.io@main/[文件路径]
```

### 配置选项
- `enabled`: 是否启用CDN（默认：true）
- `baseUrl`: CDN基础地址
- `fallbackToLocal`: CDN失败时是否回退到本地（默认：true）

### 使用方式
1. JavaScript文件中使用 `getImageUrl(path)` 函数获取CDN地址
2. Markdown文件中的图片已自动替换为CDN地址
3. CSS文件中的背景图已替换为CDN地址

### 注意事项
- 更新图片后，CDN缓存可能需要时间刷新
- 可通过添加版本号刷新缓存：`@v1.0.0/文件路径`
- 如需禁用CDN，修改 `js/cdn-config.js` 中的 `enabled` 为 `false`

## 阅读文本

`reading/GI-Ebook/` 存放原神游戏内文本 Markdown。阅读页使用 `reading/catalog.json` 作为索引；当 GI-Ebook 内容更新后，运行：

```bash
node scripts/build-text-catalog.mjs
```

重新生成索引。
