import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getNotes, groupNotesByCategory, noteCategories } from './note-catalog.mjs'

const repositoryDirectory = fileURLToPath(new URL('../', import.meta.url))
const startMarker = '<!-- AUTO-GENERATED-NOTES:START -->'
const endMarker = '<!-- AUTO-GENERATED-NOTES:END -->'

function renderLink({ route, title }) {
    return `- [${title}](${route})`
}

function updateGeneratedBlock(relativePath, notes) {
    const filePath = resolve(repositoryDirectory, relativePath)
    const markdown = readFileSync(filePath, 'utf8')
    const startIndex = markdown.indexOf(startMarker)
    const endIndex = markdown.indexOf(endMarker)

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
        throw new Error(`${relativePath} is missing a valid generated-notes marker block.`)
    }

    const lines = notes.length > 0
        ? notes.map(renderLink)
        : ['_暂时还没有已整理的笔记。_']
    const generatedBlock = [startMarker, ...lines, endMarker].join('\n')
    const updatedMarkdown = `${markdown.slice(0, startIndex)}${generatedBlock}${markdown.slice(endIndex + endMarker.length)}`

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

updatedFileCount += Number(updateGeneratedBlock('docs/index.md', notes.slice(0, 3)))

for (const { slug } of noteCategories) {
    updatedFileCount += Number(updateGeneratedBlock(`docs/${slug}/index.md`, notesByCategory[slug]))
}

console.log(`[notes] Indexed ${notes.length} published note(s); changed ${updatedFileCount} page(s).`)
