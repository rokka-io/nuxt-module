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
  pictures: {
    md: {
      width: 400,
      height: 400,
    },
    xl: {
      width: 600,
      height: 600,
    },
    lg: {
      width: 500,
      height: 500,
    },
    sm: {
      width: 300,
      height: 300,
    },
  },
})
</script>
