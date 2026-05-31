import { defineConfig } from 'vitepress'
import { createSidebar } from '../../scripts/note-catalog.mjs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    lang: 'zh-CN',
    title: "YangShi's Notes",
    description: '记录项目复盘、Java 后端、Agent 开发、算法笔记和工程踩坑的个人技术博客。',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: '首页', link: '/' },
            { text: '项目复盘', link: '/projects/' },
            { text: 'Java 笔记', link: '/java/' },
            { text: 'Agent 开发', link: '/agents/' },
            { text: '算法笔记', link: '/algorithms/' },
            { text: '开发工具', link: '/tools/' },
            { text: '踩坑记录', link: '/pitfalls/' }
        ],

        sidebar: createSidebar(),

        search: {
            provider: 'local'
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/zxhysy2003' }
        ]
    }
})
