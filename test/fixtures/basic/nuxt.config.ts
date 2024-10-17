import RokkaNuxt from '../../../src/module'

export default defineNuxtConfig({
  modules: [RokkaNuxt],

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
      noCrop: 'STACK_NO_CROP',
      crop: 'STACK_CROP',
    },
  },
})
