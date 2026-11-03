import { describe, it, expect } from 'vitest'
import {
  getMediaQueryFromViewport,
  getPictureConfigs,
  getWidth,
  getHeight,
  getFallbackSource,
  getPreloadLinks,
  type PictureConfig,
  type PictureSource,
} from '../../src/runtime/helpers/picture'

const VIEWPORTS = {
  fallback: 0,
  sm: 768,
  md: 1024,
  lg: 1280,
  xl: 1680,
}

/**
 * Build a minimal source, so tests can focus on media/minWidth handling.
 *
 * When no media query is given it is derived from minWidth, the same way
 * getPictureConfigs() does it for viewport-based entries.
 */
function source(v: Partial<PictureSource> & { width: number }): PictureSource {
  // An explicit `media: undefined` means "fallthrough source", which is what
  // the object syntax produces for the smallest viewport.
  const media =
    'media' in v
      ? v.media
      : v.minWidth
        ? `(min-width: ${v.minWidth}px)`
        : undefined

  return {
    srcset: `w-${v.width} 1x`,
    src: `w-${v.width}`,
    ...v,
    media,
  }
}

/**
 * Turn normalised configs into sources, keeping their media queries as is.
 */
function toSources(configs: PictureConfig[]): PictureSource[] {
  return configs.map((config) =>
    source({
      width: config.width ?? 0,
      viewport: config.viewport,
      minWidth: config.minWidth,
      media: config.media,
    }),
  )
}

describe('getMediaQueryFromViewport', () => {
  it('builds a min-width query for a viewport', () => {
    expect(getMediaQueryFromViewport(VIEWPORTS, 'md')).toBe(
      '(min-width: 1024px)',
    )
  })

  it('returns undefined for the fallback viewport', () => {
    expect(getMediaQueryFromViewport(VIEWPORTS, 'fallback')).toBeUndefined()
  })

  it('returns undefined when no viewport is given', () => {
    expect(getMediaQueryFromViewport(VIEWPORTS, undefined)).toBeUndefined()
  })

  it('returns undefined for a viewport that does not exist', () => {
    expect(getMediaQueryFromViewport(VIEWPORTS, 'xxl')).toBeUndefined()
  })
})

describe('getPictureConfigs (object syntax)', () => {
  it('sorts viewports by min-width, largest first', () => {
    const configs = getPictureConfigs(
      {
        md: { width: 400 },
        xl: { width: 600 },
        sm: { width: 300 },
        lg: { width: 500 },
      },
      VIEWPORTS,
    )

    expect(configs.map((v) => v.viewport)).toEqual(['xl', 'lg', 'md', 'sm'])
  })

  it('removes the media query from the smallest viewport', () => {
    const configs = getPictureConfigs(
      { sm: { width: 300 }, md: { width: 400 } },
      VIEWPORTS,
    )

    expect(configs.map((v) => v.media)).toEqual([
      '(min-width: 1024px)',
      undefined,
    ])
  })

  it('sorts the fallback viewport last and leaves it without a media query', () => {
    const configs = getPictureConfigs(
      { md: { width: 400 }, fallback: { width: 200 }, sm: { width: 300 } },
      VIEWPORTS,
    )

    expect(configs.map((v) => [v.viewport, v.media])).toEqual([
      ['md', '(min-width: 1024px)'],
      ['sm', '(min-width: 768px)'],
      ['fallback', undefined],
    ])
  })

  it('inherits the root aspect ratio, but lets an entry override it', () => {
    const configs = getPictureConfigs(
      { sm: { width: 300 }, md: { width: 400, aspectRatio: 1 } },
      VIEWPORTS,
      16 / 9,
    )

    expect(configs.map((v) => [v.viewport, v.aspectRatio])).toEqual([
      ['md', 1],
      ['sm', 16 / 9],
    ])
  })

  it('normalises every entry and skips empty ones', () => {
    const configs = getPictureConfigs(
      {
        sm: { width: 300 },
        md: undefined,
        xl: { height: 500, aspectRatio: 2 },
        lg: { width: 1000, height: 400 },
      },
      VIEWPORTS,
      16 / 9,
    )

    expect(configs).toEqual([
      {
        viewport: 'xl',
        media: '(min-width: 1680px)',
        height: 500,
        aspectRatio: 2,
        minWidth: 1680,
      },
      {
        viewport: 'lg',
        media: '(min-width: 1280px)',
        width: 1000,
        height: 400,
        aspectRatio: 16 / 9,
        minWidth: 1280,
      },
      {
        viewport: 'sm',
        media: undefined,
        width: 300,
        aspectRatio: 16 / 9,
        minWidth: 768,
      },
    ])
  })
})

