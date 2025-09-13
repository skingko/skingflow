// ESM config for VitePress
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'SkinFlow',
  description: 'Flexible flow engine for intelligent multi-agent applications',

  // Ignore dead links for now (will be fixed later)
  ignoreDeadLinks: true,

  // Base path for Cloudflare Pages
  base: '/',

  // Multi-language configuration
  locales: {
    root: { label: 'English', lang: 'en' },
    zh: { label: '中文', lang: 'zh' }
  },

  // Default locale
  lang: 'en',

  // Theme configuration
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API', link: '/api/framework' },
      { text: 'Examples', link: '/examples/quick-start' },
      { text: '中文', link: '/zh/' }
    ],

    sidebar: {
      '/': [
        {
          text: 'Documentation',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Features', link: '/guide/core-features' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Framework API', link: '/api/framework' },
            { text: 'Agent API', link: '/api/agent' },
            { text: 'Tool API', link: '/api/tool' },
            { text: 'Memory API', link: '/api/memory' }
          ]
        },
        {
          text: 'Examples',
          items: [
            { text: 'Quick Start', link: '/examples/quick-start' },
            { text: 'Intelligent Assistant', link: '/examples/intelligent-assistant' },
            { text: 'Content Creation', link: '/examples/content-creation' },
            { text: 'Data Analysis', link: '/examples/data-analysis' }
          ]
        }
      ],
      '/zh/': [
        {
          text: '文档',
          items: [
            { text: '介绍', link: '/zh/docs/guide/introduction' },
            { text: '入门指南', link: '/zh/docs/guide/getting-started' },
            { text: '核心功能', link: '/zh/docs/guide/core-features' },
            { text: '架构', link: '/zh/docs/guide/architecture' },
            { text: '配置', link: '/zh/docs/guide/configuration' }
          ]
        },
        {
          text: 'API 参考',
          items: [
            { text: '框架 API', link: '/zh/docs/api/framework' },
            { text: '智能体 API', link: '/zh/docs/api/agent' },
            { text: '工具 API', link: '/zh/docs/api/tool' },
            { text: '内存 API', link: '/zh/docs/api/memory' }
          ]
        },
        {
          text: '示例',
          items: [
            { text: '快速开始', link: '/zh/docs/examples/quick-start' },
            { text: '智能助手', link: '/zh/docs/examples/intelligent-assistant' },
            { text: '内容创作', link: '/zh/docs/examples/content-creation' },
            { text: '数据分析', link: '/zh/docs/examples/data-analysis' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/skingko/skingflow' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/skingflow' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 SkinFlow Contributors'
    }
  }
})