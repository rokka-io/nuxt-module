import { describe, it, expect } from 'vitest'
import {
  getSizesAttribute,
  getSrcsetCandidates,
} from '../../src/runtime/helpers/sizes'

const VIEWPORTS = {
  fallback: 0,
  sm: 768,
  md: 1024,
  lg: 1280,
}

describe('getSrcsetCandidates', () => {
  it('renders every width at every density', () => {
    expect(
      getSrcsetCandidates({ fallback: 300, md: 500 }, ['', '1.5']).map((v) => [
        v.width,
        v.dpr,
        v.descriptor,
      ]),
    ).toEqual([
      [300, '', 300],
      [300, '1.5', 450],
      [500, '', 500],
      [500, '1.5', 750],
    ])
  })

  it('lists a file width once, with the lower density', () => {
    // 400 at 2x and 800 at 1x are both 800 pixels wide.
    expect(
      getSrcsetCandidates({ fallback: 400, md: 800 }, ['', '2']).map((v) => [
        v.width,
        v.dpr,
        v.descriptor,
      ]),
    ).toEqual([
      [400, '', 400],
      [800, '', 800],
      [800, '2', 1600],
    ])
  })

  it('skips entries without a width', () => {
    expect(getSrcsetCandidates({ fallback: undefined, md: 500 }, [''])).toEqual(
      [{ width: 500, dpr: '', descriptor: 500 }],
    )
    expect(getSrcsetCandidates({}, ['', '2'])).toEqual([])
  })
})

describe('getSizesAttribute', () => {
  it('uses the min-width of each viewport, largest first', () => {
    expect(getSizesAttribute({ sm: 300, lg: 900, md: 600 }, VIEWPORTS)).toBe(
      '(min-width: 1280px) 900px, (min-width: 1024px) 600px, (min-width: 768px) 300px',
    )
  })

  it('gives the fallback viewport no media query', () => {
    expect(getSizesAttribute({ fallback: 200, md: 600 }, VIEWPORTS)).toBe(
      '(min-width: 1024px) 600px, 200px',
    )
  })

  it('skips entries without a width', () => {
    expect(getSizesAttribute({ fallback: undefined, md: 600 }, VIEWPORTS)).toBe(
      '(min-width: 1024px) 600px',
    )
  })
})
