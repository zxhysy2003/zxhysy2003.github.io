# 笔记自动索引维护手册

这份手册记录博客目录结构变化时，需要修改哪些文件。

日常新增笔记通常不需要修改脚本。只要将 Markdown 文件放进已有分类目录，并执行：

```bash
npm run notes:update
```

`npm run docs:dev` 和 `npm run docs:build` 也会自动执行索引更新。

## 修改速查

| 需求 | 主要修改位置 | 还需要做什么 |
| --- | --- | --- |
| 新增一级分类 | `note-catalog.mjs` 中的 `noteCategories` | 新建 `docs/xxx/index.md`，按需增加导航和首页入口 |
| 新增项目分组 | `note-catalog.mjs` 中的 `projectSections` | 新建 `docs/projects/xxx/index.md`，按需更新项目总览 |
| 隐藏笔记 | 笔记 frontmatter | 增加 `draft: true` |
| 修改最近更新数量 | `update-note-indexes.mjs` | 修改 `notes.slice(0, 3)` 中的数字 |
| 修改排序 | `note-catalog.mjs` 中的 `compareNotes` | 调整比较规则 |
| 修改标题来源 | `note-catalog.mjs` 中的 `readTitle` | 调整 frontmatter 或 Markdown 标题读取规则 |
| 移动已发布笔记 | 笔记文件路径 | 检查 URL 是否变化，按需保留旧地址重定向 |

## 脚本职责

```text
scripts/
├── note-catalog.mjs          # 扫描笔记、解析元数据、排序、生成侧边栏
└── update-note-indexes.mjs  # 更新首页和分类页中的自动生成列表
```

页面中的以下标记用于限定自动生成区域：

```md
<!-- AUTO-GENERATED-NOTES:START -->
这里的内容由脚本维护
<!-- AUTO-GENERATED-NOTES:END -->
```

不要手工编辑两个标记之间的内容。脚本下次运行时会覆盖它。

## 日常新增笔记

将文件放进已有目录，例如：

```text
docs/java/spring-boot-notes.md
docs/agents/tool-calling-notes.md
docs/projects/java/course-system.md
docs/projects/agent/rag-assistant.md
```

建议添加日期和一级标题：

```md
---
date: 2026-05-31
---

# 笔记标题
```

执行：

```bash
npm run notes:update
npm run docs:build
```

## 隐藏笔记

在 frontmatter 中加入：

```md
---
date: 2026-05-31
draft: true
---
```

该文件仍然保留在仓库中，但不会出现在首页、分类页和侧边栏。

## 新增一级分类

例如新增数据库笔记目录 `docs/databases/`。

### 1. 修改分类配置

编辑 `scripts/note-catalog.mjs` 中的 `noteCategories`：

```js
export const noteCategories = [
    // ...
    { slug: 'databases', label: '数据库笔记' }
]
```

其中：

- `slug` 对应 `docs/` 下的目录名和 URL 前缀。
- `label` 是侧边栏中显示的分类名称。

### 2. 新建分类索引页

新建 `docs/databases/index.md`：

```md
# 数据库笔记

这里整理数据库相关笔记。

## 已整理

<!-- AUTO-GENERATED-NOTES:START -->
_暂时还没有已整理的笔记。_
<!-- AUTO-GENERATED-NOTES:END -->
```

### 3. 按需增加页面入口

如果希望分类显示在顶部导航栏，编辑 `docs/.vitepress/config.mts`：

```ts
{ text: '数据库笔记', link: '/databases/' },
```

如果希望分类显示在首页卡片中，编辑 `docs/index.md` 的 `features`。

### 4. 更新说明并验证

按需更新根目录 `README.md` 中的目录结构，然后执行：

```bash
npm run notes:update
npm run docs:build
```

## 新增项目分组

例如新增前端项目目录 `docs/projects/frontend/`。

### 1. 修改项目分组配置

编辑 `scripts/note-catalog.mjs` 中的 `projectSections`：

```js
export const projectSections = [
    // ...
    { slug: 'frontend', label: '前端项目' }
]
```

### 2. 新建项目分组索引页

新建 `docs/projects/frontend/index.md`：

```md
# 前端项目

这里收录前端项目复盘。

## 已整理

<!-- AUTO-GENERATED-NOTES:START -->
_暂时还没有已整理的笔记。_
<!-- AUTO-GENERATED-NOTES:END -->
```

### 3. 按需更新项目总览

如果希望项目总览页显示新分组入口，编辑 `docs/projects/index.md`：

```md
- [前端项目](./frontend/)
```

然后执行：

```bash
npm run notes:update
npm run docs:build
```

## 修改最近更新数量

编辑 `scripts/update-note-indexes.mjs`：

```js
updateGeneratedBlock('docs/index.md', notes.slice(0, 3))
```

其中 `3` 表示首页最多展示三篇最近更新。

## 修改排序规则

编辑 `scripts/note-catalog.mjs` 中的 `compareNotes`。

当前规则是：

1. 日期较新的笔记排在前面。
2. 日期相同时，按照中文标题排序。

```js
function compareNotes(firstNote, secondNote) {
    return secondNote.date.localeCompare(firstNote.date)
        || firstNote.title.localeCompare(secondNote.title, 'zh-CN')
}
```

## 修改标题来源

编辑 `scripts/note-catalog.mjs` 中的 `readTitle`。

当前规则是：

1. 优先读取 frontmatter 中的 `title`。
2. 没有配置时，读取 Markdown 的一级标题。

```js
function readTitle(markdown, frontmatter) {
    if (frontmatter.title) {
        return frontmatter.title
    }

    return markdown.match(/^#\s+(.+?)\s*$/m)?.[1]
}
```

## 移动或重命名已发布笔记

路由默认由文件路径生成。例如：

```text
docs/projects/java/course-system.md
-> /projects/java/course-system
```

移动或重命名文件会改变公开 URL。博客内部链接会在脚本运行后自动更新，但已有收藏、搜索引擎记录和外部链接可能失效。

移动已发布笔记前，应考虑是否需要保留旧地址的重定向页面。

## 验证清单

调整结构后执行：

```bash
npm run notes:update
npm run docs:build
git diff --check
git status
```

重点确认：

- 首页“最近更新”数量和顺序正确。
- 分类页“已整理”列表正确。
- 侧边栏分组和链接正确。
- 新增目录都包含 `index.md`。
- 没有误修改自动生成区块之外的内容。
