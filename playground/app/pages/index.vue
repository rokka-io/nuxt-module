<template>
  <div>
    <h1>Test rokka</h1>

    <StyleExample title="Single image style" :config="imageStyleSingle" />

    <StyleExample title="Pictures image style" :config="imageStylePicture" />

    <StyleExample
      title="Pictures image style with media query"
      :config="imageStylePictureMedia"
    />

    <StyleExample
      title="Sizes image style (16 / 9)"
      :config="imageStyleSizes"
    />

    <StyleExample
      title="Sizes image style (keep aspect ratio)"
      :config="imageStyleSizesKeepAspect"
    />
  </div>
</template>

<script setup lang="ts">
import StyleExample from '../components/StyleExample.vue'
import { defineImageStyle } from '#imports'

const imageStyleSingle = defineImageStyle({
  type: 'single',
  width: 400,
  height: 400,
})

const imageStylePicture = defineImageStyle({
  type: 'pictures',
  pictures: {
    sm: {
      width: 375,
      aspectRatio: 2 / 5,
    },
    lg: {
      width: 1024,
      height: 300,
    },
    xl: {
      width: 1680,
    },
  },
})

const imageStylePictureMedia = defineImageStyle({
  type: 'pictures',
  pictures: [
    {
      viewport: 'xl',
      width: 1680,
    },
    {
      media: '(min-width: 600px) and (min-height: 400px)',
      width: 1024,
      height: 300,
    },
    {
      media: '(min-height: 600px)',
      width: 375,
      aspectRatio: 16 / 9,
    },
    {
      viewport: 'fallback',
      width: 300,
    },
  ],
})

const imageStyleSizes = defineImageStyle({
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

const imageStyleSizesKeepAspect = defineImageStyle({
  type: 'sizes',
  sizes: {
    fallback: 320,
    sm: 375,
    md: 768,
    lg: 980,
    xl: 1200,
  },
})
</script>

<style>
.w-auto {
  width: auto;
}

.max-w-full {
  max-width: 100%;
}

.w-full {
  width: 100%;
}

.h-auto {
  height: auto;
}
</style>
