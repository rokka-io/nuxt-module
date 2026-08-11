<template>
  <picture>
    <source
      v-for="(source, index) in sources"
      :key="index"
      :srcset="source.srcset"
      :media="source.media"
      :width="source.width"
      :height="source.height"
    />
    <img
      :alt="alt"
      :title="title"
      :src="fallback?.src"
      :loading="loading"
      :class="imgClass"
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
  BuildRokkaUrlVariables,
} from '#rokka/types'
import {
  buildRokkaUrl,
  computed,
  useRuntimeConfig,
  useServerHead,
} from '#imports'

const runtimeConfig = useRuntimeConfig()

const props = defineProps<{
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

const buildUrl = (width: number, height?: number, dpr?: string) => {
  const variables: BuildRokkaUrlVariables = {
    w: width,
    h: height,
  }

  let stack =
    props.config.stacks?.noCrop || runtimeConfig.public.rokkaStackNoCrop

  if (variables.h) {
    stack = props.config.stacks?.crop || runtimeConfig.public.rokkaStackCrop
  }

  return buildRokkaUrl(
    stack,
    dpr,
    props.hash,
    props.fileName,
    props.host,
    variables,
  )
}

function notNullish<T>(val?: T | null | undefined): val is T {
  return val != null
}

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
      const srcsetItems: [string, string][] = DPR.map((v) => {
        const url = buildUrl(width, height, v)
        const pixelRatio = v || '1'

        return [url, pixelRatio + 'x']
      })

      const srcset = srcsetItems.map((v) => v.join(' ')).join(', ')

      return {
        srcset,
        srcsetItems,
        width,
        height,
        media: spec.media,
        viewport: spec.viewport,
        minWidth: spec.minWidth,
      }
    })
    .filter(notNullish)
})

const fallback = computed(() => {
  const source = getFallbackSource(sources.value)

  if (!source) {
    return
  }
  const fallbackUrl = source.srcsetItems[0]?.[0]
  if (!fallbackUrl) {
    return
  }

  return {
    src: fallbackUrl,
    width: source.width,
    height: source.height,
  }
})

if (props.preload && import.meta.server) {
  useServerHead({
    link: getPreloadLinks(sources.value),
  })
}
</script>
