<template>
  <div>
    <div id="single">
      <RokkaImage :config="imageStyle" hash="HASH" preload />
    </div>
    <div id="stack">
      <RokkaImage config="custom_stack" hash="HASH" preload />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineImageStyle } from '#imports'

const imageStyle = defineImageStyle({
  type: 'single',
  width: 400,
  aspectRatio: 1,
})
</script>
