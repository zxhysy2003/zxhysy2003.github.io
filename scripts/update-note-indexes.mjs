// 这个脚本负责修改 Markdown 页面中的自动生成区块。
// 笔记扫描、排序和分类规则集中定义在 note-catalog.mjs 中，避免重复实现。
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getNotes, groupNotesByCategory, noteCategories, projectSections } from './note-catalog.mjs'

// 始终相对当前脚本定位仓库根目录，避免依赖执行命令时所在的目录。
const repositoryDirectory = fileURLToPath(new URL('../', import.meta.url))

// 只有两个标记之间的内容会被脚本覆盖，标记外的手写内容会完整保留。
const startMarker = '<!-- AUTO-GENERATED-NOTES:START -->'
const endMarker = '<!-- AUTO-GENERATED-NOTES:END -->'

// 参数中的 `{ route, title }` 是对象解构，只取渲染链接需要的两个字段。
function renderLink({ route, title }) {
    return `- [${title}](${route})`
}

/**
 * 更新一个 Markdown 文件中的自动生成区块。
 *
 * @returns {boolean} 文件内容发生变化时返回 true，否则返回 false。
 */
function updateGeneratedBlock(relativePath, notes) {
    const filePath = resolve(repositoryDirectory, relativePath)
    const markdown = readFileSync(filePath, 'utf8')
    const startIndex = markdown.indexOf(startMarker)
    const endIndex = markdown.indexOf(endMarker)

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
        throw new Error(`${relativePath} is missing a valid generated-notes marker block.`)
    }

    // 三元表达式 `条件 ? A : B`：存在笔记时渲染列表，否则显示占位提示。
    const lines = notes.length > 0
        ? notes.map(renderLink)
        : ['_暂时还没有已整理的笔记。_']

    // `...lines` 是展开语法，将每一行插入数组中，再使用换行符拼接。
    const generatedBlock = [startMarker, ...lines, endMarker].join('\n')

    // `slice` 截取标记前后的手写内容，只替换中间的自动生成部分。
    const updatedMarkdown = `${markdown.slice(0, startIndex)}${generatedBlock}${markdown.slice(endIndex + endMarker.length)}`

    // 内容相同时不写回文件，使脚本可以重复执行而不产生无意义的 Git 改动。
    if (updatedMarkdown === markdown) {
        return false
    }

    writeFileSync(filePath, updatedMarkdown)
    console.log(`[notes] Updated ${relativePath}`)
    return true
}

const notes = getNotes({ warn: true })
const notesByCategory = groupNotesByCategory(notes)
let updatedFileCount = 0

// 首页只展示最新的三篇笔记。
updatedFileCount += Number(updateGeneratedBlock('docs/index.md', notes.slice(0, 3)))

// 更新每个顶层分类的“已整理”列表，例如 docs/agents/index.md。
for (const { slug } of noteCategories) {
    updatedFileCount += Number(updateGeneratedBlock(`docs/${slug}/index.md`, notesByCategory[slug]))
}

// projects 还包含 Java / Agent 子分类，因此额外更新对应子目录的索引页。
for (const { slug } of projectSections) {
    updatedFileCount += Number(updateGeneratedBlock(
        `docs/projects/${slug}/index.md`,
        notesByCategory.projects.filter((note) => note.section === slug)
    ))
}

console.log(`[notes] Indexed ${notes.length} published note(s); changed ${updatedFileCount} page(s).`)
