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
 * Calculates the width and height attributes for images so that <img>
 * elements define a correct aspect ratio.
 */
export function getImageAttributes(
  config: DefineImageStyleConfigSizes | DefineImageStyleConfigSingle,
  sourceWidth?: number,
  sourceHeight?: number,
) {
  if (config.type === 'single') {
    if (config.height) {
      // Explicit height is defined.
      return {
        width: config.width,
        height: config.height,
      }
    } else if (config.aspectRatio) {
      // Aspect ratio is defined. We can calculate the resulting height.
      return {
        width: config.width,
        height: Math.round(config.width / config.aspectRatio),
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
}
