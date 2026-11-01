<template>
  <div>
    <div id="single">
      <RokkaImage
        :remote
        :config="single"
        file-name="event.jpg"
        @error="failed.single = true"
      />
    </div>
    <div id="sizes">
      <RokkaImage
        :remote
        :config="sizes"
        file-name="event.jpg"
        @error="failed.sizes = true"
      />
    </div>
    <div id="pictures">
      <RokkaImage
        :remote
        :config="pictures"
        file-name="event.jpg"
        @error="failed.pictures = true"
      />
    </div>
    <p id="failed">{{ failedStyles }}</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineImageStyle, reactive } from '#imports'

const remote = 'https://example.com/images/event.jpg?v=2'

const failed = reactive({ single: false, sizes: false, pictures: false })

const failedStyles = computed(() =>
  Object.entries(failed)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join(','),
)

const single = defineImageStyle({
  type: 'single',
  width: 400,
  aspectRatio: 3 / 2,
})

const sizes = defineImageStyle({
  type: 'sizes',
  aspectRatio: 3 / 2,
  sizes: {
    sm: 375,
    lg: 980,
  },
})

const pictures = defineImageStyle({
  type: 'pictures',
  pictures: {
    sm: { width: 300, aspectRatio: 1 },
    lg: { width: 1000, aspectRatio: 2 },
  },
})
</script>
