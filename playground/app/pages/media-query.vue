<template>
  <div>
    <h1>Test media query</h1>

    <h3>Pictures image style with media query</h3>
    <RokkaImage
      :config="imageStylePictureMedia"
      v-bind="imageProps"
      img-class="max-w-full h-auto"
    />
  </div>
</template>

<script setup lang="ts">
import { defineImageStyle, computed } from '#imports'

const imageProps = computed(() => {
  return {
    hash: '000dc664724c6bd564f3485603e61b572c04ed6c',
    sourceWidth: 1848,
    sourceHeight: 1232,
    alt: 'My alt text',
    title: 'My title text',
  }
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
