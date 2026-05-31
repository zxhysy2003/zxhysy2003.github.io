// `.mjs` 表示这是一个 Node.js ES Module 文件，因此可以使用 import / export 语法。
// `node:fs`、`node:path` 和 `node:url` 都是 Node.js 自带模块，不需要额外安装。
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// `import.meta.url` 是当前脚本的 file URL。先以当前脚本为基准找到 `../docs/`，
// 再转换为普通文件系统路径，避免脚本从不同工作目录启动时找错位置。
const docsDirectory = fileURLToPath(new URL('../docs/', import.meta.url))

// `projects/` 与其他分类不同：它下面还会按照项目类型分组。
export const projectSections = [
    { slug: 'java', label: 'Java 项目' },
    { slug: 'agent', label: 'Agent 项目' }
]

// `slug` 对应 docs 下的目录名和 URL 前缀，`label` 用于页面侧边栏显示。
// 只有项目复盘带有 `sections`，因此稍后会为它生成多组侧边栏。
export const noteCategories = [
    { slug: 'projects', label: '项目复盘', sections: projectSections },
    { slug: 'java', label: 'Java 笔记' },
    { slug: 'agents', label: 'Agent 开发' },
    { slug: 'algorithms', label: '算法笔记' },
    { slug: 'tools', label: '开发工具' },
    { slug: 'pitfalls', label: '踩坑记录' }
]

/**
 * 递归扫描目录中的 Markdown 笔记。
 *
 * `flatMap` 会将每次回调返回的数组合并成一层数组：
 * - 遇到子目录时，返回递归扫描结果；
 * - 遇到普通笔记时，返回 `[filePath]`；
 * - 遇到其他文件或 `index.md` 时，返回 `[]` 表示忽略。
 */
function readMarkdownFiles(directory) {
    if (!existsSync(directory)) {
        return []
    }

    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const filePath = resolve(directory, entry.name)

        if (entry.isDirectory()) {
            return readMarkdownFiles(filePath)
        }

        if (entry.isFile() && extname(entry.name) === '.md' && entry.name !== 'index.md') {
            return [filePath]
        }

        return []
    })
}

/**
 * 读取 Markdown 顶部的简单 frontmatter，例如：
 *
 * ---
 * date: 2026-05-31
 * draft: true
 * ---
 *
 * 这里没有引入 YAML 库，只解析当前博客实际需要的 `key: value` 格式。
 */
function readFrontmatter(markdown) {
    const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)

    if (!frontmatter) {
        return {}
    }

    // `Object.fromEntries` 将形如 `[['date', '2026-05-31']]` 的数组转成对象。
    return Object.fromEntries(
        frontmatter[1]
            .split(/\r?\n/)
            .map((line) => line.match(/^([A-Za-z][\w-]*):\s*(.*?)\s*$/))
            .filter(Boolean)
            .map((match) => [match[1], match[2].replace(/^(['"])(.*)\1$/, '$2')])
    )
}

// 标题优先读取 frontmatter.title；没有配置时，再读取 Markdown 的一级标题。
function readTitle(markdown, frontmatter) {
    if (frontmatter.title) {
        return frontmatter.title
    }

    // `?.[1]` 是可选链：匹配失败时返回 undefined，而不是访问数组时报错。
    return markdown.match(/^#\s+(.+?)\s*$/m)?.[1]
}

// 将文件路径转换成 VitePress 路由，例如：
// docs/projects/java/course-system.md -> /projects/java/course-system
function toRoute(filePath) {
    return `/${relative(docsDirectory, filePath)
        .split(sep)
        .join('/')
        .replace(/\.md$/, '')}`
}

// 日期较新的笔记排在前面；日期相同时，再按照中文标题排序。
function compareNotes(firstNote, secondNote) {
    // `||` 表示当前一个比较结果为 0（相等）时，才执行后一个比较规则。
    return secondNote.date.localeCompare(firstNote.date)
        || firstNote.title.localeCompare(secondNote.title, 'zh-CN')
}

/**
 * 扫描所有分类并返回统一格式的笔记列表。
 *
 * `{ warn = false } = {}` 同时提供了两层默认值：
 * - 调用 `getNotes()` 时，参数默认为空对象；
 * - 没有传入 warn 时，warn 默认为 false。
 */
export function getNotes({ warn = false } = {}) {
    return noteCategories.flatMap((category) => {
        const categoryDirectory = resolve(docsDirectory, category.slug)

        return readMarkdownFiles(categoryDirectory).flatMap((filePath) => {
            const markdown = readFileSync(filePath, 'utf8')
            const frontmatter = readFrontmatter(markdown)
            const relativePath = relative(docsDirectory, filePath).split(sep).join('/')
            const categoryRelativePath = relative(categoryDirectory, filePath).split(sep).join('/')
            const title = readTitle(markdown, frontmatter)

            // frontmatter 由简单解析器处理，因此这里的值是字符串 `'true'`。
            if (frontmatter.draft === 'true') {
                return []
            }

            if (!title) {
                if (warn) {
                    console.warn(`[notes] Skipping ${relativePath}: add a level-one heading or frontmatter title to publish it.`)
                }

                return []
            }

            // `??` 是空值合并运算符：date 为 null 或 undefined 时使用空字符串。
            const date = /^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date ?? '')
                ? frontmatter.date
                : ''

            if (!date && warn) {
                console.warn(`[notes] ${relativePath} has no YYYY-MM-DD date, so it will appear after dated notes.`)
            }

            return [{
                category: category.slug,
                date,
                route: toRoute(filePath),
                // `?.` 是可选链。只有带 sections 的 projects 分类才会继续查找子分组。
                section: category.sections?.find(({ slug }) => categoryRelativePath.startsWith(`${slug}/`))?.slug,
                title
            }]
        })
    }).sort(compareNotes)
}

// 将扁平的笔记数组转换成 `{ projects: [...], agents: [...] }` 形式，方便按分类使用。
export function groupNotesByCategory(notes = getNotes()) {
    return Object.fromEntries(
        noteCategories.map(({ slug }) => [
            slug,
            notes.filter((note) => note.category === slug).sort(compareNotes)
        ])
    )
}

// 生成符合 VitePress themeConfig.sidebar 格式的对象。
export function createSidebar() {
    const notesByCategory = groupNotesByCategory()

    return Object.fromEntries(
        noteCategories.map((category) => [
            `/${category.slug}/`,
            createSidebarGroups(category, notesByCategory[category.slug])
        ])
    )
}

// 将内部笔记对象转换成 VitePress 侧边栏需要的 `{ text, link }` 格式。
function createSidebarItems(notes) {
    return notes.map(({ route, title }) => ({
        text: title,
        link: route
    }))
}

// 普通分类生成一个侧边栏分组；projects 分类按照 Java / Agent 项目生成多个分组。
function createSidebarGroups(category, notes) {
    if (!category.sections) {
        return [{
            text: category.label,
            items: createSidebarItems(notes)
        }]
    }

    const groups = category.sections.map(({ slug, label }) => ({
        text: label,
        items: createSidebarItems(notes.filter((note) => note.section === slug))
    }))
    // 如果项目笔记没有放在已知子目录中，仍然保留它，并归入“其他项目”。
    const otherNotes = notes.filter((note) => !note.section)

    if (otherNotes.length > 0) {
        groups.push({
            text: '其他项目',
            items: createSidebarItems(otherNotes)
        })
    }

    return groups
}