describe('getPictureConfigs (array syntax)', () => {
  it('preserves the order given by the user', () => {
    const configs = getPictureConfigs(
      [
        { media: '(min-height: 600px)', width: 200 },
        { viewport: 'xl', width: 600 },
        { media: '(orientation: landscape)', width: 400 },
      ],
      VIEWPORTS,
    )

    expect(configs.map((v) => v.media)).toEqual([
      '(min-height: 600px)',
      '(min-width: 1680px)',
      '(orientation: landscape)',
    ])
  })

  it('does not assign a min-width to media-query entries', () => {
    const configs = getPictureConfigs(
      [
        { media: '(min-height: 600px)', width: 200 },
        { viewport: 'xl', width: 600 },
      ],
      VIEWPORTS,
    )

    expect(configs.map((v) => v.minWidth)).toEqual([undefined, 1680])
  })

  it('prefers an explicit media query over the viewport', () => {
    const configs = getPictureConfigs(
      [{ viewport: 'xl', media: '(min-height: 600px)', width: 200 }],
      VIEWPORTS,
    )

    expect(configs[0]!.media).toBe('(min-height: 600px)')
  })

  it('normalises every entry and keeps the media query of the last one', () => {
    const configs = getPictureConfigs(
      [
        { viewport: 'xl', width: 1680 },
        { viewport: 'md', media: '', height: 400, aspectRatio: 2 },
        { media: '', width: 300 },
        { media: '(min-height: 600px)', width: 200 },
      ],
      VIEWPORTS,
      16 / 9,
    )

    expect(configs).toEqual([
      {
        viewport: 'xl',
        media: '(min-width: 1680px)',
        width: 1680,
        aspectRatio: 16 / 9,
        minWidth: 1680,
      },
      {
        viewport: 'md',
        media: '(min-width: 1024px)',
        height: 400,
        aspectRatio: 2,
        minWidth: 1024,
      },
      {
        media: undefined,
        width: 300,
        aspectRatio: 16 / 9,
      },
      {
        media: '(min-height: 600px)',
        width: 200,
        aspectRatio: 16 / 9,
      },
    ])
  })
})

describe('getWidth', () => {
  it('uses an explicit width', () => {
    expect(getWidth({ width: 400 }, VIEWPORTS)).toBe(400)
  })

  it('derives the width from height and aspect ratio', () => {
    expect(getWidth({ height: 300, aspectRatio: 16 / 9 }, VIEWPORTS)).toBe(533)
  })

  it('falls back to the viewport min-width', () => {
    expect(getWidth({ viewport: 'md' }, VIEWPORTS)).toBe(1024)
  })

  it('falls back to the source width when there is no viewport', () => {
    expect(getWidth({ media: '(min-height: 600px)' }, VIEWPORTS, 1920)).toBe(
      1920,
    )
  })
})

describe('getHeight', () => {
  it('uses an explicit height', () => {
    expect(getHeight({ width: 400, height: 123 }, VIEWPORTS)).toBe(123)
  })

  it('derives the height from width and aspect ratio', () => {
    expect(getHeight({ width: 400, aspectRatio: 4 / 3 }, VIEWPORTS)).toBe(300)
  })

  it('returns undefined when there is nothing to derive a height from', () => {
    expect(getHeight({ width: 400 }, VIEWPORTS)).toBeUndefined()
  })

  it('derives the height from the viewport min-width and aspect ratio', () => {
    const spec = { viewport: 'md', aspectRatio: 16 / 9 }

    // Same proportions as getWidth(), which falls back to the min-width.
    expect(getWidth(spec, VIEWPORTS)).toBe(1024)
    expect(getHeight(spec, VIEWPORTS)).toBe(576)
  })

  // This is the behaviour change versus v1: previously a root-level
  // aspectRatio only affected the width/height attributes, while the
  // generated URL stayed uncropped. Producing a height here is what makes
  // the component switch to the crop stack.
  it('derives a height for width-only entries that inherit the root aspect ratio', () => {
    const configs = getPictureConfigs(
      { sm: { width: 90 }, xl: { width: 110 } },
      VIEWPORTS,
      1,
    )

    expect(configs.map((v) => getHeight(v, VIEWPORTS))).toEqual([110, 90])
  })
})

