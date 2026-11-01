<template>
  <div id="single">
    <RokkaImage :config="imageStyle" hash="HASH" />
  </div>
</template>

<script lang="ts" setup>
import { defineImageStyle } from '#imports'

const imageStyle = defineImageStyle({
  type: 'single',
  width: 400,
  height: 300,
  aspectRatio: 1,
})
</script>
