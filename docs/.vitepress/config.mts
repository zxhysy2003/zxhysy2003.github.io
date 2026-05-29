import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    lang: 'zh-CN',
    title: "YangShi's Notes",
    description: '记录项目复盘、后端开发、算法笔记和工程踩坑的个人技术博客。',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: '首页', link: '/' },
            { text: '项目复盘', link: '/projects/' },
            { text: '算法笔记', link: '/algorithms/' },
            { text: '开发工具', link: '/tools/' },
            { text: '踩坑记录', link: '/pitfalls/' }
        ],

        sidebar: {
            '/projects/': [
                {
                    text: '项目复盘',
                    items: [
                        { text: '智能课程学习系统', link: '/projects/course-system' },
                    ]
                }
            ],
            '/pitfalls/': [
                {
                    text: '踩坑记录',
                    items: [
                        { text: 'WSL 端口占用问题', link: '/pitfalls/端口占用--wsl' },
                    ]
                }
            ]
        },

        search: {
            provider: 'local'
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/zxhysy2003' }
        ]
    }
})
