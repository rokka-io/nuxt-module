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
    sourceHeight: 1081,
    alt: 'My alt text',
    title: 'My title text',
  }
})

const imageStylePicture = defineImageStyle({
  type: 'pictures',
  aspectRatio: 2 / 1,
  pictures: {
    sm: {
      width: 400,
      aspectRatio: 4 / 3,
    },
    lg: {
      width: 1000,
    },
    xl: {
      width: 1000,
      height: 1000,
    },
  },
})
</script>
