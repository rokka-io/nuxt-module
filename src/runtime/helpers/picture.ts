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
    return Math.round(minWidth / spec.aspectRatio)
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
 * The first source without a media query, because that is the one <picture>
 * renders when no source before it matches. This covers the fallback viewport,
 * a viewport with a min-width of 0, the smallest viewport of the object syntax
 * and an entry with an empty media query.
 *
 * When every source has a media query, the one with the lowest min-width, or
 * else the last one.
 */
export function getFallbackSource(
  sources: PictureSource[],
): PictureSource | undefined {
  return (
    sources.find((v) => !v.media) ||
    getSourcesWithMinWidthSorted(sources)[0] ||
    sources[sources.length - 1]
  )
}

const MIN_WIDTH_QUERY = /^\(min-width: (\d+)px\)$/

/**
 * Combine a source's own media query with the exclusion of every query that
 * comes before it.
 *
 * <picture> picks the first matching <source>, but every matching preload link
 * is fetched, so the links have to be made mutually exclusive by hand.
 *
 * When all preceding queries are a plain min-width - which is the case for
 * every viewport based config - the exclusion collapses into a single
 * max-width. That keeps the output readable and avoids the Media Queries
 * level 4 `not` syntax, which older browsers treat as an invalid query.
 */
function excludePreceding(
  own: string | undefined,
  preceding: string[],
): string | undefined {
  if (!preceding.length) {
    return own
  }

  const maxWidth = collapsibleMaxWidth(preceding)
  const conditions =
    maxWidth === undefined
      ? preceding.map((v) => `(not ${v})`)
      : [`(max-width: ${maxWidth}px)`]

  return (own ? [own, ...conditions] : conditions).join(' and ')
}

/**
 * Parse '(min-width: 768px)' into 768. Returns undefined for anything else.
 */
function parseMinWidth(media: string): number | undefined {
  const match = media.match(MIN_WIDTH_QUERY)
  return match ? Number(match[1]) : undefined
}

/**
 * The single max-width that excludes all of the given queries, or undefined
 * if they can not be expressed that way.
 *
 * Excluding a set of min-width queries means staying below the smallest of
 * them, so they collapse into one max-width.
 */
function collapsibleMaxWidth(preceding: string[]): number | undefined {
  const minWidths: number[] = []

  for (const media of preceding) {
    const minWidth = parseMinWidth(media)

    // A query that is not a plain min-width, or one that always matches,
    // can not be turned into a max-width.
    if (minWidth === undefined || minWidth <= 0) {
      return undefined
    }

    minWidths.push(minWidth)
  }

  return Math.min(...minWidths) - 1
}

/**
 * Build the preload links for the given sources.
 *
 * One link per source, in the same order as the <source> elements, with
 * mutually exclusive media queries so that the browser preloads exactly the
 * image that <picture> will end up rendering.
 */
export function getPreloadLinks(sources: PictureSource[]): PreloadLink[] {
  const links: PreloadLink[] = []
  const preceding: string[] = []

  for (const source of sources) {
    links.push({
      rel: 'preload',
      as: 'image',
      imagesrcset: source.srcset,
      media: excludePreceding(source.media, preceding),
    })

    // A source without a media query always matches, so no later source can.
    if (!source.media) {
      break
    }

    preceding.push(source.media)
  }

  return links
}
