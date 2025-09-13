// ESM config for VitePress
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'SkinFlow',
  description: 'Flexible flow engine for intelligent multi-agent applications',

  // Ignore dead links for now (will be fixed later)
  ignoreDeadLinks: true,

  // Multi-language configuration
  locales: {
    root: { label: 'English', lang: 'en' },
    zh: { label: '中文', lang: 'zh' },
    es: { label: 'Español', lang: 'es' },
    fr: { label: 'Français', lang: 'fr' },
    de: { label: 'Deutsch', lang: 'de' }
  },

  // Default locale
  lang: 'en',

  // Theme configuration
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Features', link: '/guide/core-features' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Framework API', link: '/api/framework' },
            { text: 'Agent API', link: '/api/agent' },
            { text: 'Tool API', link: '/api/tool' },
            { text: 'Memory API', link: '/api/memory' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Quick Start', link: '/examples/quick-start' },
            { text: 'Intelligent Assistant', link: '/examples/intelligent-assistant' },
            { text: 'Content Creation', link: '/examples/content-creation' },
            { text: 'Data Analysis', link: '/examples/data-analysis' }
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