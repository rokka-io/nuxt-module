<template>
  <main>
    <div id="partly-invalid">
      <RokkaImage hash="HASH" :config="partlyInvalid" preload />
    </div>

    <div id="invalid">
      <RokkaImage hash="HASH" :config="invalid" preload />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { defineImageStyle } from '#imports'

// No width, height or viewport, so the width of the image can not be
// determined. The types reject this entry, hence the cast.
const noWidth = { media: '(min-height: 600px)' } as {
  media: string
  width: number
}

const partlyInvalid = defineImageStyle({
  type: 'pictures',
  pictures: [
    { viewport: 'lg', width: 1000 },
    noWidth,
    { viewport: 'fallback', width: 300 },
  ],
})

const invalid = defineImageStyle({
  type: 'pictures',
  pictures: [noWidth],
})
</script>
