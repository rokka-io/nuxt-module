<template>
  <div>
    <h1>Test rokka</h1>

    <h3>Single image style</h3>
    <RokkaImage
      :config="imageStyleSingle"
      :hash="hash"
      :source-width="sourceWidth"
      :source-height="sourceHeight"
    />

    <h3>Pictures image style</h3>
    <RokkaImage
      :config="imageStylePicture"
      :hash="hash"
      :source-width="sourceWidth"
      :source-height="sourceHeight"
      img-class="max-w-full h-auto"
    />

    <h3>Sizes image style (16 / 9)</h3>
    <RokkaImage
      :config="imageStyleSizes"
      :hash="hash"
      :source-width="sourceWidth"
      :source-height="sourceHeight"
      img-class="w-full h-auto"
    />

    <h3>Sizes image style (keep aspect ratio)</h3>
    <RokkaImage
      :config="imageStyleSizesKeepAspect"
      :hash="hash"
      :source-width="sourceWidth"
      :source-height="sourceHeight"
      img-class="w-full h-auto"
    />
  </div>
</template>

<script setup lang="ts">
import { defineImageStyle } from '#imports'

const hash = '90b93a'
const sourceHeight = 3897
const sourceWidth = 2923

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

const imageStyleSizes = defineImageStyle({
  type: 'sizes',
  aspectRatio: 16 / 9,
  sizes: {
    sm: 375,
    md: 768,
    lg: 980,
    xl: 1200,
  },
})

const imageStyleSizesKeepAspect = defineImageStyle({
  type: 'sizes',
  sizes: {
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
