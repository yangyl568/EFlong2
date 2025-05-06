import { viteBundler } from "@vuepress/bundler-vite";
import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress";
import { copyCodePlugin } from '@vuepress/plugin-copy-code';

export default defineUserConfig({
  bundler: viteBundler(),
  theme: defaultTheme({
    navbar: [
      { text: '首页', link: '/' },
      // { text: '指南', link: '/guide/' },
      { text: '八股文', link: '/baguwen/',
        children: [
          { text: 'CSS 必备知识点', link: '/baguwen/css' },
          { text: 'javascript', link: '/baguwen/javascript' },
          { text: '前端工程化', link: '/baguwen/engineering' },
          { text: '框架', link: '/baguwen/frame' },
          { text: 'Node', link: '/baguwen/node' },
        ],
      },
      { text: '积累', link: '/jilei/',
        children: [
          { text: '必备技能', link: '/jilei/bibeiskill' },
          { text: '扩展', link: '/jilei/kuozhan' },
          { text: '问题收集', link: '/jilei/error' },
          { text: 'Vue3项目', link: '/jilei/vue3' },
        ],
      },
    ],
    lastUpdated: "最后更新", // Last Updated | boolean
    contributors: false, // Contributors | boolean
    sidebarDepth: 2,
  }),
  lang: "zh-CN",
  title: "逍遥生-前端笔记",
  description: "前端面试 前端面试题 css javascript vue js 前端博客",
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "favicon.ico",
      },
    ],
    [
      "script",
      {},
      `var _hmt = _hmt || [];
          (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?ce5b5e7aef70331f91bf3366eeef2b2b";
            var s = document.getElementsByTagName("script")[0]; 
            s.parentNode.insertBefore(hm, s);
          })();
          `,
    ],
  ],
  base: "/EFlong2/",
  host: "127.0.0.1",
  port: "8888",
  plugins: ["@vuepress/back-to-top", "@vuepress/nprogress", copyCodePlugin()],
});
