<template>
  <img :src="src" :srcset="srcset" :sizes="sizes" v-bind="imageAttributes" />
</template>

<script lang="ts" setup>
import { getImageAttributes } from './../../../helpers'
import { VIEWPORTS, DPR, type Viewport } from '#rokka/generated-types'
import type {
  BuildRokkaUrlVariables,
  DefineImageStyleConfigSizes,
} from '#rokka/types'
import {
  useRuntimeConfig,
  buildRokkaUrl,
  useServerHead,
  computed,
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
  config: DefineImageStyleConfigSizes

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
   * If set, the matching <link> tags are added to the head to preload the images.
   */
  preload?: boolean
}>()

const buildUrl = (width: number, aspectRatio?: number, dpr?: string) => {
  const variables: BuildRokkaUrlVariables = {
    w: width,
  }
  let height = 0
  let stack: string =
    props.config.stacks?.noCrop || runtimeConfig.public.rokkaStackNoCrop

  if (aspectRatio) {
    height = Math.round(width / aspectRatio)
  }

  if (height) {
    stack = props.config.stacks?.crop || runtimeConfig.public.rokkaStackCrop
    variables.h = height
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

const imageAttributes = computed(() =>
  getImageAttributes(props.config, props.sourceWidth, props.sourceHeight),
)

const images = computed(() =>
  Object.values(props.config.sizes)
    .map((width) => {
      return DPR.map((dpr) => {
        const dprNumber = Number.parseFloat(dpr || '1')
        return {
          src: buildUrl(width, props.config.aspectRatio, dpr),
          width: Math.round(width * dprNumber),
        }
      })
    })
    .flat(),
)

const sizes = computed(() =>
  Object.entries(props.config.sizes)
    .map(([viewport, width]) => {
      const minWidth = VIEWPORTS[viewport as Viewport] - 1
      return { width, minWidth }
    })
    .sort((a, b) => b.minWidth - a.minWidth)
    .map((v) => {
      return v.minWidth < 0
        ? v.width + 'px'
        : `(min-width: ${v.minWidth}px) ${v.width}px`
    })
    .join(', '),
)

const src = computed(() => (images.value[0] ? images.value[0].src : ''))

const srcset = computed(() =>
  images.value
    .map((v) => {
      return `${v.src} ${v.width}w`
    })
    .join(', '),
)

if (props.preload && import.meta.server) {
  useServerHead({
    link: [
      {
        rel: 'preload',
        as: 'image',
        imagesrcset: srcset.value,
        imagesizes: sizes.value,
      },
    ],
  })
}
</script>
