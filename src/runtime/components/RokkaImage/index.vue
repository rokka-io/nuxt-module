<template>
  <ImagePicture
    v-if="hash && typeof config === 'object' && config.type === 'pictures'"
    :key="'pictures_' + hash"
    :hash="hash"
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
  />
  <ImageSizes
    v-else-if="hash && typeof config === 'object' && config.type === 'sizes'"
    :key="'sizes_' + hash"
    :hash="hash"
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
  />
  <ImageSingle
    v-else-if="
      hash &&
      ((typeof config === 'object' && config.type === 'single') ||
        typeof config === 'string')
    "
    :hash="hash"
    :config="config"
    :source-width="sourceWidth"
    :source-height="sourceHeight"
    :file-name="fileName"
    :alt="alt"
    :title="title"
    :class="imgClass"
    :loading="loading"
    :preload="preload"
  />
</template>

<script lang="ts" setup>
import ImagePicture from './Picture/index.vue'
import ImageSizes from './Sizes/index.vue'
import ImageSingle from './Single/index.vue'
import { type DefineImageStyleConfig } from '#rokka/types'

defineProps<{
  /**
   * The rokka hash.
   */
  hash: string

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
}>()
</script>
