# YangShi's Notes

这是我的个人技术笔记仓库，使用 VitePress 构建，并通过 GitHub Actions 自动部署到 GitHub Pages。

站点地址：

```text
https://zxhysy2003.github.io/
```

## 目录结构

```text
.
├── docs/                       # VitePress 文档目录
│   ├── index.md                # 首页
│   ├── projects/               # 项目复盘
│   ├── pitfalls/               # 踩坑记录
│   └── .vitepress/
│       └── config.mts          # 导航栏和侧边栏配置
├── .github/workflows/deploy.yml # GitHub Pages 自动部署流程
├── package.json                # 项目脚本和依赖
└── README.md
```

## 常用命令

安装依赖：

```bash
npm install
```

本地预览：

```bash
npm run docs:dev
```

启动后在浏览器打开终端里显示的地址，通常是：

```text
http://localhost:5173/
```

构建检查：

```bash
npm run docs:build
```

本地预览构建结果：

```bash
npm run docs:preview
```

## 上传新笔记的操作

### 1. 新建 Markdown 文件

在 `docs/` 下选择合适的分类目录，例如：

```text
docs/projects/        项目复盘
docs/pitfalls/        踩坑记录
docs/algorithms/      算法笔记
docs/tools/           工具使用
```

如果目录不存在，先创建目录。文件名建议使用小写英文和短横线，例如：

```text
docs/projects/recommendation-system.md
docs/pitfalls/git-pages-deploy.md
```

笔记内容至少要有一个一级标题：

```md
# 推荐系统项目复盘

这里写正文内容。
```

### 2. 更新导航或侧边栏

如果希望新笔记显示在侧边栏里，编辑：

```text
docs/.vitepress/config.mts
```

在对应分类的 `items` 中加入一项，例如：

```ts
{
    text: 'project review',
    items: [
        { text: 'Course System', link: '/projects/course-system' },
        { text: 'Recommendation System', link: '/projects/recommendation-system' },
    ]
}
```

注意：

- `link` 不需要写 `.md` 后缀。
- `docs/projects/recommendation-system.md` 对应的链接是 `/projects/recommendation-system`。
- 如果只是临时记录，也可以先不加到侧边栏，通过文件路径访问。

### 3. 本地检查

先启动本地预览：

```bash
npm run docs:dev
```

确认页面能打开、侧边栏链接正常、Markdown 渲染没问题。

然后执行构建检查：

```bash
npm run docs:build
```

如果构建成功，说明可以提交。

### 4. 提交并上传到 GitHub

查看改动：

```bash
git status
```

添加本次改动：

```bash
git add docs README.md
```

如果改了 VitePress 配置，也一起添加：

```bash
git add docs/.vitepress/config.mts
```

提交：

```bash
git commit -m "docs: add new note"
```

推送到 `main` 分支：

```bash
git push origin main
```

### 5. 等待自动部署

推送到 `main` 后，`.github/workflows/deploy.yml` 会自动运行 GitHub Actions：

1. 安装依赖
2. 执行 `npm run docs:build`
3. 上传 `docs/.vitepress/dist`
4. 部署到 GitHub Pages

部署完成后，访问：

```text
https://zxhysy2003.github.io/
```

如果页面没有马上更新，等一两分钟后刷新；也可以去 GitHub 仓库的 `Actions` 页面查看部署状态。

## 注意事项

- 不要手动提交 `node_modules/`。
- 不要手动提交 `docs/.vitepress/dist/`，它是构建产物，已经在 `.gitignore` 中忽略。
- 新增笔记后，如果希望首页也能看到，可以同步编辑 `docs/index.md`。
- 如果只是修改已有笔记，通常只需要改对应的 `.md` 文件，然后执行 `git add`、`git commit`、`git push`。
