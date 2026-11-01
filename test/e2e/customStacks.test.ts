import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'

describe('Stack overrides', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  const types = ['single', 'sizes', 'pictures']
  const stacks = {
    crop: ['custom_crop_stack', 'fe_nuxt_crop'],
    noCrop: ['custom_no_crop_stack', 'fe_nuxt_no_crop'],
  }

  Object.entries(stacks).forEach(([key, [overrideStack, defaultStack]]) => {
    types.forEach((type) => {
      it(`are used for type "${type}" with stack "${key}"`, async () => {
        const page = await createPage('/stacks')
        const markup = await page
          .locator(`#${key} .${type}`)
          .first()
          .innerHTML()
        expect(markup).toContain(overrideStack)
        expect(markup).not.toContain(defaultStack)
      })
    })
  })
})
