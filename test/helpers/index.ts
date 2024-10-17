import type { Page } from 'playwright-core'

function parseSrcset(srcset?: string | null): { url: string; dpi: string }[] {
  if (!srcset) {
    return []
  }
  return srcset.split(', ').map((v) => {
    const [url, dpi] = v.split(' ')
    return {
      url,
      dpi,
    }
  })
}

export async function buildPictureData(page: Page, id: string) {
  const sourceElements = await page.locator(`#${id} picture source`).all()

  const sources = await Promise.all(
    sourceElements.map(async (source) => {
      const srcset = await source.getAttribute('srcset')
      const width = await source.getAttribute('width')
      const height = await source.getAttribute('height')
      const media = await source.getAttribute('media')
      return {
        srcsets: parseSrcset(srcset),
        width,
        height,
        media,
      }
    }),
  )

  const imageElement = page.locator(`#${id} picture img`).first()

  return {
    sources,
    alt: await imageElement.getAttribute('alt'),
    title: await imageElement.getAttribute('title'),
    src: await imageElement.getAttribute('src'),
  }
}

function parseImageSizes(v?: string | null) {
  return (v || '').split(', ').map((v) => {
    const lastSpace = v.lastIndexOf(' ')
    const mediaQuery = v.substring(0, lastSpace)
    const width = v.substring(lastSpace + 1)
    return {
      mediaQuery,
      width,
    }
  })
}

export async function buildSizesData(page: Page, id: string) {
  const imageElement = page.locator(`#${id} img`).first()

  const src = await imageElement.getAttribute('src')
  const srcsetValue = await imageElement.getAttribute('srcset')
  const srcset = (srcsetValue || '').split(', ').map((v) => {
    const [url, width] = v.split(' ')
    return {
      url,
      width,
    }
  })

  const sizesValue = await imageElement.getAttribute('sizes')
  return {
    src,
    srcset,
    sizes: parseImageSizes(sizesValue),
    alt: await imageElement.getAttribute('alt'),
    title: await imageElement.getAttribute('title'),
    loading: await imageElement.getAttribute('loading'),
    width: await imageElement.getAttribute('width'),
    height: await imageElement.getAttribute('height'),
  }
}

export async function buildSingleData(page: Page, id: string) {
  const imageElement = page.locator(`#${id} img`).first()

  return {
    alt: await imageElement.getAttribute('alt'),
    title: await imageElement.getAttribute('title'),
    width: await imageElement.getAttribute('width'),
    height: await imageElement.getAttribute('height'),
    src: await imageElement.getAttribute('src'),
  }
}

export async function getPreloadLinks(page: Page) {
  const preloadLinkElements = await page.locator('link[as="image"]').all()

  return Promise.all(
    preloadLinkElements.map(async (element) => {
      const rel = await element.getAttribute('rel')
      const as = await element.getAttribute('as')
      const imagesrcset = await element.getAttribute('imagesrcset')
      const media = await element.getAttribute('media')
      return {
        rel,
        as,
        imagesrcset: parseSrcset(imagesrcset),
        media,
      }
    }),
  )
}

export async function getSizesPreloadLink(page: Page) {
  const link = page.locator('link[as="image"]').first()

  const imagesrcset = await link.getAttribute('imagesrcset')
  const imagesizes = await link.getAttribute('imagesizes')

  return {
    imagesrcset: parseSrcset(imagesrcset),
    imagesizes: parseImageSizes(imagesizes),
  }
}
