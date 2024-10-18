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
    fallback: {
      width: 200,
      height: 200,
    },
    sm: {
      width: 300,
      height: 300,
    },
    md: {
      width: 400,
      height: 400,
    },
    lg: {
      width: 500,
      height: 500,
    },
    xl: {
      width: 600,
      height: 600,
    },
  },
})
</script>
