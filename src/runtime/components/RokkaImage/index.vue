<template>
  <ImagePicture
    v-if="source && typeof config === 'object' && config.type === 'pictures'"
    ref="image"
    :key="'pictures_' + sourceKey"
    :source="source"
    :config="config"
    :source-width="sourceWidth"
    :source-height="sourceHeight"
    :file-name="fileName"
    :host="host"
    :preload="preload"
    :alt="alt"
    :title="title"
    :loading="loading"
    :img-class="imgClass"
    @error="onError"
  />
  <ImageSizes
    v-else-if="source && typeof config === 'object' && config.type === 'sizes'"
    ref="image"
    :key="'sizes_' + sourceKey"
    :source="source"
    :config="config"
    :source-width="sourceWidth"
    :source-height="sourceHeight"
    :file-name="fileName"
    :preload="preload"
    :alt="alt"
    :title="title"
    :host="host"
    :loading="loading"
    :class="imgClass"
    @error="onError"
  />
  <ImageSingle
    v-else-if="
      source &&
      ((typeof config === 'object' && config.type === 'single') ||
        typeof config === 'string')
    "
    ref="image"
    :source="source"
    :config="config"
    :source-width="sourceWidth"
    :source-height="sourceHeight"
    :file-name="fileName"
    :alt="alt"
    :title="title"
    :class="imgClass"
    :loading="loading"
    :preload="preload"
    :host="host"
    @error="onError"
  />
</template>

<script lang="ts" setup>
import ImagePicture from './Picture/index.vue'
import ImageSizes from './Sizes/index.vue'
import ImageSingle from './Single/index.vue'
import { getSourcePath } from './../../helpers'
import type { DefineImageStyleConfig, RokkaImageSource } from '#rokka/types'
import { computed, onMounted, useTemplateRef } from '#imports'

/**
 * Either `hash` or `remote` is required, not both.
 *
 * Declared here and not imported, because Vue's compiler has to resolve it to
 * generate the runtime props. At runtime both props are optional.
 */
type ImageSource =
  | {
      /**
       * The hash of an image stored in rokka.
       */
      hash: string
      remote?: never
    }
  | {
      /**
       * A remote image that rokka loads itself, instead of an image stored in
       * rokka: its full URL, or its path below the base path when the
       * organization uses `remote_basepath`.
       *
       * A full URL needs the `remote_fullurl_allow` option, and its host must
       * be allowed by `remote_fullurl_whitelist`. rokka loads a remote image
       * only once, so a changed image needs a new URL.
       */
      remote: string
      hash?: never
    }

const props = defineProps<
  ImageSource & {
    /**
     * Configure what and how the image should be rendered.
     *
     * If a string is provided it's assumed to be an existing rokka stack.
     * In this case a simple <img> tag is rendered.
     */
    config: string | DefineImageStyleConfig

    /**
     * Alt text for the image.
     */
    alt?: string

    /**
     * Title attribute for the image.
     */
    title?: string

    /**
     * The width of the source/original image (not the desired width).
     *
     * If provided, the width/height attribute of the <img> is calculated to represent the rendered aspect ratio, based on the provided image style configuration.
     */
    sourceWidth?: number

    /**
     * The height of the source/original image (not the desired height).
     *
     * If provided, the width/height attribute of the <img> is calculated to represent the rendered aspect ratio, based on the provided image style configuration.
     */
    sourceHeight?: number

    /**
     * The name of the file used for building the URL.
     *
     * If no file name is provided, the URL is generated without a file name.
     */
    fileName?: string

    /**
     * Override the host for a specific image. Falls back to the host defined in the module configuration.
     */
    host?: string

    /**
     * Class added to the <img> tag.
     */
    imgClass?: string | string[] | Record<string, boolean>

    /**
     * Define the loading attribute for the <img> tag.
     */
    loading?: 'lazy' | 'eager'

    /**
     * If set, the matching <link> tags are added to the head to preload the images.
     */
    preload?: boolean
  }
>()

const emit = defineEmits<{
  /**
   * The image could not be loaded, for example because rokka could not load
   * a remote image.
   */
  error: [event: Event]
}>()

const source = computed<RokkaImageSource | null>(() => {
  if (props.hash) {
    return { hash: props.hash }
  } else if (props.remote) {
    return { remote: props.remote }
  }
  return null
})

const sourceKey = computed(() =>
  source.value ? getSourcePath(source.value) : '',
)

const image = useTemplateRef<{ $el: unknown }>('image')

function onError(event: Event) {
  emit('error', event)
}

onMounted(() => {
  // An image that fails to load before hydration fires its error event before
  // Vue adds the listener. A broken image counts as complete, but has no size.
  const el = image.value?.$el
  const img =
    el instanceof HTMLImageElement
      ? el
      : el instanceof Element
        ? el.querySelector('img')
        : null

  if (img?.complete && img.naturalWidth === 0) {
    emit('error', new Event('error'))
  }
})
</script>
