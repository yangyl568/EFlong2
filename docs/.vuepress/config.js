import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";
import { plumeTheme } from "vuepress-theme-plume";

export default defineUserConfig({
  bundler: viteBundler(),
  theme: plumeTheme({
    hostname: 'https://yangyl568.github.io/EFlong2/',
    notes: false,
    // 强制禁用自动侧边栏以规避索引 18 的 Bug，改为手动或使用默认行为
    autoFrontmatter: false,
    navbar: [
      { text: '首页', link: '/', icon: 'material-symbols:home-outline' },
      { 
        text: '八股文', 
        icon: 'material-symbols:article-outline',
        items: [
          { text: 'CSS 必备知识点', link: '/baguwen/css' },
          { text: 'JavaScript', link: '/baguwen/javascript' },
          { text: '前端工程化', link: '/baguwen/engineering' },
          { text: '框架', link: '/baguwen/frame' },
          { text: 'Node', link: '/baguwen/node' },
        ],
      },
      { 
        text: '积累', 
        icon: 'material-symbols:collections-bookmark-outline',
        items: [
          { text: '必备技能', link: '/jilei/bibeiskill' },
          { text: '扩展', link: '/jilei/kuozhan' },
          { text: '问题收集', link: '/jilei/error' },
          { text: 'Vue3项目', link: '/jilei/vue3' },
        ],
      },
    ],
    footer: {
      message: '个人前端笔记 · 记录成长',
      copyright: 'Copyright © 2024-present 逍遥生',
    },
    // 显式配置侧边栏深度，尝试规避渲染问题
    sidebarDepth: 2,
    plugins: {
      shiki: {
        languages: ['javascript', 'typescript', 'vue', 'bash', 'json', 'css', 'markdown'],
        theme: 'vitesse-dark',
      },
      markdownEnhance: {
        container: true,
        tabs: true,
        codetabs: true,
      },
    },
  }),
  lang: "zh-CN",
  title: "逍遥生-前端笔记",
  description: "前端面试 前端面试题 css javascript vue js 前端博客",
  head: [
    ["link", { rel: "icon", href: "/EFlong2/favicon.ico" }],
  ],
  base: "/EFlong2/",
});
