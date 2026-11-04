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
  | Partial<Record<string, PictureInputSpec>>
  | PictureInputArrayItem[]

/**
 * A normalised picture config, after both syntaxes have been merged.
 */
export type PictureConfig = PictureInputArrayItem & {
  minWidth?: number
}

/**
 * A rendered <source>.
 */
export type PictureSource = {
  srcset: string

  /**
   * The URL of the first density, for the src of the <img>.
   */
  src?: string
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
  const minWidth = viewport && viewports[viewport]
  return minWidth ? `(min-width: ${minWidth}px)` : undefined
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
  const normalise = (v: PictureInputArrayItem): PictureConfig => ({
    ...v,
    media: v.media || getMediaQueryFromViewport(viewports, v.viewport),
    aspectRatio: v.aspectRatio || rootAspectRatio,
    minWidth: v.viewport ? viewports[v.viewport] : undefined,
  })

  if (Array.isArray(pictures)) {
    return pictures.map(normalise)
  }

  const configs = Object.entries(pictures)
    .flatMap(([viewport, v]) => (v ? [normalise({ ...v, viewport })] : []))
    .sort((a, b) => (b.minWidth ?? 0) - (a.minWidth ?? 0))

  // The smallest one renders for every width below the others.
  const last = configs.at(-1)
  if (last) {
    last.media = undefined
  }
  return configs
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
  const byMinWidth = sources
    .filter((v) => (v.minWidth ?? 0) > 0)
    .sort((a, b) => (a.minWidth ?? 0) - (b.minWidth ?? 0))

  return sources.find((v) => !v.media) || byMinWidth[0] || sources.at(-1)
}

const MIN_WIDTH_QUERY = /^\(min-width: (\d+)px\)$/

/**
 * Split a media query list at its top-level commas. A list matches when any
 * of its queries does.
 */
function splitQueryList(media: string): string[] {
  const queries: string[] = []
  let depth = 0
  let start = 0

  for (let i = 0; i < media.length; i++) {
    const char = media[i]
    if (char === '(') {
      depth++
    } else if (char === ')') {
      depth--
    } else if (char === ',' && depth === 0) {
      queries.push(media.slice(start, i))
      start = i + 1
    }
  }
  queries.push(media.slice(start))

  return queries.map((v) => v.trim()).filter(Boolean)
}

/**
 * The words of a query outside its parentheses, lowercase: ['and'] for
 * '(a) and (b)', ['screen', 'and'] for 'screen and (a)'.
 */
function getTopLevelWords(query: string): string[] {
  let depth = 0
  let text = ''

  for (const char of query) {
    if (char === '(') {
      depth++
    }
    text += depth === 0 ? char : ' '
    if (char === ')') {
      depth--
    }
  }

  return text.toLowerCase().split(/\s+/).filter(Boolean)
}

/**
 * Whether the query is a media condition, which can be negated and combined
 * with other conditions. A query with a media type, like 'screen and (a)', is
 * not.
 */
function isCondition(query: string): boolean {
  return getTopLevelWords(query).every((word) =>
    ['and', 'or', 'not'].includes(word),
  )
}

/**
 * Exclude a condition: '(not (a))'.
 */
function negate(query: string): string {
  return getTopLevelWords(query).length ? `(not (${query}))` : `(not ${query})`
}

/**
 * The smallest of the given min-width queries, or undefined if one of them is
 * not a plain min-width in pixels, or one of 0, which always matches.
 *
 * Staying below the smallest of a set of min-widths excludes all of them, so
 * they collapse into one.
 */
function lowestMinWidth(preceding: string[]): number | undefined {
  const minWidths = preceding.map((v) => Number(MIN_WIDTH_QUERY.exec(v)?.[1]))
  return minWidths.every((v) => v > 0) ? Math.min(...minWidths) : undefined
}

/**
 * The condition that excludes every given query, or undefined for none.
 *
 * When all of them are a plain min-width - which is the case for every
 * viewport based config - the exclusion collapses into a single one.
 *
 * It is negated rather than turned into a max-width one pixel lower: zoom can
 * make the viewport 1279.5px wide, where neither '(min-width: 1280px)' nor
 * '(max-width: 1279px)' matches.
 */
function exclude(preceding: string[]): string | undefined {
  if (!preceding.length) {
    return
  }

  const minWidth = lowestMinWidth(preceding)
  return minWidth === undefined
    ? preceding.map(negate).join(' and ')
    : negate(`(min-width: ${minWidth}px)`)
}

/**
 * Combine each condition of a source's query list with the exclusion of the
 * queries before it.
 */
function combine(queries: string[], exclusion: string): string {
  return queries
    .map((query) => {
      // Only a chain of `and` can be extended as it is. 'or' and 'not' need
      // parentheses: '(a) or (b) and (c)' is not a valid query.
      const words = getTopLevelWords(query)
      const own = words.every((word) => word === 'and') ? query : `(${query})`
      return `${own} and ${exclusion}`
    })
    .join(', ')
}

function preloadLink(imagesrcset: string, media?: string): PreloadLink {
  return { rel: 'preload', as: 'image', imagesrcset, media }
}

/**
 * Build the preload links for the given sources.
 *
 * <picture> picks the first matching <source>, but every matching preload link
 * is fetched, so the links have to be made mutually exclusive by hand: one link
 * per source, in the same order as the <source> elements, each excluding the
 * queries before it. When every source has a media query, a last link covers
 * the <img>, which renders when none of them matches.
 *
 * A query with a media type, like 'screen and (min-width: 768px)', can not be
 * excluded, so the links end before the source after it. Some widths then
 * preload nothing, which is better than preloading two images.
 */
export function getPreloadLinks(sources: PictureSource[]): PreloadLink[] {
  const links: PreloadLink[] = []
  // The queries of the sources so far, split at their commas.
  const preceding: string[] = []

  for (const source of sources) {
    const queries = splitQueryList(source.media || '')
    const exclusion = exclude(preceding)

    // A source without a media query always matches, so no later source can.
    if (!queries.length) {
      links.push(preloadLink(source.srcset, exclusion))
      return links
    }

    if (!queries.every(isCondition)) {
      if (!exclusion) {
        links.push(preloadLink(source.srcset, source.media))
      }
      return links
    }

    links.push(
      preloadLink(
        source.srcset,
        exclusion ? combine(queries, exclusion) : source.media,
      ),
    )
    preceding.push(...queries)
  }

  const fallback = getFallbackSource(sources)
  if (fallback) {
    links.push(preloadLink(fallback.srcset, exclude(preceding)))
  }

  return links
}
