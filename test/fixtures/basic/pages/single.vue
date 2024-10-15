<template>
  <div id="single">
    <RokkaImage :config="imageStyle" v-bind="imageProps" />
  </div>
</template>

<script lang="ts" setup>
import { computed, defineImageStyle } from '#imports'

const imageProps = computed(() => {
  return {
    hash: 'HASH',
    sourceWidth: 1024,
    sourceHeight: 768,
    alt: 'My alt text',
    title: 'My title text',
  }
})

const imageStyle = defineImageStyle({
  type: 'single',
  width: 400,
  height: 400,
})
</script>
