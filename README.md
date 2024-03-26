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

Use the `<RokkaImage>` component to render a single rokka image. The `hash` and
`config` props are required.

```vue
<template>
  <RokkaImage hash="90b93a" :config="imageStyle" />
</template>
```

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

### `<img>` element with `srcset` and `sizes` attributes

```typescript
// Crop image to a 16/9 aspect ratio.
const crop = defineImageStyle({
  type: 'sizes',
  aspectRatio: 16 / 9,
  sizes: {
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
    sm: 375,
    md: 768,
    lg: 980,
    xl: 1200,
  },
})
```

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