describe('getFallbackSource', () => {
  it('prefers the explicit fallback viewport', () => {
    const sources = [
      source({ width: 400, viewport: 'md', minWidth: 1024 }),
      source({ width: 300, viewport: 'sm', minWidth: 768 }),
      source({ width: 200, viewport: 'fallback', minWidth: 0 }),
    ]

    expect(getFallbackSource(sources)?.width).toBe(200)
  })

  it('uses the smallest viewport when its min-width is 0', () => {
    // The default viewports of the module.
    const viewports = { fallback: 0, sm: 0, md: 768, lg: 1024 }
    const sources = toSources(
      getPictureConfigs(
        { sm: { width: 300 }, md: { width: 700 }, lg: { width: 1000 } },
        viewports,
      ),
    )

    expect(getFallbackSource(sources)?.width).toBe(300)
  })

  it('uses an entry with an empty media query', () => {
    // The array example from the README.
    const sources = toSources(
      getPictureConfigs(
        [
          { media: '(min-height: 1200px)', width: 500, height: 500 },
          { media: '(min-height: 600px)', width: 200, aspectRatio: 4 / 3 },
          { viewport: 'md', width: 100 },
          { media: '', width: 2000 },
        ],
        VIEWPORTS,
      ),
    )

    expect(getFallbackSource(sources)?.width).toBe(2000)
  })

  it('uses the lowest min-width when every source has a media query', () => {
    const sources = [
      source({ width: 400, viewport: 'md', minWidth: 1024 }),
      source({ width: 300, viewport: 'sm', minWidth: 768 }),
    ]

    expect(getFallbackSource(sources)?.width).toBe(300)
  })

  it('prefers a viewport entry over a later media-query entry', () => {
    const sources = [
      source({ width: 600, viewport: 'lg', minWidth: 1280 }),
      source({ width: 400, viewport: 'sm', minWidth: 768 }),
      source({ width: 200, media: '(min-height: 600px)' }),
    ]

    expect(getFallbackSource(sources)?.width).toBe(400)
  })

  it('skips a viewport with a min-width of 0 that has a media query', () => {
    const sources = [
      source({ width: 600, viewport: 'lg', minWidth: 1280 }),
      source({
        width: 100,
        viewport: 'fallback',
        minWidth: 0,
        media: '(min-height: 600px)',
      }),
    ]

    expect(getFallbackSource(sources)?.width).toBe(600)
  })

  it('uses the last source for media-query-only configs', () => {
    const sources = [
      source({ width: 400, media: '(min-width: 1280px)' }),
      source({ width: 200, media: '(min-height: 600px)' }),
    ]

    expect(getFallbackSource(sources)?.width).toBe(200)
  })

  it('returns undefined when there are no sources', () => {
    expect(getFallbackSource([])).toBeUndefined()
  })
})

