import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'
import type { Page } from 'playwright-core'

/**
 * Every URL of the <img> and <source> elements below the selector.
 */
function getUrls(page: Page, selector: string): Promise<string[]> {
  return page.locator(selector).evaluate((el) =>
    [...el.querySelectorAll('img, source')].flatMap((v) => [
      ...(v.getAttribute('src') ? [v.getAttribute('src')!] : []),
      ...(v.getAttribute('srcset') || '')
        .split(', ')
        .filter(Boolean)
        .map((candidate) => candidate.split(' ')[0]!),
    ]),
  )
}

describe('Stack overrides', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  // The stacks each section of the page should end up with. A stack the
  // section does not override is the one of the module.
  const sections = {
    both: { crop: 'custom_crop_stack', noCrop: 'custom_no_crop_stack' },
    'crop-only': { crop: 'custom_crop_stack', noCrop: 'STACK_NO_CROP' },
    'no-crop-only': { crop: 'STACK_CROP', noCrop: 'custom_no_crop_stack' },
  }

  for (const [section, expected] of Object.entries(sections)) {
    for (const type of ['single', 'sizes', 'pictures']) {
      it(`are used for type "${type}" when overriding ${section}`, async () => {
        const page = await createPage('/stacks')

        for (const crop of [true, false]) {
          const urls = await getUrls(
            page,
            `#${section} .${type}-${crop ? 'crop' : 'no-crop'}`,
          )
          expect(urls.length).toBeGreaterThan(0)

          for (const url of urls) {
            const [, stack, variables] = new URL(url).pathname.split('/')
            expect(stack, url).toBe(crop ? expected.crop : expected.noCrop)
            expect(variables!.includes('-h-'), url).toBe(crop)
          }
        }
      })
    }
  }
})
