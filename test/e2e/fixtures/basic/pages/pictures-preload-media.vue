<template>
  <div id="pictures">
    <RokkaImage :config="imageStylePicture" v-bind="imageProps" preload />
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

const imageStylePicture = defineImageStyle({
  type: 'pictures',
  pictures: [
    {
      media: '(min-width: 1280px)',
      width: 1024,
      height: 300,
    },
    {
      media: '(min-width: 600px)',
      width: 600,
      height: 300,
    },
    {
      viewport: 'fallback',
      width: 300,
      height: 300,
    },
  ],
})
</script>
