<template>
  <div id="pictures">
    <RokkaImage hash="HASH" :config="imageStyle" preload />
  </div>
</template>

<script lang="ts" setup>
import { defineImageStyle } from '#imports'

// A media type can not be excluded, so the links stop after it.
const imageStyle = defineImageStyle({
  type: 'pictures',
  pictures: [
    { media: 'screen and (min-width: 1200px)', width: 1000, height: 500 },
    { media: '(min-width: 600px)', width: 600, height: 400 },
    { viewport: 'fallback', width: 300, height: 300 },
  ],
})
</script>
