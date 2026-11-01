import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage, url, waitForHydration } from '@nuxt/test-utils/e2e'
import type { Route } from 'playwright-core'
import { buildPictureData, buildSingleData, buildSizesData } from './helpers'

const IMAGES = 'https://rokka-demos.rokka.io/**'
const REMOTE =
  '/-https%3A%2F%2Fexample.com%2Fimages%2Fevent.jpg%3Fv%3D2-/event.jpg'

describe('The <RokkaImage> component with a remote image', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the remote image in place of the hash for every image style', async () => {
    const page = await createPage('/remote')

    const single = await buildSingleData(page, 'single')
    expect(single.src).toBe(
      'https://rokka-demos.rokka.io/STACK_CROP/variables-w-400-h-267' + REMOTE,
    )

    const sizes = await buildSizesData(page, 'sizes')
    expect(sizes.srcset).toHaveLength(6)
    for (const { url } of sizes.srcset) {
      expect(url).toContain(REMOTE)
    }

    const pictures = await buildPictureData(page, 'pictures')
    expect(pictures.src).toContain(REMOTE)
    for (const source of pictures.sources) {
      for (const { url } of source.srcsets) {
        expect(url).toContain(REMOTE)
      }
    }
  })

  it('emits error when the image fails before hydration', async () => {
    const page = await createPage()
    await page.route(IMAGES, (route) => route.fulfill({ status: 404 }))
    // Hold back the scripts, so that the images fail before Vue hydrates.
    await page.route('**/_nuxt/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.continue()
    })

    await page.goto(url('/remote'), { waitUntil: 'hydration' })

    await expect
      .poll(() => page.textContent('#failed'))
      .toBe('single,sizes,pictures')
  })

  it('emits error when the image fails after hydration', async () => {
    const page = await createPage()
    const held: Route[] = []
    await page.route(IMAGES, (route) => {
      held.push(route)
    })

    // The load event waits for the held images, so only wait for hydration.
    await page.goto(url('/remote'), { waitUntil: 'domcontentloaded' })
    await waitForHydration(page, url('/remote'), 'hydration')
    await expect.poll(() => held.length).toBe(3)
    expect(await page.textContent('#failed')).toBe('')

    await Promise.all(held.map((route) => route.fulfill({ status: 404 })))

    await expect
      .poll(() => page.textContent('#failed'))
      .toBe('single,sizes,pictures')
  })
})
