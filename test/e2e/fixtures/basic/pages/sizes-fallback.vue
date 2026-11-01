<template>
  <div id="sizes">
    <RokkaImage :config="imageStyle" v-bind="imageProps" preload />
  </div>
</template>

<script lang="ts" setup>
import { computed, defineImageStyle } from '#imports'

const imageProps = computed(() => {
  return {
    hash: 'HASH',
    sourceWidth: 1920,
    sourceHeight: 1080,
    alt: 'My alt text',
    title: 'My title text',
  }
})

const imageStyle = defineImageStyle({
  type: 'sizes',
  sizes: {
    fallback: 200,
    sm: 375,
    md: 768,
    lg: 980,
    xl: 1200,
  },
})
</script>
