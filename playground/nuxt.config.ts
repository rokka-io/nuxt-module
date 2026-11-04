export default defineNuxtConfig({
  ssr: true,
  modules: ['../src/module'],

  imports: {
    autoImport: false,
  },

  app: {
    head: {
      viewport:
        'width=device-width, height=device-height, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0',
    },
  },

  rokka: {
    host: 'rokka-nuxt-module.rokka.io',
    dpr: ['', '1.5', '2'],
    viewports: {
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1680,
    },
  },

  compatibilityDate: '2025-09-04',
})
