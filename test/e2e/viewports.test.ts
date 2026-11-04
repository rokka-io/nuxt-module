import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('The viewports option', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/viewports', import.meta.url)),
  })

  it('replaces the default viewports instead of adding to them', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('<p id="viewports">fallback,mobile,desktop</p>')
  })
})
