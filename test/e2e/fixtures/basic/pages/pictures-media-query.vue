<template>
  <div id="pictures">
    <RokkaImage :config="imageStylePicture" v-bind="imageProps" />
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

const imageStylePicture = defineImageStyle({
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
      height: 300,
    },
  ],
})
</script>
