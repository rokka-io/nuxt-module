import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'
import { buildSizesData } from './helpers'
import exp from 'node:constants'

describe('The <RokkaImage> component for sizes', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the img element with srcset attributes.', async () => {
    const page = await createPage('/sizes')
    const data = await buildSizesData(page, 'sizes')
    expect(data).toMatchInlineSnapshot(`
      {
        "alt": "My alt text",
        "height": "1080",
        "loading": null,
        "sizes": [
          {
            "mediaQuery": "(min-width: 1679px)",
            "width": "1200px",
          },
          {
            "mediaQuery": "(min-width: 1279px)",
            "width": "980px",
          },
          {
            "mediaQuery": "(min-width: 1023px)",
            "width": "768px",
          },
          {
            "mediaQuery": "(min-width: 767px)",
            "width": "375px",
          },
        ],
        "src": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-375-h-211/HASH/image.jpg",
        "srcset": [
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-375-h-211/HASH/image.jpg",
            "width": "375w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-375-h-211--options-dpr-1.5/HASH/image.jpg",
            "width": "563w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-375-h-211--options-dpr-2/HASH/image.jpg",
            "width": "750w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-768-h-432/HASH/image.jpg",
            "width": "768w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-768-h-432--options-dpr-1.5/HASH/image.jpg",
            "width": "1152w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-768-h-432--options-dpr-2/HASH/image.jpg",
            "width": "1536w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-980-h-551/HASH/image.jpg",
            "width": "980w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-980-h-551--options-dpr-1.5/HASH/image.jpg",
            "width": "1470w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-980-h-551--options-dpr-2/HASH/image.jpg",
            "width": "1960w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-1200-h-675/HASH/image.jpg",
            "width": "1200w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-1200-h-675--options-dpr-1.5/HASH/image.jpg",
            "width": "1800w",
          },
          {
            "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-1200-h-675--options-dpr-2/HASH/image.jpg",
            "width": "2400w",
          },
        ],
        "title": "My title text",
        "width": "1920",
      }
    `)
  })

  it('calculates the height based on the provided aspect ratio', async () => {
    const page = await createPage('/sizes-aspect-ratio')
    const img = await buildSizesData(page, 'sizes')

    // The width defined by sourceWidth.
    expect(img.width).toEqual('1000')
    // The height is calculated from the provided aspect ratio (2 / 1).
    expect(img.height).toEqual('500')

    // Should use the stack that crops the image.
    img.srcset.forEach((srcset) => {
      expect(srcset.url).toContain('STACK_CROP')
    })
  })

  it('keeps the aspect ratio of the source image', async () => {
    const page = await createPage('/sizes-no-aspect-ratio')
    const img = await buildSizesData(page, 'sizes')

    // The width defined by sourceWidth.
    expect(img.width).toEqual('1024')
    // The height defined by sourceHeight.
    expect(img.height).toEqual('768')

    // Should use the stack that retains the aspect ratio (no crop).
    img.srcset.forEach((srcset) => {
      expect(srcset.url).toContain('STACK_NO_CROP')
    })
  })

  it('uses the special fallback viewport if provided', async () => {
    const page = await createPage('/sizes-fallback')
    const img = await buildSizesData(page, 'sizes')

    expect(img.sizes).toHaveLength(5)
    expect(img.sizes[4].mediaQuery).toBeFalsy()
    expect(img.sizes[4].width).toEqual('200px')
    expect(img.src).toMatchInlineSnapshot(
      `"https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-200/HASH/image.jpg"`,
    )
  })
})