describe('getPreloadLinks', () => {
  it('emits one link per source', () => {
    expect(getPreloadLinks(threeViewportSources())).toHaveLength(3)
  })

  it('emits a single link for a source without a media query', () => {
    const sources = [source({ width: 300, viewport: 'fallback', minWidth: 0 })]

    expect(getPreloadLinks(sources)).toEqual([
      {
        rel: 'preload',
        as: 'image',
        imagesrcset: 'w-300 1x',
        media: undefined,
      },
    ])
  })

  it('preloads the <img> when every source has a media query', () => {
    // The <img> renders when no source matches, with the srcset of the source
    // with the lowest min-width.
    const sources = [
      source({ width: 400, media: '(min-width: 1280px)' }),
      source({ width: 300, viewport: 'sm', minWidth: 768 }),
    ]

    expect(
      getPreloadLinks(sources).map((v) => [v.imagesrcset, v.media]),
    ).toEqual([
      ['w-400 1x', '(min-width: 1280px)'],
      ['w-300 1x', '(min-width: 768px) and (not (min-width: 1280px))'],
      ['w-300 1x', '(not (min-width: 768px))'],
    ])
  })

  it('preloads every source, including media-query ones', () => {
    const sources = [
      source({ width: 400, media: '(min-width: 1280px)' }),
      source({ width: 200, media: '(min-height: 600px)' }),
    ]

    expect(getPreloadLinks(sources)).toHaveLength(3)
  })

  it('preloads the fallback source', () => {
    const sources = [
      source({ width: 400, viewport: 'md', minWidth: 1024 }),
      source({ width: 300, viewport: 'sm', minWidth: 768 }),
      source({ width: 200, viewport: 'fallback', minWidth: 0 }),
    ]

    expect(getPreloadLinks(sources).map((v) => v.imagesrcset)).toContain(
      'w-200 1x',
    )
  })

  it('preloads exactly one image for any given viewport width', () => {
    const links = getPreloadLinks(threeViewportSources())

    // Zoom can make the viewport a fraction of a pixel wide, such as 1279.5px
    // just below the 1280px viewport.
    for (const width of [400, 800, 1279.5, 1300, 1679.5, 1700]) {
      const matching = links.filter((v) => matchesWidth(v.media, width))
      expect(matching, `at ${width}px`).toHaveLength(1)
    }
  })

  it('stops at a source without a media query', () => {
    const sources = [
      source({ width: 400, viewport: 'md', minWidth: 1024 }),
      source({ width: 200, viewport: 'fallback', minWidth: 0 }),
      // Unreachable: the fallback above always matches.
      source({ width: 100, viewport: 'sm', minWidth: 768 }),
    ]

    expect(getPreloadLinks(sources).map((v) => v.imagesrcset)).toEqual([
      'w-400 1x',
      'w-200 1x',
    ])
  })

  it('collapses min-width exclusions into one', () => {
    expect(getPreloadLinks(threeViewportSources()).map((v) => v.media)).toEqual(
      [
        '(min-width: 1680px)',
        '(min-width: 1280px) and (not (min-width: 1680px))',
        '(not (min-width: 1280px))',
      ],
    )
  })

  it('falls back to `not` when a preceding query is not a min-width', () => {
    const sources = [
      source({ width: 200, media: '(min-height: 600px)' }),
      source({ width: 400, media: '(min-width: 1280px)' }),
    ]

    expect(getPreloadLinks(sources).map((v) => v.media)).toEqual([
      '(min-height: 600px)',
      '(min-width: 1280px) and (not (min-height: 600px))',
      '(not (min-height: 600px)) and (not (min-width: 1280px))',
    ])
  })

  it('excludes every query of a comma list', () => {
    const sources = [
      source({ width: 400, media: '(min-width: 1280px), (min-height: 900px)' }),
      source({ width: 200, media: undefined }),
    ]

    expect(getPreloadLinks(sources).map((v) => v.media)).toEqual([
      '(min-width: 1280px), (min-height: 900px)',
      '(not (min-width: 1280px)) and (not (min-height: 900px))',
    ])
  })

  it('collapses a comma list of min-widths into one', () => {
    const sources = [
      source({ width: 400, media: '(min-width: 1280px), (min-width: 900px)' }),
      source({ width: 200, media: undefined }),
    ]

    expect(getPreloadLinks(sources)[1]!.media).toBe('(not (min-width: 900px))')
  })

  it('does not collapse a min-width of 0 or one in other units', () => {
    const sources = [
      source({ width: 400, media: '(min-width: 48em)' }),
      source({ width: 300, media: '(min-width: 0px)' }),
      source({ width: 200, media: undefined }),
    ]

    expect(getPreloadLinks(sources).map((v) => v.media)).toEqual([
      '(min-width: 48em)',
      '(min-width: 0px) and (not (min-width: 48em))',
      '(not (min-width: 48em)) and (not (min-width: 0px))',
    ])
  })
  it('adds the exclusion to every query of a comma list', () => {
    const sources = [
      source({ width: 400, media: '(min-width: 1280px)' }),
      source({
        width: 200,
        media: '(orientation: portrait), (min-width: 600px)',
      }),
    ]

    expect(getPreloadLinks(sources)[1]!.media).toBe(
      '(orientation: portrait) and (not (min-width: 1280px)), (min-width: 600px) and (not (min-width: 1280px))',
    )
  })

  it('negates a chain of conditions as a whole', () => {
    const sources = [
      source({
        width: 400,
        media: '(min-width: 600px) and (min-height: 400px)',
      }),
      source({ width: 200, media: undefined }),
    ]

    expect(getPreloadLinks(sources)[1]!.media).toBe(
      '(not ((min-width: 600px) and (min-height: 400px)))',
    )
  })

  it('puts parentheses around a condition with `or` or `not`', () => {
    const sources = [
      source({ width: 400, media: '(min-width: 1280px)' }),
      source({
        width: 300,
        media: '(orientation: portrait) or (min-height: 900px)',
      }),
      source({ width: 200, media: 'not (min-width: 600px)' }),
    ]

    expect(getPreloadLinks(sources).map((v) => v.media)).toEqual([
      '(min-width: 1280px)',
      '((orientation: portrait) or (min-height: 900px)) and (not (min-width: 1280px))',
      '(not (min-width: 600px)) and (not (min-width: 1280px)) and (not ((orientation: portrait) or (min-height: 900px)))',
      '(not (min-width: 1280px)) and (not ((orientation: portrait) or (min-height: 900px))) and (not (not (min-width: 600px)))',
    ])
  })

  it('stops before the source after a query with a media type', () => {
    const sources = [
      source({ width: 400, media: 'screen and (min-width: 1280px)' }),
      source({ width: 300, media: '(min-width: 600px)' }),
      source({ width: 200, media: undefined }),
    ]

    expect(getPreloadLinks(sources).map((v) => v.media)).toEqual([
      'screen and (min-width: 1280px)',
    ])
  })

  it('stops at a query with a media type after other sources', () => {
    const sources = [
      source({ width: 400, media: '(min-width: 1280px)' }),
      source({ width: 300, media: 'screen and (min-width: 600px)' }),
      source({ width: 200, media: undefined }),
    ]

    expect(getPreloadLinks(sources).map((v) => v.media)).toEqual([
      '(min-width: 1280px)',
    ])
  })
})

