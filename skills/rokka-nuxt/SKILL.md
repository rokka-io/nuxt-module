---
name: rokka-nuxt
description: >-
  Render rokka.io images in Nuxt with @rokka-io/nuxt: `<RokkaImage>`,
  `defineImageStyle()`, `buildRokkaUrl()`. Use when adding or changing an image
  from rokka or a remote image rendered through rokka, choosing an image style
  for a design, configuring the `rokka` options in nuxt.config, or debugging a
  rokka URL that fails, crops wrong or shows a stale image.
license: MIT
---

# rokka images in Nuxt

`@rokka-io/nuxt` turns a rokka image and an **image style** into a responsive
`<img>` or `<picture>`, with render URLs for the configured viewports and pixel
densities. For rokka itself (source images, hashes, stacks, render URLs,
caching, subject areas), read [references/rokka.md](references/rokka.md).

This covers version 2 of the module. Look up the installed version in
`node_modules/@rokka-io/nuxt/package.json`; with 1.x, read
[Version 1](#version-1) first.

## Add an image

1. **Find the source data.** A rokka image is identified by its hash. Projects
   store it together with the source image's `width`, `height` and file `name`,
   usually in the CMS; use all four. An image that is not stored in rokka goes
   through `remote` instead, see [Remote images](#remote-images).
2. **Choose the type** of image style for the design slot, see
   [Choose the type](#choose-the-type).
3. **Define the image style** with `defineImageStyle()`, once per slot, and
   reuse it wherever the slot appears.
4. **Render** `<RokkaImage>` with the source data and the image style.
5. **Check the output.** Load the page and request one URL from `src`, from
   `srcset` and from every `<source srcset>`. Done when each returns 200 with an
   image content type, and the elements carry the `width` and `height`
   attributes that [Width and height](#width-and-height) promises for the type.
   Otherwise read rokka's JSON error, see [Debugging](#debugging).

```vue
<script setup lang="ts">
defineProps<{
  image: {
    hash: string
    width: number
    height: number
    name: string
    alt: string
  }
}>()

const teaserImage = defineImageStyle({
  type: 'sizes',
  aspectRatio: 3 / 2,
  sizes: { fallback: 340, md: 460, lg: 380 },
})
</script>

<template>
  <RokkaImage
    :hash="image.hash"
    :config="teaserImage"
    :source-width="image.width"
    :source-height="image.height"
    :file-name="image.name"
    :alt="image.alt"
    loading="lazy"
  />
</template>
```

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@rokka-io/nuxt'],
  rokka: {
    host: 'myorg.rokka.io',
    viewports: { sm: 0, md: 768, lg: 1024, xl: 1440 },
    dpr: ['', '2'],
    stacks: { crop: 'fe_nuxt_crop', noCrop: 'fe_nuxt_no_crop' },
  },
})
```

- **`host`**: the render host of the rokka organization,
  `{organization}.rokka.io`. It lands in the public runtime config, so
  `NUXT_PUBLIC_ROKKA_HOST` overrides it at runtime.
- **`viewports`**: viewport names and their min-width in pixels; match the
  project's CSS breakpoints. Image styles are typed against these names. A
  `fallback` viewport with min-width 0 is always added, so the name `fallback`
  is reserved. Default: `{ sm: 0, md: 768, lg: 1024 }`, used only when the
  option is not set.
- **`dpr`**: the pixel densities that `sizes` and `pictures` render, as strings,
  `''` for 1x. Default: `['', '2']`. Every extra density is one more URL per
  entry.
- **`stacks`**: the two stacks every image style renders with. Default:
  `fe_nuxt_crop` and `fe_nuxt_no_crop`. Both must exist in the organization:
  [references/stacks.md](references/stacks.md) has their definitions and the API
  call that creates them. `NUXT_PUBLIC_ROKKA_STACK_CROP` and
  `NUXT_PUBLIC_ROKKA_STACK_NO_CROP` override them at runtime.

`viewports` and `dpr` are compiled into the app, so changing them needs a
rebuild.

`<RokkaImage>` is registered globally. `defineImageStyle()` and
`buildRokkaUrl()` are auto-imported; with auto-imports turned off, import them
from `#imports`. The types come from `#rokka/types`, for example
`DefineImageStyleConfig` for a prop that takes an image style.

## Choose the type

| The image in the design                                   | Type                     |
| --------------------------------------------------------- | ------------------------ |
| Same aspect ratio at every viewport, width follows layout | `sizes`                  |
| Aspect ratio or crop changes per viewport (art direction) | `pictures`               |
| One fixed size, no high-density variants                  | `single`                 |
| An existing rokka stack with its own operations           | the stack name as config |

**Cropping.** An image whose width and height are both known, through a `height`
or an `aspectRatio`, is cropped with the crop stack. With only a width, it keeps
the aspect ratio of the source image and renders with the no-crop stack. With
the module's stack definitions the crop centers on the image's
[subject area](references/rokka.md#subject-area) if it has one, else on the
middle.

### sizes

```ts
defineImageStyle({
  type: 'sizes',
  aspectRatio: 16 / 9,
  sizes: { fallback: 375, md: 720, lg: 960 },
})
```

Renders one `<img>` with a `srcset` (every width at every density, as `w`
descriptors) and a `sizes` attribute built from the viewports. Each value is the
width in CSS pixels that the image is displayed at, from that viewport up to the
next; the browser picks the file for its pixel density. The values are fixed
pixels, so for a slot that grows with the screen use the widest it gets before
the next viewport. `aspectRatio` is optional: without it the image is not
cropped.

Always include `fallback` or a viewport with min-width 0. Below the smallest
listed viewport the browser otherwise assumes the image is as wide as the
screen.

A fixed-size image that should stay sharp on high-density screens is a `sizes`
style with only `fallback`: `sizes: { fallback: 120 }`.

### pictures

```ts
defineImageStyle({
  type: 'pictures',
  aspectRatio: 4 / 3,
  pictures: {
    fallback: { width: 375, aspectRatio: 1 },
    md: { width: 720 },
    lg: { height: 500, aspectRatio: 21 / 9 },
    xl: { width: 1440, height: 480 },
  },
})
```

Renders a `<picture>` with one `<source>` per entry, largest viewport first,
each with a `min-width` media query and one URL per density as `x` descriptors.
The smallest entry has no media query and serves every screen below the others.
The `<img>` uses the entry without a media query, at 1x.

- Each entry has a `width`, or a `height` with an `aspectRatio`, in CSS pixels;
  every density renders it that many times larger.
- The root `aspectRatio` applies to every entry without its own `height` or
  `aspectRatio`, and crops it. In the example, `md` is cropped to 4/3. To keep
  the source aspect ratio for width-only entries, leave out the root
  `aspectRatio`.

For media queries other than min-width, pass an array. The browser uses the
first entry that matches, so the array order is the priority: most specific
first, `fallback` last.

```ts
pictures: [
  { media: '(orientation: portrait)', width: 600, aspectRatio: 3 / 4 },
  { viewport: 'lg', width: 1200, aspectRatio: 16 / 9 },
  { viewport: 'fallback', width: 600, aspectRatio: 16 / 9 },
]
```

### single

```ts
defineImageStyle({ type: 'single', width: 400, aspectRatio: 1 })
```

One `<img src>` at exactly that size: no `srcset`, no densities. Crop it with a
`height` or an `aspectRatio`; with both, the `height` wins.

### Stack name

`config="my_stack"` renders one `<img src>` with that stack as it is: no
variables, no densities. Dynamic stacks work the same way:
`config="dynamic/resize-width-300"`.

### Other stacks per style

Every image style takes `stacks: { crop: '…', noCrop: '…' }` to render with
other stacks than the configured ones.
[references/stacks.md](references/stacks.md) lists what such stacks must define.

## `<RokkaImage>` props

| Prop                            | What it does                                                                                                                                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hash` or `remote`              | The source image. Exactly one of them; vue-tsc reports a missing or a second one.                                                                                                                                                             |
| `config`                        | An image style, or the name of a stack.                                                                                                                                                                                                       |
| `alt`, `title`                  | Set on the `<img>`.                                                                                                                                                                                                                           |
| `source-width`, `source-height` | The source image's size, for the `width` and `height` attributes, see [Width and height](#width-and-height).                                                                                                                                  |
| `file-name`                     | The last URL segment, `image.jpg` by default. Search engines see it, and its extension sets the output format. Pass the source image's name: an extension browsers can not display (`.tif`, `.heic`, `.pdf`) or a missing one becomes `.jpg`. |
| `loading`                       | `lazy` or `eager`.                                                                                                                                                                                                                            |
| `preload`                       | Adds `<link rel="preload">` to the server-rendered head. For the LCP image, with `loading="eager"`.                                                                                                                                           |
| `img-class`                     | Class on the `<img>`.                                                                                                                                                                                                                         |
| `host`                          | Another rokka host for this one image.                                                                                                                                                                                                        |

Other attributes and listeners, `class` included, land on the root element: the
`<img>` for `single` and `sizes`, the `<picture>` for `pictures`. Style the
image itself with `img-class`. On a `<picture>`, attributes like `fetchpriority`
and listeners like `@load` have no effect.

## Width and height

The `width` and `height` attributes let the browser reserve the image's space
before it loads, so the layout does not shift. Where they come from depends on
the type:

- **`single`** with a `height` or an `aspectRatio`: from the image style.
  Without either, from `source-width` and `source-height`.
- **`sizes`**: from `source-width` and `source-height`, cropped to the
  `aspectRatio`. Without them, from the largest width in `sizes` and the
  `aspectRatio`; without an `aspectRatio` either, the `<img>` has none.
- **`pictures`**: every `<source>` gets the `width` and `height` of its entry,
  and a `height` only when the entry has a `height` or an `aspectRatio`, the
  root one included. The `<img>` has none, and `source-width` does not count.
- **A stack name**: none.

Pass `source-width` and `source-height` whenever the project has them.

## Remote images

rokka can render an image from another server. Pass its URL as `remote`:

```vue
<RokkaImage
  v-if="event.imageUrl && !failed"
  :remote="event.imageUrl"
  :config="teaserImage"
  @error="failed = true"
/>
<EventPlaceholder v-else />
```

- The organization or the stack has to allow the server, with
  `remote_fullurl_allow` and `remote_fullurl_whitelist`. With `remote_basepath`
  instead, pass the path below the base path: `remote="2024/06/photo.jpg"`.
  [references/rokka.md](references/rokka.md#remote-images) has the options and
  the API call.
- rokka downloads a remote image once and never checks it again. When the image
  changes, its URL has to change; `file-name` does not count.
- `remote` is typed `string`, so a URL that can be `null` goes behind a `v-if`.

## The error event

`@error` fires when the image fails to load: an unknown hash, a missing stack, a
remote image rokka can not fetch. It also fires for an image that failed before
hydration, when the browser's own error event came too early for Vue. Use it to
swap in a placeholder, as above.

## `buildRokkaUrl()`

For a rokka URL outside `<RokkaImage>`: a CSS background, an `og:image`,
structured data.

```ts
const { public: config } = useRuntimeConfig()

const ogImage = buildRokkaUrl(
  config.rokkaStackCrop, // stack
  '', // density: '' for 1x, or '2'
  { hash: image.hash }, // a hash string, { hash } or { remote }
  image.name, // file name, default image.jpg
  undefined, // host, default from the module config
  { w: 1200, h: 630 }, // stack variables
)
```

Without a `host` argument it reads the host from the runtime config, so call it
where `useRuntimeConfig()` works: in `setup`, a plugin or middleware.

## Debugging

Request the failing URL; rokka answers with a JSON error.

| Symptom                                                                    | Cause and fix                                                                                                                |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 404 `No source image with hash … for organization …`                       | The hash is wrong, belongs to another organization (check `host`), or the image was deleted.                                 |
| 404 `No such stack with name …`                                            | The stack does not exist in this organization: create it, see [references/stacks.md](references/stacks.md), or fix `stacks`. |
| 404 `No image found.`                                                      | rokka could not fetch the remote image, or the server is not allowed.                                                        |
| 400 `The DPR stack option can only be used with a dpr capable operation …` | The stack has no `resize` operation, see [references/stacks.md](references/stacks.md#other-stacks).                          |
| The image ignores the requested size                                       | The stack does not read the variables `w` and `h`, see [references/stacks.md](references/stacks.md#other-stacks).            |
| The image is smaller than requested                                        | Stacks created from the module's definitions never upscale: a render is at most as large as the source image.                |
| The image shows an old version                                             | The old render is cached for a year; it takes a new URL, see [references/rokka.md](references/rokka.md#caching).             |
| The crop cuts off the subject                                              | Set a [subject area](references/rokka.md#subject-area) on the source image.                                                  |
| The layout shifts while images load                                        | The `width` and `height` attributes are missing, see [Width and height](#width-and-height).                                  |

## Version 1

Version 1 has no `remote` prop, no `error` event, no `fallback` viewport and no
array syntax for `pictures`, and its root `aspectRatio` in a `pictures` style
does not crop. Its `buildRokkaUrl()` takes the hash only as a string. The
module's README lists every change under "Upgrading from 1.x".
