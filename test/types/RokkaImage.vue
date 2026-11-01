<!--
  Type-level tests for the props of <RokkaImage>, checked by
  `npm run typecheck:test`. Nothing here is rendered.
-->
<template>
  <div>
    <RokkaImage hash="abc" config="dynamic/resize-width-100" />
    <RokkaImage
      remote="https://example.com/a.jpg"
      config="dynamic/resize-width-100"
      @error="onError"
    />
    <RokkaImage v-if="url" :remote="url" config="dynamic/resize-width-100" />

    <!-- @vue-expect-error Either hash or remote is required. -->
    <RokkaImage config="dynamic/resize-width-100" />

    <!-- @vue-expect-error Only one of hash and remote. -->
    <RokkaImage
      hash="abc"
      remote="https://example.com/a.jpg"
      config="dynamic/resize-width-100"
    />

    <!-- @vue-expect-error A URL that can be null has to be checked first. -->
    <RokkaImage :remote="url" config="dynamic/resize-width-100" />
  </div>
</template>

<script setup lang="ts">
import RokkaImage from '../../src/runtime/components/RokkaImage/index.vue'
import { buildRokkaUrl } from '../../src/runtime/composables/buildRokkaUrl'
import { ref } from '#imports'

const url = ref<string | null>(null)

function onError(event: Event) {
  console.error(event.type)
}

// buildRokkaUrl() takes a hash, or an object with the hash or remote URL.
buildRokkaUrl('stack', '', 'abc')
buildRokkaUrl('stack', '', { hash: 'abc' })
buildRokkaUrl('stack', '', { remote: 'https://example.com/a.jpg' })
// @ts-expect-error Not a source.
buildRokkaUrl('stack', '', { url: 'https://example.com/a.jpg' })
</script>
