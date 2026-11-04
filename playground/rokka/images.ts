/**
 * The test images of the playground's rokka organization.
 *
 * `generate.ts` renders them to PNG files in `images/`, which are committed:
 * rokka derives the hash from the file's bytes, so the hashes only stay the
 * same as long as the files do. `setup.ts` uploads them.
 */

export type FocalPoint = {
  /** The center of the circle, in pixels of the image. */
  x: number
  y: number
  radius: number
}

export type TestImage = {
  /** The file name, in `images/` and in rokka. */
  name: string
  width: number
  height: number
  /** A black circle, uploaded as the subject area of the image. */
  focalPoint?: FocalPoint
}

export const IMAGES: TestImage[] = [
  { name: 'square.png', width: 4000, height: 4000 },
  {
    name: 'square-focal-point.png',
    width: 4000,
    height: 4000,
    // Outside the middle of the image, so that a crop that ignores the subject
    // area cuts the circle off: a 16:9 crop of the middle keeps y 875 to 3125,
    // a 2:5 crop of the middle x 1200 to 2800.
    focalPoint: { x: 3000, y: 700, radius: 100 },
  },
]

/** The subject area for rokka: the box around the circle. */
export function getSubjectArea({ x, y, radius }: FocalPoint) {
  return {
    x: x - radius,
    y: y - radius,
    width: radius * 2,
    height: radius * 2,
  }
}

function getRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
  const divisor = gcd(width, height)
  return `${width / divisor}:${height / divisor}`
}

/**
 * A black border, the aspect ratio centered on the middle of the image and the
 * size below it. A crop shows as a missing border or an off-center ratio, a
 * distortion as stretched text.
 */
export function toSvg(image: TestImage): string {
  const { width, height, focalPoint } = image
  const border = Math.round(Math.min(width, height) * 0.02)
  const text = Math.round(Math.min(width, height) * 0.2)
  const x = width / 2
  const y = height / 2
  const captions = [`${width} × ${height}`]
  if (focalPoint) {
    captions.push('focal point')
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="sans-serif" text-anchor="middle">
  <rect width="${width}" height="${height}" fill="#fff" />
  <rect x="${border / 2}" y="${border / 2}" width="${width - border}" height="${height - border}" fill="none" stroke="#000" stroke-width="${border}" />
  <text x="${x}" y="${y}" dominant-baseline="central" font-size="${text}" font-weight="bold">${getRatio(width, height)}</text>
  ${captions.map((caption, index) => `<text x="${x}" y="${y + text * (0.9 + index * 0.4)}" font-size="${text * 0.3}">${caption}</text>`).join('\n  ')}
  ${focalPoint ? `<circle cx="${focalPoint.x}" cy="${focalPoint.y}" r="${focalPoint.radius}" fill="#000" />` : ''}
</svg>`
}
