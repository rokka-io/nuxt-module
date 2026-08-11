<template>
  <div>
    <h1>Test rokka</h1>

    <h3>Single image style</h3>
    <RokkaImage v-bind="imageProps" :config="imageStyleSingle" preload />

    <h3>Pictures image style</h3>
    <RokkaImage
      :config="imageStylePicture"
      preload
      v-bind="imageProps"
      img-class="max-w-full h-auto"
    />

    <h3>Sizes image style (16 / 9)</h3>
    <RokkaImage
      :config="imageStyleSizes"
      preload
      v-bind="imageProps"
      img-class="w-full h-auto"
    />
  </div>
</template>

<script setup lang="ts">
import { defineImageStyle, computed } from '#imports'

const imageProps = computed(() => {
  return {
    hash: '61d4c9ece95f13cc624924a241cc06ac8e431c16',
    sourceWidth: 1920,
    sourceHeight: 1081,
    alt: 'My alt text',
    title: 'My title text',
  }
})

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
