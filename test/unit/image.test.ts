import { describe, it, expect } from 'vitest'
import {
  getFileName,
  getImageAttributes,
  getSingleHeight,
} from '../../src/runtime/helpers'

describe('getSingleHeight', () => {
  it('uses the height when both height and aspectRatio are set', () => {
    expect(
      getSingleHeight({
        type: 'single',
        width: 400,
        height: 300,
        aspectRatio: 1,
      }),
    ).toBe(300)
  })

  it('calculates the height from the aspect ratio', () => {
    expect(
      getSingleHeight({ type: 'single', width: 400, aspectRatio: 16 / 9 }),
    ).toBe(225)
  })

  it('returns no height when the image keeps its aspect ratio', () => {
    expect(getSingleHeight({ type: 'single', width: 400 })).toBeUndefined()
  })
})

describe('getImageAttributes', () => {
  it('gives the same height as the URL for a single image', () => {
    const config = {
      type: 'single',
      width: 400,
      height: 300,
      aspectRatio: 1,
    } as const
    expect(getImageAttributes(config)).toEqual({
      width: 400,
      height: getSingleHeight(config),
    })
  })

  it('uses the largest size and the aspect ratio for sizes without the source size', () => {
    expect(
      getImageAttributes({
        type: 'sizes',
        aspectRatio: 3 / 2,
        sizes: { fallback: 340, md: 460, lg: 380 },
      }),
    ).toEqual({ width: 460, height: 307 })
  })

  it('uses the source size for sizes when it is known', () => {
    expect(
      getImageAttributes(
        { type: 'sizes', aspectRatio: 2, sizes: { fallback: 340 } },
        1200,
        900,
      ),
    ).toEqual({ width: 1200, height: 600 })
    expect(
      getImageAttributes(
        { type: 'sizes', sizes: { fallback: 340 } },
        1200,
        900,
      ),
    ).toEqual({ width: 1200, height: 900 })
  })

  it('returns no attributes for sizes without aspect ratio and source size', () => {
    expect(
      getImageAttributes({ type: 'sizes', sizes: { fallback: 340 } }),
    ).toBeUndefined()
  })
})

describe('getFileName', () => {
  it('uses image.jpg without a name', () => {
    expect(getFileName()).toBe('image.jpg')
    expect(getFileName('')).toBe('image.jpg')
  })

  it('keeps an extension that browsers display', () => {
    for (const name of [
      'photo.jpg',
      'photo.JPEG',
      'logo.png',
      'animation.gif',
      'photo.webp',
      'photo.avif',
      'icon.svg',
    ]) {
      expect(getFileName(name)).toBe(name)
    }
  })

  it('replaces any other extension with .jpg', () => {
    expect(getFileName('scan.tif')).toBe('scan.jpg')
    expect(getFileName('IMG_0001.HEIC')).toBe('IMG_0001.jpg')
    expect(getFileName('report.pdf')).toBe('report.jpg')
    expect(getFileName('my.report.pdf')).toBe('my.report.jpg')
  })

  it('adds .jpg to a name without an extension', () => {
    expect(getFileName('photo')).toBe('photo.jpg')
  })
})
