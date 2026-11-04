<template>
  <main>
    <div v-for="(config, type) in styles" :id="type" :key="type">
      <RokkaImage
        hash="HASH"
        :config="config"
        class="root-class"
        style="display: block"
        fetchpriority="high"
        data-test="attribute"
        @load="loaded = type"
      />
    </div>
    <p id="loaded">{{ loaded }}</p>
  </main>
</template>

<script lang="ts" setup>
import { defineImageStyle, ref } from '#imports'

const loaded = ref('')

const styles = {
  single: defineImageStyle({ type: 'single', width: 400 }),
  sizes: defineImageStyle({ type: 'sizes', sizes: { fallback: 400 } }),
  pictures: defineImageStyle({
    type: 'pictures',
    pictures: { fallback: { width: 400 } },
  }),
}
</script>
