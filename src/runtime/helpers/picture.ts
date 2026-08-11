/**
 * Pure helpers for the <RokkaImage> pictures variant.
 *
 * These are deliberately free of any Nuxt/Vue imports and take the viewport
 * map as an argument instead of importing '#rokka/generated-types', so that
 * they can be unit tested in a plain node environment.
 */

/**
 * Map of viewport name => min-width in pixels.
 */
export type Viewports = Record<string, number>

/**
 * A single entry of the picture config, as provided by the user.
 */
export type PictureInputSpec = {
  width?: number
  height?: number
  aspectRatio?: number
}

/**
 * A single entry of the array syntax.
 */
export type PictureInputArrayItem = PictureInputSpec & {
  viewport?: string
  media?: string
}

/**
 * The `pictures` property, in either the object or the array syntax.
 */
export type PicturesInput =
  Partial<Record<string, PictureInputSpec>> | PictureInputArrayItem[]

/**
 * A normalised picture config, after both syntaxes have been merged.
 */
export type PictureConfig = {
  viewport?: string
  media?: string
  width?: number
  height?: number
  aspectRatio?: number
  minWidth?: number
}

/**
 * A rendered <source>.
 */
export type PictureSource = {
  srcset: string
  srcsetItems: [string, string][]
  width: number
  height?: number
  media?: string
  viewport?: string
  minWidth?: number
}

export type PreloadLink = {
  rel: 'preload'
  as: 'image'
  imagesrcset: string
  media?: string
}

/**
 * Build the min-width media query for a viewport.
 *
 * Returns undefined for the smallest viewport (min-width of 0) and for the
 * special 'fallback' viewport, since those should always match.
 */
export function getMediaQueryFromViewport(
  viewports: Viewports,
  viewport?: string,
): string | undefined {
  if (!viewport) {
    return
  }
  const minWidth: number | undefined = viewports[viewport]

  if (minWidth) {
    return `(min-width: ${minWidth}px)`
  }
}

/**
 * Normalise both the object and the array syntax into a single array.
 *
 * For the object syntax the entries are sorted by their viewport min-width,
 * largest first, and the smallest one has its media query removed so that it
 * acts as the fallthrough source. For the array syntax the order provided by
 * the user is preserved, because the browser picks the first matching source.
 */
export function getPictureConfigs(
  pictures: PicturesInput,
  viewports: Viewports,
  rootAspectRatio?: number,
): PictureConfig[] {
  // User provided an array.
  if (Array.isArray(pictures)) {
    return pictures.map((v) => {
      const media = v.media || getMediaQueryFromViewport(viewports, v.viewport)
      return {
        viewport: v.viewport,
        media,
        width: v.width,
        height: v.height,
        aspectRatio: v.aspectRatio || rootAspectRatio,
        minWidth: v.viewport ? viewports[v.viewport] : undefined,
      }
    })
  }

  // User provided an object. Convert it to an array.
  return Object.entries(pictures)
    .filter((entry): entry is [string, PictureInputSpec] => !!entry[1])
    .map(([viewport, config]) => {
      return {
        viewport,
        ...config,
        aspectRatio: config.aspectRatio || rootAspectRatio,
        minWidth: viewports[viewport] ?? 0,
        media: getMediaQueryFromViewport(viewports, viewport),
      }
    })
    .sort((a, b) => {
      return b.minWidth - a.minWidth
    })
    .map((item, index, arr) => {
      // The last one should not have a media query.
      if (index === arr.length - 1) {
        return {
          ...item,
          media: undefined,
        }
      }
      return item
    })
}

/**
 * Determine the width of the rendered image for a config.
 */
export function getWidth(
  spec: PictureConfig,
  viewports: Viewports,
  sourceWidth?: number,
): number | undefined {
  if (spec.width) {
    // Width is provided explicitly.
    return spec.width
  } else if (spec.height && spec.aspectRatio) {
    // Height and aspect ratio is provided.
    return Math.round(spec.height * spec.aspectRatio)
  } else if (spec.viewport) {
    // Viewport available.
    return viewports[spec.viewport]
  } else if (sourceWidth) {
    return sourceWidth
  }
}

/**
 * Determine the height of the rendered image for a config.
 *
 * Returning a height is what makes the component use the crop stack, so a
 * config that only inherits the root aspect ratio will still be cropped.
 */
export function getHeight(
  spec: PictureConfig,
  viewports: Viewports,
): number | undefined {
  if (spec.height) {
    // Height has been provided explicitly.
    return spec.height
  } else if (spec.width && spec.aspectRatio) {
    // Width and aspect ratio provided. We can calculate the height.
    return Math.round(spec.width / spec.aspectRatio)
  } else if (spec.viewport && spec.aspectRatio) {
    // Neither width nor height provided. Use the min-width of the breakpoint
    // to calculate the height.
    const minWidth = viewports[spec.viewport] ?? 0
    return Math.round(minWidth * spec.aspectRatio)
  }
}

/**
 * All sources that belong to a viewport, sorted by min-width, smallest first.
 */
export function getSourcesWithMinWidthSorted(
  sources: PictureSource[],
): Array<PictureSource & { minWidth: number }> {
  return sources
    .filter(
      (v): v is PictureSource & { minWidth: number } =>
        v.minWidth !== undefined && v.minWidth > 0,
    )
    .sort((a, b) => a.minWidth - b.minWidth)
}

/**
 * The source used for the src attribute of the <img> tag.
 *
 * Either the explicitly defined fallback, or the one with the lowest min-width
 * (usually the case when viewports are used), or the last one (for media
 * queries this is generally the fallthrough one).
 */
export function getFallbackSource(
  sources: PictureSource[],
): PictureSource | undefined {
  return (
    sources.find((v) => v.viewport === 'fallback') ||
    getSourcesWithMinWidthSorted(sources)[0] ||
    sources[sources.length - 1]
  )
}

/**
 * Build the preload links for the given sources.
 */
export function getPreloadLinks(sources: PictureSource[]): PreloadLink[] {
  return getSourcesWithMinWidthSorted(sources).map((source, index, self) => {
    const next = self[index + 1]
    return {
      rel: 'preload',
      as: 'image',
      imagesrcset: source.srcset,
      media:
        index === 0 && next
          ? `(max-width: ${next.minWidth - 1}px)`
          : source.media,
    }
  })
}
