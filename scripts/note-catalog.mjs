import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const docsDirectory = fileURLToPath(new URL('../docs/', import.meta.url))

export const noteCategories = [
    { slug: 'projects', label: '项目复盘' },
    { slug: 'algorithms', label: '算法笔记' },
    { slug: 'tools', label: '开发工具' },
    { slug: 'pitfalls', label: '踩坑记录' }
]

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

function readFrontmatter(markdown) {
    const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)

    if (!frontmatter) {
        return {}
    }

    return Object.fromEntries(
        frontmatter[1]
            .split(/\r?\n/)
            .map((line) => line.match(/^([A-Za-z][\w-]*):\s*(.*?)\s*$/))
            .filter(Boolean)
            .map((match) => [match[1], match[2].replace(/^(['"])(.*)\1$/, '$2')])
    )
}

function readTitle(markdown, frontmatter) {
    if (frontmatter.title) {
        return frontmatter.title
    }

    return markdown.match(/^#\s+(.+?)\s*$/m)?.[1]
}

function toRoute(filePath) {
    return `/${relative(docsDirectory, filePath)
        .split(sep)
        .join('/')
        .replace(/\.md$/, '')}`
}

function compareNotes(firstNote, secondNote) {
    return secondNote.date.localeCompare(firstNote.date)
        || firstNote.title.localeCompare(secondNote.title, 'zh-CN')
}

export function getNotes({ warn = false } = {}) {
    return noteCategories.flatMap((category) => {
        const categoryDirectory = resolve(docsDirectory, category.slug)

        return readMarkdownFiles(categoryDirectory).flatMap((filePath) => {
            const markdown = readFileSync(filePath, 'utf8')
            const frontmatter = readFrontmatter(markdown)
            const relativePath = relative(docsDirectory, filePath).split(sep).join('/')
            const title = readTitle(markdown, frontmatter)

            if (frontmatter.draft === 'true') {
                return []
            }

            if (!title) {
                if (warn) {
                    console.warn(`[notes] Skipping ${relativePath}: add a level-one heading or frontmatter title to publish it.`)
                }

                return []
            }

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
                title
            }]
        })
    }).sort(compareNotes)
}

export function groupNotesByCategory(notes = getNotes()) {
    return Object.fromEntries(
        noteCategories.map(({ slug }) => [
            slug,
            notes.filter((note) => note.category === slug).sort(compareNotes)
        ])
    )
}

export function createSidebar() {
    const notesByCategory = groupNotesByCategory()

    return Object.fromEntries(
        noteCategories.map(({ slug, label }) => [
            `/${slug}/`,
            [{
                text: label,
                items: notesByCategory[slug].map(({ route, title }) => ({
                    text: title,
                    link: route
                }))
            }]
        ])
    )
}
