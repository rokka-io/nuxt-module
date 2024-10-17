import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'

describe('The <RokkaImage> component', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  const types = ['single', 'sizes', 'pictures']

  types.forEach((type) => {
    it(`sets the loading attribute on the <img> element for type "${type}"`, async () => {
      const page = await createPage('/props')

      const img = page.locator(`#${type} img`).first()
      const loading = await img.getAttribute('loading')
      expect(loading).toEqual('lazy')
    })

    it(`sets the class attribute on the <img> element for type "${type}"`, async () => {
      const page = await createPage('/props')

      const img = page.locator(`#${type} img`).first()
      const classes = await img.getAttribute('class')
      expect(classes).toEqual('my-image-class')
    })

    it(`uses a different rokka host if povided for type "${type}"`, async () => {
      const page = await createPage('/props')

      const markup = await page.locator(`#${type}`).first().innerHTML()
      expect(markup).not.toContain('rokka-demos.rokka.io')
      expect(markup).toContain('overriden-host.rokka.io')
    })
  })
})
