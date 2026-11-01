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
    sourceWidth: 1000,
    sourceHeight: 1000,
    alt: 'My alt text',
    title: 'My title text',
  }
})

const imageStyle = defineImageStyle({
  type: 'sizes',
  aspectRatio: 2 / 1,
  sizes: {
    sm: 375,
    md: 768,
    lg: 980,
    xl: 1200,
  },
})
</script>
