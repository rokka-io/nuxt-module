/**
 * Pure helpers for the <RokkaImage> sizes variant.
 *
 * Like picture.ts, they take the viewports and densities as arguments instead
 * of importing '#rokka/generated-types', so that they can be unit tested in a
 * plain node environment.
 */

/**
 * The `sizes` property of the image style: viewport name => width.
 */
export type SizesInput = Partial<Record<string, number>>

/**
 * One image of the srcset.
 */
export type SrcsetCandidate = {
  /**
   * The width the image is displayed at, in CSS pixels.
   */
  width: number

  /**
   * The density, '' for 1x.
   */
  dpr: string

  /**
   * The width of the rendered file: the `w` descriptor.
   */
  descriptor: number
}

/**
 * The entries of `sizes` that have a width.
 */
function getEntries(sizes: SizesInput): [string, number][] {
  return Object.entries(sizes).filter(
    (entry): entry is [string, number] => !!entry[1],
  )
}

/**
 * Every width at every density, in the order of `sizes`.
 *
 * Two candidates can render a file of the same width, such as 400 at 2x and
 * 800 at 1x. A srcset must not repeat a `w` descriptor, so only the one with
 * the lower density is kept: rokka renders higher densities at a lower
 * quality, which suits only high-density screens.
 */
export function getSrcsetCandidates(
  sizes: SizesInput,
  dpr: readonly string[],
): SrcsetCandidate[] {
  const byDescriptor = new Map<number, SrcsetCandidate>()

  for (const [, width] of getEntries(sizes)) {
    for (const value of dpr) {
      const density = Number.parseFloat(value || '1')
      const descriptor = Math.round(width * density)
      const existing = byDescriptor.get(descriptor)

      if (!existing || density < Number.parseFloat(existing.dpr || '1')) {
        byDescriptor.set(descriptor, { width, dpr: value, descriptor })
      }
    }
  }

  return [...byDescriptor.values()]
}

/**
 * The sizes attribute: the width for each viewport, largest viewport first.
 *
 * A viewport with a min-width of 0, such as `fallback`, gets no media query,
 * so it applies to every screen below the other viewports.
 */
export function getSizesAttribute(
  sizes: SizesInput,
  viewports: Record<string, number>,
): string {
  return getEntries(sizes)
    .map(([viewport, width]) => ({
      width,
      minWidth: viewports[viewport] ?? 0,
    }))
    .sort((a, b) => b.minWidth - a.minWidth)
    .map((v) =>
      v.minWidth > 0
        ? `(min-width: ${v.minWidth}px) ${v.width}px`
        : `${v.width}px`,
    )
    .join(', ')
}
