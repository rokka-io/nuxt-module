import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'
import { buildPictureData, getPreloadLinks } from './helpers'

describe('The <RokkaImage> component for pictures', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the pictures element with viewport config.', async () => {
    const page = await createPage('/pictures')
    const data = await buildPictureData(page, 'pictures')

    expect(data.alt).toMatchInlineSnapshot(`"My alt text"`)
    expect(data.title).toMatchInlineSnapshot(`"My title text"`)
    expect(data.src).toMatchInlineSnapshot(
      `"https://rokka-demos.rokka.io/STACK_CROP/variables-w-375-h-938/HASH/image.jpg"`,
    )
    expect(data.sources).toHaveLength(3)

    // First one should be for the XL viewport.
    expect(data.sources[0].media).toMatchInlineSnapshot(`"(min-width: 1680px)"`)
    // Should not have a height because none is set.
    expect(data.sources[0].height).toBeNull()
    expect(data.sources[0].srcsets).toMatchInlineSnapshot(`
      [
        {
          "dpi": "1x",
          "url": "https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-1680/HASH/image.jpg",
        },
        {
          "dpi": "1.5x",
          "url": "https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-1680--options-dpr-1.5/HASH/image.jpg",
        },
        {
          "dpi": "2x",
          "url": "https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-1680--options-dpr-2/HASH/image.jpg",
        },
      ]
    `)

    // Should have the media query for the LG viewport.
    expect(data.sources[1].media).toMatchInlineSnapshot(`"(min-width: 1280px)"`)
    // Should have a height because one is set explicitly.
    expect(data.sources[1].height).toEqual('300')
    // Should have a width because one is set explicitly.
    expect(data.sources[1].width).toEqual('1024')

    // Should not have a media query because it's the last one.
    expect(data.sources[2].media).toBeFalsy()
    // Should have a height that is calculated from the aspect ratio.
    expect(data.sources[2].height).toEqual('938')
    // Should have a width because one is set explicitly.
    expect(data.sources[2].width).toEqual('375')
  })

  it('renders the preload links for picture sources', async () => {
    const page = await createPage('/pictures-preload')

    const links = await getPreloadLinks(page)

    expect(links).toMatchInlineSnapshot(`
      [
        {
          "as": "image",
          "imagesrcset": [
            {
              "dpi": "1x",
              "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-375-h-938/HASH/image.jpg",
            },
            {
              "dpi": "1.5x",
              "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-375-h-938--options-dpr-1.5/HASH/image.jpg",
            },
            {
              "dpi": "2x",
              "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-375-h-938--options-dpr-2/HASH/image.jpg",
            },
          ],
          "media": "(max-width: 1279px)",
          "rel": "preload",
        },
        {
          "as": "image",
          "imagesrcset": [
            {
              "dpi": "1x",
              "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-1024-h-300/HASH/image.jpg",
            },
            {
              "dpi": "1.5x",
              "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-1024-h-300--options-dpr-1.5/HASH/image.jpg",
            },
            {
              "dpi": "2x",
              "url": "https://rokka-demos.rokka.io/STACK_CROP/variables-w-1024-h-300--options-dpr-2/HASH/image.jpg",
            },
          ],
          "media": "(min-width: 1280px)",
          "rel": "preload",
        },
        {
          "as": "image",
          "imagesrcset": [
            {
              "dpi": "1x",
              "url": "https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-1680/HASH/image.jpg",
            },
            {
              "dpi": "1.5x",
              "url": "https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-1680--options-dpr-1.5/HASH/image.jpg",
            },
            {
              "dpi": "2x",
              "url": "https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-1680--options-dpr-2/HASH/image.jpg",
            },
          ],
          "media": "(min-width: 1680px)",
          "rel": "preload",
        },
      ]
    `)
  })

  it('calculates the height using aspect ratios', async () => {
    const page = await createPage('/pictures-aspect-ratio')
    const data = await buildPictureData(page, 'pictures')

    // Viewport XL defines both a width and height. Any aspect ratio is ignored.
    expect(data.sources[0].width).toEqual('1000')
    expect(data.sources[0].height).toEqual('1000')

    // Viewport LG defines only a width.
    expect(data.sources[1].width).toEqual('1000')
    // Neither a height nor an aspect ratio is defined for the viewport. It inherits the root aspect ratio.
    expect(data.sources[1].height).toEqual('500') // Root aspect ratio: 2 / 1 = 1000 * 0.5 = 500

    // Viewport SM defines a width.
    expect(data.sources[2].width).toEqual('400')
    // A width is defined and it overrides the root aspect ratio.
    expect(data.sources[2].height).toEqual('300') // Aspect ratio: 4 / 3 = 400 * 0.75 = 300
  })

  it('does not do any calculations if all sizes are provided', async () => {
    const page = await createPage('/pictures-no-calc')
    const data = await buildPictureData(page, 'pictures')

    expect(data.sources[0].width).toEqual('600')
    expect(data.sources[0].height).toEqual('600')

    expect(data.sources[1].width).toEqual('500')
    expect(data.sources[1].height).toEqual('500')

    expect(data.sources[2].width).toEqual('400')
    expect(data.sources[2].height).toEqual('400')

    expect(data.sources[3].width).toEqual('300')
    expect(data.sources[3].height).toEqual('300')
  })

  it('renders the pictures element with custom media queries.', async () => {
    const page = await createPage('/pictures-media-query')
    const data = await buildPictureData(page, 'pictures')

    expect(data.alt).toMatchInlineSnapshot(`"My alt text"`)
    expect(data.title).toMatchInlineSnapshot(`"My title text"`)
    expect(data.src).toMatchInlineSnapshot(
      `"https://rokka-demos.rokka.io/STACK_CROP/variables-w-300-h-300/HASH/image.jpg"`,
    )
    expect(data.sources).toHaveLength(4)

    // First one should be for the XL viewport, because it refernces the xl viewport.
    expect(data.sources[0].media).toMatchInlineSnapshot(`"(min-width: 1680px)"`)
    // Should not have a height because none is set.
    expect(data.sources[0].height).toBeNull()
    expect(data.sources[0].srcsets).toMatchInlineSnapshot(`
      [
        {
          "dpi": "1x",
          "url": "https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-1680/HASH/image.jpg",
        },
        {
          "dpi": "1.5x",
          "url": "https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-1680--options-dpr-1.5/HASH/image.jpg",
        },
        {
          "dpi": "2x",
          "url": "https://rokka-demos.rokka.io/STACK_NO_CROP/variables-w-1680--options-dpr-2/HASH/image.jpg",
        },
      ]
    `)

    // Second one has a custom media query.
    expect(data.sources[1].media).toMatchInlineSnapshot(
      `"(min-width: 600px) and (min-height: 400px)"`,
    )
    // Should have a height because one is set explicitly.
    expect(data.sources[1].height).toEqual('300')
    // Should have a width because one is set explicitly.
    expect(data.sources[1].width).toEqual('1024')

    // Has a custom media query.
    expect(data.sources[2].media).toMatchInlineSnapshot(`"(min-height: 600px)"`)
    // Should have a height that is calculated from the aspect ratio.
    expect(data.sources[2].height).toEqual('211')
    // Should have a width because one is set explicitly.
    expect(data.sources[2].width).toEqual('375')
  })
})
