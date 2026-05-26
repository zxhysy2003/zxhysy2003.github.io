import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "YangShi's Notes",
    description: "notes",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' },
            { text: 'project review', link: '/projects/' },
            { text: 'algorithms', link: '/algorithms' },
            { text: 'development tools', link: '/tools' },
            { text: 'pitfalls', link: '/pitfalls' }
        ],

        sidebar: [
            {
                text: 'project review',
                items: [
                    { text: 'Course System', link: '/projects/course-system' },
                ]
            },
            {
                text: 'algorithms',
                items: [
                ]
            },
            {
                text: 'development tools',
                items: [
                ]
            },
            {
                text: 'pitfalls',
                items: [
                    { text: 'wsl中端口占用问题', link: '/pitfalls/端口占用--wsl' },
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/zxhysy2003' }
        ]
    }
})
