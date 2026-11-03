<template>
  <main>
    <div v-for="(stacks, section) in sections" :id="section" :key="section">
      <div v-for="(style, name) in getStyles(stacks)" :key="name" :class="name">
        <RokkaImage :config="style" v-bind="imageProps" />
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { defineImageStyle } from '#imports'
import type { DefineImageStyleStacks } from '#rokka/types'

const imageProps = {
  hash: 'HASH',
  sourceWidth: 1024,
  sourceHeight: 768,
  alt: 'My alt text',
}

// The stacks each section overrides.
const sections: Record<string, DefineImageStyleStacks> = {
  both: { crop: 'custom_crop_stack', noCrop: 'custom_no_crop_stack' },
  'crop-only': { crop: 'custom_crop_stack' },
  'no-crop-only': { noCrop: 'custom_no_crop_stack' },
}

// One style per type that crops, and one that does not.
function getStyles(stacks: DefineImageStyleStacks) {
  return {
    'single-crop': defineImageStyle({
      type: 'single',
      width: 400,
      height: 400,
      stacks,
    }),
    'single-no-crop': defineImageStyle({
      type: 'single',
      width: 400,
      stacks,
    }),
    'sizes-crop': defineImageStyle({
      type: 'sizes',
      aspectRatio: 16 / 9,
      sizes: { fallback: 320, md: 768 },
      stacks,
    }),
    'sizes-no-crop': defineImageStyle({
      type: 'sizes',
      sizes: { fallback: 320, md: 768 },
      stacks,
    }),
    'pictures-crop': defineImageStyle({
      type: 'pictures',
      pictures: {
        sm: { width: 375, aspectRatio: 2 / 5 },
        lg: { width: 1024, height: 300 },
      },
      stacks,
    }),
    'pictures-no-crop': defineImageStyle({
      type: 'pictures',
      pictures: {
        sm: { width: 375 },
        lg: { width: 1024 },
      },
      stacks,
    }),
  }
}
</script>
