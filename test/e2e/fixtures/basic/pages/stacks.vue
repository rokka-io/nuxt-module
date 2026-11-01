<template>
  <main>
    <div id="crop">
      <div class="single">
        <RokkaImage :config="imageStyleSingle" v-bind="imageProps" />
      </div>

      <div class="sizes">
        <RokkaImage :config="imageStyleSizes" v-bind="imageProps" />
      </div>

      <div class="pictures">
        <RokkaImage :config="imageStylePictures" v-bind="imageProps" />
      </div>
    </div>

    <div id="noCrop">
      <div class="single">
        <RokkaImage :config="imageStyleSingleNoCrop" v-bind="imageProps" />
      </div>

      <div class="sizes">
        <RokkaImage :config="imageStyleSizesNoCrop" v-bind="imageProps" />
      </div>

      <div class="pictures">
        <RokkaImage :config="imageStylePicturesNoCrop" v-bind="imageProps" />
      </div>
    </div>
  </main>
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

const imageStyleSingle = defineImageStyle({
  type: 'single',
  width: 400,
  height: 400,
  stacks: {
    crop: 'custom_crop_stack',
    noCrop: 'custom_no_crop_stack',
  },
})

const imageStyleSizes = defineImageStyle({
  type: 'sizes',
  aspectRatio: 16 / 9,
  sizes: {
    sm: 375,
    md: 768,
    lg: 980,
    xl: 1200,
  },
  stacks: {
    crop: 'custom_crop_stack',
    noCrop: 'custom_no_crop_stack',
  },
})

const imageStylePictures = defineImageStyle({
  type: 'pictures',
  pictures: {
    sm: {
      width: 375,
      aspectRatio: 2 / 5,
    },
    lg: {
      width: 1024,
      height: 300,
    },
    xl: {
      width: 1680,
    },
  },
  stacks: {
    crop: 'custom_crop_stack',
    noCrop: 'custom_no_crop_stack',
  },
})

const imageStyleSingleNoCrop = defineImageStyle({
  type: 'single',
  width: 400,
  stacks: {
    crop: 'custom_crop_stack',
    noCrop: 'custom_no_crop_stack',
  },
})

const imageStyleSizesNoCrop = defineImageStyle({
  type: 'sizes',
  sizes: {
    sm: 375,
    md: 768,
    lg: 980,
    xl: 1200,
  },
  stacks: {
    crop: 'custom_crop_stack',
    noCrop: 'custom_no_crop_stack',
  },
})

const imageStylePicturesNoCrop = defineImageStyle({
  type: 'pictures',
  pictures: {
    sm: {
      width: 375,
    },
    lg: {
      width: 1024,
    },
    xl: {
      width: 1680,
    },
  },
  stacks: {
    crop: 'custom_crop_stack',
    noCrop: 'custom_no_crop_stack',
  },
})
</script>
