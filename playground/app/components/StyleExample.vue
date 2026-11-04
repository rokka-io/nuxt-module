<template>
  <section>
    <h3>{{ title }}</h3>
    <div class="images">
      <figure
        v-for="image in TEST_IMAGES"
        :key="image.name"
        ref="figures"
        :data-name="image.name"
        @load.capture="onLoad"
      >
        <RokkaImage
          :hash="image.hash"
          :file-name="image.name"
          :source-width="image.width"
          :source-height="image.height"
          :config="config"
          :preload="preload"
          :alt="image.name"
        />
        <figcaption>
          {{ image.name }}
          <br />
          <code>{{ loaded[image.name] || 'not loaded yet' }}</code>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
import { TEST_IMAGES } from '../test-images'
import type { DefineImageStyleConfig } from '#rokka/types'
import { onMounted, reactive, useTemplateRef } from '#imports'

defineProps<{
  title: string
  config: DefineImageStyleConfig
  preload?: boolean
}>()

/**
 * What the browser loaded for each image: the stack, the variables and the
 * size of the file. It changes when a <picture> or a srcset switches to
 * another file, for example when the window is resized.
 */
const loaded = reactive<Record<string, string>>({})

function update(figure: HTMLElement) {
  const name = figure.dataset.name
  const img = figure.querySelector('img')
  if (!name || !img?.complete || !img.naturalWidth) {
    return
  }
  const [stack, variables] = new URL(img.currentSrc).pathname
    .split('/')
    .slice(1)
  loaded[name] =
    `${stack}/${variables}, ${img.naturalWidth} × ${img.naturalHeight}`
}

// The load event does not bubble, but a capture listener on the <figure> gets
// it.
function onLoad(event: Event) {
  update(event.currentTarget as HTMLElement)
}

// An image can load before hydration, when Vue has not attached the listener.
const figures = useTemplateRef<HTMLElement[]>('figures')
onMounted(() => figures.value?.forEach(update))
</script>

<style scoped>
.images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 24px;
  align-items: start;
}

figure {
  margin: 0;
}

figure :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
}

figcaption {
  margin-top: 8px;
  font-size: 14px;
  overflow-wrap: anywhere;
}
</style>
