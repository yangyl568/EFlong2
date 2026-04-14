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
    lastUpdated: false,
    navbar: [
      { text: '首页', link: '/', icon: 'material-symbols:home-outline' },
      { 
        text: '前端学习', 
        icon: 'material-symbols:article-outline',
        items: [
          { text: 'CSS 必备知识点', link: '/baguwen/css' },
          { text: 'JavaScript', link: '/baguwen/javascript' },
          { text: '前端工程化', link: '/baguwen/engineering' },
          { text: '框架', link: '/baguwen/frame' },
          { text: 'Node', link: '/baguwen/node' },
          { text: 'ES6', link: '/baguwen/es6' },
          { text: '小程序优化', link: '/jilei/miniprogram' },
        ],
      },
      { 
        text: '积累', 
        icon: 'material-symbols:collections-bookmark-outline',
        items: [
          { text: '必备技能', link: '/jilei/bibeiskill' },
          { text: 'npm发布', link: '/jilei/npm发布' },
          { text: '规范整理', link: '/jilei/规范整理' },
          { text: '问题收集', link: '/jilei/error' },
          { text: 'qiankun微应用', link: '/jilei/qiankun' },
          { text: 'electron相关', link: '/jilei/electron' },
          { text: '搭建 gitlab 环境', link: '/jilei/gitlab' },
          { text: 'Vue3VSReact', link: '/jilei/Vue3VSReact' },
          { text: 'ECS部署项目', link: '/jilei/ECS部署项目' },
          // { text: 'whistle', link: '/jilei/whistle' },
          // { text: 'jenkins多分支', link: '/jilei/jenkins多分支' },
        ],
      },
      { text: '关于我', link: '/resume/', icon: 'material-symbols:person-outline' },
      // {
      //   text: 'AI',
      //   icon: 'material-symbols:article-outline',
      //   items: [
      //     { text: 'AI Agent', link: '/ai/ai-chat-bot' },
      //   ],
      // },
    ],
    footer: {
      message: '个人前端博客 · 记录成长',
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
  title: "逍遥生-前端博客",
  description: "css javascript vue js 前端博客",
  head: [
    ["link", { rel: "icon", href: "/EFlong2/favicon.ico" }],
    [
      "script",
      {},
      `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?ce5b5e7aef70331f91bf3366eeef2b2b";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
      `
    ]
  ],
  base: "/EFlong2/",
});
