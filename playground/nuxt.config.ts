export default defineNuxtConfig({
  ssr: false,
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
    host: 'rokka-demos.rokka.io',
    dpr: ['', '1.5', '2'],
    viewports: {
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1680,
    },
    stacks: {
      noCrop: 'fe_nuxt_no_crop_copy',
      crop: 'fe_nuxt_crop_copy',
    },
  },
})
