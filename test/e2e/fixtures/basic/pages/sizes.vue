<template>
  <div id="sizes">
    <RokkaImage :config="imageStyle" v-bind="imageProps" />
  </div>
</template>

<script lang="ts" setup>
import { computed, defineImageStyle } from '#imports'

const imageProps = computed(() => {
  return {
    hash: 'HASH',
    sourceWidth: 1920,
    sourceHeight: 1081,
    alt: 'My alt text',
    title: 'My title text',
  }
})

const imageStyle = defineImageStyle({
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
