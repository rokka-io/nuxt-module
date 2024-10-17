<template>
  <main>
    <div id="single">
      <RokkaImage
        :config="imageStyleSingle"
        v-bind="imageProps"
        loading="lazy"
        img-class="my-image-class"
        host="overriden-host.rokka.io"
      />
    </div>

    <div id="sizes">
      <RokkaImage
        :config="imageStyleSizes"
        v-bind="imageProps"
        loading="lazy"
        img-class="my-image-class"
        host="overriden-host.rokka.io"
      />
    </div>

    <div id="pictures">
      <RokkaImage
        :config="imageStylePictures"
        v-bind="imageProps"
        loading="lazy"
        img-class="my-image-class"
        host="overriden-host.rokka.io"
      />
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
})
</script>
