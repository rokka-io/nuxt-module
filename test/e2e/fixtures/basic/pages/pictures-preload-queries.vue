<template>
  <div id="pictures">
    <RokkaImage hash="HASH" :config="imageStyle" preload />
  </div>
</template>

<script lang="ts" setup>
import { defineImageStyle } from '#imports'

// Comma lists, chains, `or` and `not`, and no entry without a media query.
const imageStyle = defineImageStyle({
  type: 'pictures',
  pictures: [
    {
      media:
        '(min-width: 1200px), (orientation: landscape) and (min-width: 900px)',
      width: 1000,
      height: 500,
    },
    {
      media: '(min-width: 600px) and (min-height: 800px)',
      width: 600,
      height: 400,
    },
    {
      media: '(orientation: portrait) or (max-width: 400px)',
      width: 400,
      height: 400,
    },
    {
      media: 'not (min-width: 700px)',
      width: 350,
      height: 350,
    },
    {
      viewport: 'sm',
      width: 300,
      height: 300,
    },
  ],
})
</script>
