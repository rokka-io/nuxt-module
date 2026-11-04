/**
 * Renders the test images to PNG files in `images/`, with the Chromium of the
 * e2e tests (`npx playwright-core install chromium`).
 *
 * Only run it to change the images: a new file gets a new hash in rokka, so
 * run `npm run rokka:setup` afterwards.
 */
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { IMAGES, toSvg } from './images.ts'

const dir = fileURLToPath(new URL('./images/', import.meta.url))
await mkdir(dir, { recursive: true })

const browser = await chromium.launch()
try {
  for (const image of IMAGES) {
    const page = await browser.newPage({
      viewport: { width: image.width, height: image.height },
      deviceScaleFactor: 1,
    })
    await page.setContent(
      `<style>body { margin: 0 } svg { display: block }</style>${toSvg(image)}`,
    )
    const path = `${dir}${image.name}`
    await page.screenshot({ path, type: 'png' })
    await page.close()
    console.log(`Rendered ${path}`)
  }
} finally {
  await browser.close()
}
