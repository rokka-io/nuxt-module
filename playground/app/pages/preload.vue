<template>
  <div>
    <h1>Test rokka</h1>

    <StyleExample
      title="Single image style"
      :config="imageStyleSingle"
      preload
    />

    <StyleExample
      title="Pictures image style"
      :config="imageStylePicture"
      preload
    />

    <StyleExample
      title="Sizes image style (16 / 9)"
      :config="imageStyleSizes"
      preload
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
</script>
