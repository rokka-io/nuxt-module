/**
 * Type-level tests for the public image style types.
 *
 * Nothing here runs: `npm run typecheck:test` fails when a valid config stops
 * compiling, or when an invalid one (marked with @ts-expect-error) compiles.
 */
import { expectTypeOf } from 'vitest'
import { defineImageStyle } from '../../src/runtime/composables/rokka/defineImageStyle'
import type { DefineImageStyleConfigPicturesViewport } from '../../src/runtime/types'

// Object syntax: a width, or a height with an aspect ratio.
defineImageStyle({
  type: 'pictures',
  aspectRatio: 16 / 9,
  pictures: {
    fallback: { width: 200 },
    sm: { width: 300, aspectRatio: 1 },
    md: { height: 550, aspectRatio: 16 / 9 },
    lg: { width: 1024, height: 300 },
  },
})

// Array syntax: viewports, media queries and the fallback viewport.
defineImageStyle({
  type: 'pictures',
  pictures: [
    { media: '(min-height: 1200px)', width: 500, height: 500 },
    { viewport: 'md', height: 400, aspectRatio: 2 },
    { viewport: 'fallback', width: 300 },
  ],
})

defineImageStyle({
  type: 'pictures',
  // @ts-expect-error An entry needs a width, or a height with an aspect ratio.
  pictures: { md: { height: 500 } },
})

defineImageStyle({
  type: 'pictures',
  // @ts-expect-error An entry needs a width, or a height with an aspect ratio.
  pictures: { md: { aspectRatio: 2 } },
})

defineImageStyle({
  type: 'pictures',
  pictures: [
    // @ts-expect-error An entry can not have both a viewport and a media query.
    { viewport: 'md', media: '(min-height: 600px)', width: 100 },
  ],
})

defineImageStyle({
  type: 'pictures',
  // @ts-expect-error Unknown properties are rejected, so typos are caught.
  pictures: { md: { width: 100, aspectratio: 2 } },
})

// The width can be read from either variant of an entry.
declare const entry: DefineImageStyleConfigPicturesViewport
expectTypeOf(entry.width).toEqualTypeOf<number | undefined>()
