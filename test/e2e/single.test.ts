import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'
import { buildSingleData } from './helpers'

describe('The <RokkaImage> component for a single image', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders a single image.', async () => {
    const page = await createPage('/single')
    const img = await buildSingleData(page, 'single')

    // The width is defined in the image style.
    expect(img.width).toEqual('400')

    // The height is defined in the image style.
    expect(img.width).toEqual('400')

    expect(img.src).toContain('STACK_CROP')
    expect(img.src).toContain('variables-w-400-h-400')
    expect(img.alt).toEqual('My alt text')
    expect(img.title).toEqual('My title text')
    expect(img.src).toEqual(
      'https://rokka-demos.rokka.io/STACK_CROP/variables-w-400-h-400/HASH/image.jpg',
    )
  })

  it('renders a single image without cropping.', async () => {
    const page = await createPage('/single-no-crop')
    const img = await buildSingleData(page, 'single')

    // The width is defined in the image style.
    expect(img.width).toEqual('500')

    // The height is not defined in the image style. The height is calculated
    // from the aspect ratio of the source image (1200 / 600 = 2).
    expect(img.height).toEqual('250')

    // The stack that does not crop the image is used.
    expect(img.src).toContain('STACK_NO_CROP')
    expect(img.src).toContain('variables-w-500')
    expect(img.src).toEqual(
      'https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-500/HASH/image.jpg',
    )
  })
})