/**
 * What the object syntax produces for three viewports: sorted largest first,
 * with the smallest one acting as the fallthrough (no media query).
 */
function threeViewportSources() {
  return [
    source({ width: 600, viewport: 'xl', minWidth: 1680 }),
    source({ width: 400, viewport: 'lg', minWidth: 1280 }),
    source({ width: 300, viewport: 'sm', minWidth: 768, media: undefined }),
  ]
}

/**
 * Split on ' and ' that is not nested inside parentheses.
 */
function splitTopLevelAnd(media: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''

  for (let i = 0; i < media.length; i++) {
    const char = media[i]!
    if (char === '(') depth++
    if (char === ')') depth--
    if (depth === 0 && media.startsWith(' and ', i)) {
      parts.push(current.trim())
      current = ''
      i += 4
      continue
    }
    current += char
  }

  parts.push(current.trim())
  return parts.filter(Boolean)
}

/**
 * Evaluate the subset of media query syntax this module generates against a
 * viewport width. Throws on anything it does not understand, so that an
 * unexpected format is never silently treated as "does not match".
 */
function matchesWidth(media: string | undefined, width: number): boolean {
  if (!media) {
    return true
  }

  return splitTopLevelAnd(media).every((part) => {
    const not = part.match(/^\(not (.+)\)$/)
    if (not) {
      return !matchesWidth(not[1]!.trim(), width)
    }

    const min = part.match(/^\(\s*min-width:\s*(\d+)px\s*\)$/)
    if (min) {
      return width >= Number(min[1])
    }

    throw new Error(`Unsupported media query in test matcher: ${part}`)
  })
}

describe('matchesWidth (test helper)', () => {
  it('evaluates the query shapes used by the preload links', () => {
    expect(matchesWidth(undefined, 100)).toBe(true)
    expect(matchesWidth('(min-width: 768px)', 800)).toBe(true)
    expect(matchesWidth('(min-width: 768px)', 700)).toBe(false)
    expect(matchesWidth('(not (min-width: 768px))', 700)).toBe(true)
    expect(matchesWidth('(not (min-width: 768px))', 800)).toBe(false)
    expect(
      matchesWidth('(min-width: 768px) and (not (min-width: 1024px))', 800),
    ).toBe(true)
    expect(
      matchesWidth('(min-width: 768px) and (not (min-width: 1024px))', 1100),
    ).toBe(false)
  })
})
