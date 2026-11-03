# Responsive images with rokka for Nuxt 3

## Setup

```
npm install --save @rokka-io/nuxt
```

Minimal configuration:

```typescript
export default defineNuxtConfig({
  modules: ['@rokka-io/nuxt'],

  rokka: {
    host: 'rokka-demos.rokka.io',
    viewports: {
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1680,
    },
  },
})
```

### Create stacks

You need two rokka stacks to make the responsive images work:

- `fe_nuxt_crop`: For cropped images where both width and height are set
- `fe_nuxt_no_crop`: For images where only the width is scaled (without
  cropping)

You can find example stack configurations in the ./stacks folder.

## Render an image

Use the `<RokkaImage>` component to render a single rokka image. The `config`
prop is required, and either `hash` or `remote`.

```vue
<template>
  <RokkaImage hash="90b93a" :config="imageStyle" />
</template>
```

### Remote images

rokka can also render an image that is not stored in rokka, but loaded from
another server. Pass its URL to the `remote` prop instead of a hash. Every image
style works the same way.

```vue
<template>
  <RokkaImage
    v-if="!failed"
    remote="https://example.com/images/event.jpg"
    :config="imageStyle"
    @error="failed = true"
  />
  <PlaceholderIcon v-else />
</template>
```

The remote server has to be allowed in rokka, with the `remote_fullurl_allow`
and `remote_fullurl_whitelist` options of the organization or the stack. With
the `remote_basepath` option instead, pass the path below the base path, for
example `remote="2017/06/image.jpg"`. See
[Loading images from a remote URL](https://rokka.io/documentation/references/stacks.html#loading-images-from-a-remote-url).

rokka loads a remote image only once and does not check it for changes later.
When the image changes, it needs a new URL.

The `error` event fires when the image can not be loaded, for example when rokka
can not load the remote image. It also fires for an image that failed before the
page was hydrated.

## Define image styles

You can define three types of image styles using the `defineImageStyle()`
composable:

### `<picture>` element with `<source>`

```typescript
const imageStyle = defineImageStyle({
  type: 'pictures',
  pictures: {
    // Force 375px width in a specific aspect ratio and crop image.
    sm: {
      width: 375,
      aspectRatio: 16 / 9,
    },
    // Force 550px height in a specific aspect ratio and crop image.
    md: {
      height: 550,
      aspectRatio: 16 / 9,
    },
    // Force exact dimensions and crop image.
    lg: {
      width: 1024,
      height: 300,
    },
    // Force width of 1680px without cropping the image.
    xl: {
      width: 1680,
    },
  },
})
```

The smallest viewport is used when no other viewport matches. To define an image
below your smallest viewport, use the special `fallback` viewport. It is always
available and has a min-width of 0.

Or with general media query support:

```typescript
const imageStyle = defineImageStyle({
  type: 'pictures',
  pictures: [
    // Define a media query. Width, height and aspectRatio are configurable the same as above.
    // The browser uses the first entry that matches, so put the most specific one first.
    {
      media: '(min-height: 1200px)',
      width: 500,
      height: 500,
    },
    {
      media: '(min-height: 600px)',
      width: 200,
      aspectRatio: 4 / 3,
    },
    // You can still specify viewports.
    {
      viewport: 'md',
      width: 100,
    },
    // The fallback viewport is used when no entry above matches.
    {
      viewport: 'fallback',
      width: 2000,
    },
  ],
})
```

Without an entry that always matches, such as the `fallback` viewport, the
`<img>` shows the entry with the smallest viewport, or else the last entry, when
no entry matches.

With a root `aspectRatio`, an entry can define only a `height`.

### `<img>` element with `srcset` and `sizes` attributes

```typescript
// Crop image to a 16/9 aspect ratio.
const crop = defineImageStyle({
  type: 'sizes',
  aspectRatio: 16 / 9,
  sizes: {
    fallback: 320,
    sm: 375,
    md: 768,
    lg: 980,
    xl: 1200,
  },
})

// Keep aspect ratio of original image.
const noCrop = defineImageStyle({
  type: 'sizes',
  sizes: {
    fallback: 320,
    sm: 375,
    md: 768,
    lg: 980,
    xl: 1200,
  },
})
```

Use the special `fallback` viewport to define the size below the smallest
viewport. Without it, the browser assumes that the image is as wide as the
screen there.

### `<img>` element with a single src attribute

```typescript
// Crop image to exactly 400x400.
const crop = defineImageStyle({
  type: 'single',
  width: 400,
  height: 400,
})

// Crop image to a width of 400px and calculate height based on aspect ratio
const cropAspect = defineImageStyle({
  type: 'single',
  aspectRatio: 16 / 9,
  width: 400,
})

// Crop image to a width of 400px and calculate height based on aspect ratio
const cropAspect = defineImageStyle({
  type: 'single',
  aspectRatio: 16 / 9,
  width: 400,
})
```

### Custom stack

You can also render a single image in a custom rokka stack by passing the name
of an existing stack to the `config` prop:

```vue
<template>
  <RokkaImage hash="90b93a" config="name_of_custom_stack" />
</template>
```

## Configuration

The following configuration options are available via nuxt.config.ts:

### host: `string`

The rokka host to use, e.g. `rokka-demos.rokka.io`.

### viewports: `Record<string, number>`

Define the viewport keys and their screen **min-width** media value. If your
define something like this:

```json
{
  "xs": 0,
  "md": 768,
  "lg": 1024
}
```

This will make it possible to define three different set of sizes per viewport.

A `fallback` viewport with a min-width of 0 is added automatically, so
`fallback` can not be used as the name of a viewport.

Without this option, the viewports are `sm: 0`, `md: 768` and `lg: 1024`.

### dpr: `string[]`

Define the DPR (device pixel ratios). If you set something like:

```json
["", "1.5", "2"]
```

Then all generated images will have three variants, one for < 1.5 DPR, one for
1.5 and one for > 2.0.

### stacks: `{ crop: string, noCrop: string }`

By default, the module assumes two stacks with name `fe_nuxt_crop` and
`fe_nuxt_no_crop`. You can override this globally and define your own stack
names.

## Agent skill

The package ships an [Agent Skill](https://agentskills.io) that teaches coding
agents such as Claude Code, Cursor or Codex how to use this module and how rokka
works. Link it from the installed package with the
[skills CLI](https://github.com/vercel-labs/skills), so that it always matches
the installed version of the module:

```
npx skills experimental_sync
```

Or install it from GitHub, which gets the version on the main branch:

```
npx skills add rokka-io/nuxt-module
```

## Upgrading from 1.x

- **The root `aspectRatio` of a `pictures` style now crops the image.** Entries
  that only define a `width` are cropped to the root `aspectRatio`, using the
  crop stack. In 1.x the root `aspectRatio` only set the `width` and `height`
  attributes of the `<source>` elements, and the image kept the aspect ratio of
  the original. To keep the 1.x images, remove the root `aspectRatio`. The
  `<source>` elements then have no `height` attribute.
- **`pictures` can be an array.** Code that reads `style.pictures` has to check
  `Array.isArray(style.pictures)` first. The `width` of an entry is now
  optional, since an entry can define a `height` and an `aspectRatio` instead,
  or only a `height` when the style has a root `aspectRatio`.
- **Attributes and listeners go to the `<img>` of a `pictures` style.** In 1.x
  they landed on the `<picture>`, where `fetchpriority` and `@load` have no
  effect. `class` and `style` stay on the `<picture>`. CSS or scripts that look
  for an `id` or a `data-*` attribute on the `<picture>` have to look at the
  `<img>`.
- **`fallback` is a reserved viewport name.** It is added to the configured
  viewports with a min-width of 0. Rename a viewport called `fallback`.
- **Configured viewports replace the default ones.** In 1.x the defaults `sm`,
  `md` and `lg` were added to the configured `viewports`, so image styles could
  use them even when the project did not define them. Add them to `viewports` if
  image styles still use them.
- **A `single` style with both `height` and `aspectRatio` renders the
  `height`.** In 1.x the URL followed the `aspectRatio`, while the `height`
  attribute followed `height`.
- **The preload links of a `pictures` style changed.** Every `<source>` now gets
  its own link, and their media queries do not overlap, so the browser preloads
  only the image that the `<picture>` renders. A media query with a media type,
  like `screen and (min-width: 768px)`, can not be excluded, so the links end
  after its `<source>`.
- **The `sizes` attribute uses the exact min-width of each viewport.** 1.x
  subtracted one pixel: `(min-width: 767px)` for a viewport of 768.
- **A `srcset` lists every width once.** When two entries of a `sizes` style
  render a file of the same width, such as 400 at 2x and 800 at 1x, only the one
  with the lower density is kept.
