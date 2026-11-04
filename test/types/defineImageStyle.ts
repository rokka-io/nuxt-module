/**
 * Type-level tests for the public image style types.
 *
 * Nothing here runs: `npm run typecheck:test` fails when a valid config stops
 * compiling, or when an invalid one (marked with @ts-expect-error) compiles.
 */
import { expectTypeOf } from 'vitest'
import { defineImageStyle } from '../../src/runtime/composables/rokka/defineImageStyle'
import type {
  DefineImageStyleConfigPictures,
  DefineImageStyleConfigPicturesViewport,
  DefineImageStyleConfigSingle,
  DefineImageStyleConfigSizes,
} from '../../src/runtime/types'

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

// @ts-expect-error An entry needs a width, or a height with an aspect ratio.
defineImageStyle({
  type: 'pictures',
  pictures: { md: { height: 500 } },
})

// With a root aspect ratio, a height alone is enough.
defineImageStyle({
  type: 'pictures',
  aspectRatio: 2,
  pictures: { md: { height: 500 } },
})
defineImageStyle({
  type: 'pictures',
  aspectRatio: 2,
  pictures: [{ viewport: 'md', height: 500 }],
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

defineImageStyle({
  type: 'single',
  width: 100,
  // @ts-expect-error Unknown properties are rejected for every type.
  heigth: 100,
})

defineImageStyle({
  type: 'sizes',
  sizes: { md: 100 },
  // @ts-expect-error Unknown properties are rejected for every type.
  aspectratio: 2,
})

// The style keeps its type, so its properties can be read.
const single = defineImageStyle({ type: 'single', width: 100 })
expectTypeOf(single).toEqualTypeOf<DefineImageStyleConfigSingle>()
expectTypeOf(single.width).toEqualTypeOf<number>()

const sizes = defineImageStyle({ type: 'sizes', sizes: { md: 100 } })
expectTypeOf(sizes).toEqualTypeOf<DefineImageStyleConfigSizes>()

const pictures = defineImageStyle({
  type: 'pictures',
  pictures: { md: { width: 100 } },
})
expectTypeOf(pictures).toEqualTypeOf<DefineImageStyleConfigPictures>()
// The README's upgrade note.
if (Array.isArray(pictures.pictures)) {
  expectTypeOf(pictures.pictures[0]!.media).toEqualTypeOf<string | undefined>()
}
