import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'

describe('Attributes on <RokkaImage>', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  for (const type of ['single', 'sizes', 'pictures']) {
    it(`sets attributes and listeners on the <img> for type "${type}"`, async () => {
      const page = await createPage('/attributes')
      const img = page.locator(`#${type} img`)

      expect(await img.getAttribute('fetchpriority')).toBe('high')
      expect(await img.getAttribute('data-test')).toBe('attribute')

      // load does not bubble, so only a listener on the <img> gets it.
      await img.dispatchEvent('load')
      await expect.poll(() => page.locator('#loaded').textContent()).toBe(type)
    })
  }

  it('keeps class and style on the <picture>', async () => {
    const page = await createPage('/attributes')
    const picture = page.locator('#pictures picture')
    const img = page.locator('#pictures img')

    expect(await picture.getAttribute('class')).toBe('root-class')
    expect(await picture.evaluate((el) => el.style.display)).toBe('block')
    expect(await img.getAttribute('class')).toBeNull()
    expect(await img.getAttribute('style')).toBeNull()
    expect(await picture.getAttribute('fetchpriority')).toBeNull()
  })
})
