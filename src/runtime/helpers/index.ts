import type {
  DefineImageStyleConfigSingle,
  DefineImageStyleConfigSizes,
  RokkaImageSource,
} from '../types'

/**
 * The segment of a rokka URL that identifies the source image.
 *
 * A hash is used as is. A remote image goes between two dashes, which is how
 * rokka tells it apart from a hash. It is URL encoded, so that a query string
 * or the double slash after the protocol stay part of the segment.
 */
export function getSourcePath(source: string | RokkaImageSource): string {
  if (typeof source === 'string') {
    return source
  }
  if ('remote' in source) {
    return '-' + encodeURIComponent(source.remote) + '-'
  }
  return source.hash
}

/**
 * Extensions of the formats that browsers display.
 */
const BROWSER_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg']

/**
 * The file name at the end of a rokka URL.
 *
 * rokka renders the format of the file extension, and answers a name without
 * one with a 404. A name that does not end in a format browsers display, such
 * as a TIFF or PDF source, gets .jpg instead.
 */
export function getFileName(name?: string): string {
  // Trailing dots would end up before the added extension: 'photo..jpg'.
  const trimmed = name?.replace(/\.+$/, '')
  if (!trimmed) {
    return 'image.jpg'
  }
  const match = trimmed.match(/^(.+)\.([^.]+)$/)
  if (!match) {
    return trimmed + '.jpg'
  }
  const [, base, extension] = match
  return BROWSER_FORMATS.includes(extension!.toLowerCase())
    ? trimmed
    : base + '.jpg'
}

/**
 * The height of a single image: its explicit height, or the height its aspect
 * ratio gives. Both the URL and the height attribute use it.
 */
export function getSingleHeight(
  config: DefineImageStyleConfigSingle,
): number | undefined {
  if (config.height) {
    return config.height
  }
  if (config.aspectRatio) {
    return Math.round(config.width / config.aspectRatio)
  }
}

/**
 * Calculates the width and height attributes for images so that <img>
 * elements define a correct aspect ratio.
 */
export function getImageAttributes(
  config: DefineImageStyleConfigSizes | DefineImageStyleConfigSingle,
  sourceWidth?: number,
  sourceHeight?: number,
) {
  if (config.type === 'single') {
    const height = getSingleHeight(config)
    if (height) {
      return {
        width: config.width,
        height,
      }
    }

    // Neither height nor aspect ratio was defined. The image keeps its
    // original aspect ratio.
    if (sourceWidth && sourceHeight) {
      // Calculate the aspect ratio of the original image.
      const originalAspectRatio = sourceWidth / sourceHeight
      return {
        width: config.width,
        height: Math.round(config.width / originalAspectRatio),
      }
    }
    return
  }

  if (sourceWidth && sourceHeight) {
    // If an aspect ratio was provided we can calculate the height based on the
    // source image height.
    if (config.aspectRatio) {
      return {
        width: sourceWidth,
        height: Math.round(sourceWidth / config.aspectRatio),
      }
    }

    // No aspect ratio is defined. We use the source image size because the
    // image will always be rendered in its original aspect ratio.
    return {
      width: sourceWidth,
      height: sourceHeight,
    }
  }

  // Without the source size, the aspect ratio still gives the proportions.
  // The width is the largest one the image is displayed at.
  const widths = Object.values(config.sizes).filter(
    (width): width is number => !!width,
  )
  if (config.aspectRatio && widths.length) {
    const width = Math.max(...widths)
    return {
      width,
      height: Math.round(width / config.aspectRatio),
    }
  }
}
