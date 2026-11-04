import RokkaNuxt from '../../../../src/module'

export default defineNuxtConfig({
  modules: [RokkaNuxt],

  rokka: {
    host: 'rokka-demos.rokka.io',
    viewports: {
      mobile: 0,
      desktop: 1200,
    },
  },
})
