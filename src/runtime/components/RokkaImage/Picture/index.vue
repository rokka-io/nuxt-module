<template>
  <picture v-if="fallback" :class="$attrs.class" :style="$attrs.style">
    <source
      v-for="(item, index) in sources"
      :key="index"
      :srcset="item.srcset"
      :media="item.media"
      :width="item.width"
      :height="item.height"
    />
    <img
      v-bind="getImgAttrs()"
      :alt="alt"
      :title="title"
      :src="fallback.src"
      :srcset="fallback.srcset"
      :loading="loading"
      :class="imgClass"
      @error="emit('error', $event)"
    />
  </picture>
</template>

<script lang="ts" setup>
import {
  getPictureConfigs,
  getWidth,
  getHeight,
  getFallbackSource,
  getPreloadLinks,
  type PictureSource,
} from './../../../helpers/picture'
import { VIEWPORTS, DPR } from '#rokka/generated-types'
import type {
  DefineImageStyleConfigPictures,
  RokkaImageSource,
} from '#rokka/types'
import {
  buildRokkaUrl,
  computed,
  useAttrs,
  useRuntimeConfig,
  useHead,
} from '#imports'

// Attributes and listeners go to the <img>, like for the other types, where
// `fetchpriority` or `@load` work. Only `class` and `style` stay on the
// <picture>.
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

/**
 * The attributes for the <img>: all but `class` and `style`.
 *
 * A function and not a computed, since attrs are not reactive.
 */
function getImgAttrs() {
  return Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style'),
  )
}

const runtimeConfig = useRuntimeConfig()

const props = defineProps<{
  /**
   * The image to render: a rokka hash or a remote image.
   */
  source: RokkaImageSource

  /**
   * Configure what and how the image should be rendered.
   *
   * If a string is provided it's assumed to be an existing rokka stack.
   * In this case a simple <img> tag is rendered.
   */
  config: DefineImageStyleConfigPictures

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

const emit = defineEmits<{
  error: [event: Event]
}>()

const buildUrl = (width: number, height?: number, dpr?: string) =>
  buildRokkaUrl(
    height
      ? props.config.stacks?.crop || runtimeConfig.public.rokkaStackCrop
      : props.config.stacks?.noCrop || runtimeConfig.public.rokkaStackNoCrop,
    dpr,
    props.source,
    props.fileName,
    props.host,
    { w: width, h: height },
  )

const sources = computed<PictureSource[]>(() => {
  return getPictureConfigs(
    props.config.pictures,
    VIEWPORTS,
    props.config.aspectRatio,
  )
    .map((spec) => {
      const width = getWidth(spec, VIEWPORTS, props.sourceWidth)
      const height = getHeight(spec, VIEWPORTS)
      if (!width) {
        console.error(
          'Invalid image style config. The config must define either a width or height to determine the image width.',
          props.config,
        )
        return null
      }
      const urls = DPR.map((v) => buildUrl(width, height, v))

      return {
        srcset: urls
          .map((url, index) => `${url} ${DPR[index] || '1'}x`)
          .join(', '),
        src: urls[0],
        width,
        height,
        media: spec.media,
        viewport: spec.viewport,
        minWidth: spec.minWidth,
      }
    })
    .filter((v) => v !== null)
})

// The source for the <img>. It gets the srcset as well, for when no <source>
// matches: below the smallest media query of an array without a catch-all
// entry.
const fallback = computed(() => {
  const source = getFallbackSource(sources.value)
  return source?.src ? source : null
})

if (props.preload && import.meta.server) {
  useHead({
    link: getPreloadLinks(sources.value),
  })
}
</script>
