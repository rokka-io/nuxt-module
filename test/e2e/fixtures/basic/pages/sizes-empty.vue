<template>
  <div id="sizes">
    <RokkaImage
      hash="HASH"
      :config="imageStyle"
      preload
      @error="failed = true"
    />
    <p id="failed">{{ failed }}</p>
  </div>
</template>

<script lang="ts" setup>
import { defineImageStyle, ref } from '#imports'

const failed = ref(false)

const imageStyle = defineImageStyle({ type: 'sizes', sizes: {} })
</script>
