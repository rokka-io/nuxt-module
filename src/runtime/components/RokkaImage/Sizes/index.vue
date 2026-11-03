<template>
  <img
    v-if="src"
    :src="src"
    :srcset="srcset"
    :sizes="sizes"
    v-bind="imageAttributes"
    @error="emit('error', $event)"
  />
</template>

<script lang="ts" setup>
import { getImageAttributes } from './../../../helpers'
import {
  getSizesAttribute,
  getSrcsetCandidates,
} from './../../../helpers/sizes'
import { VIEWPORTS, DPR } from '#rokka/generated-types'
import type {
  BuildRokkaUrlVariables,
  DefineImageStyleConfigSizes,
  RokkaImageSource,
} from '#rokka/types'
import { useRuntimeConfig, buildRokkaUrl, useHead, computed } from '#imports'

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

const emit = defineEmits<{
  error: [event: Event]
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
    props.source,
    props.fileName,
    props.host,
    variables,
  )
}

const imageAttributes = computed(() =>
  getImageAttributes(props.config, props.sourceWidth, props.sourceHeight),
)

const candidates = computed(() => getSrcsetCandidates(props.config.sizes, DPR))

const sizes = computed(() => getSizesAttribute(props.config.sizes, VIEWPORTS))

const src = computed(() => {
  const first = candidates.value[0]
  return first ? buildUrl(first.width, props.config.aspectRatio, first.dpr) : ''
})

const srcset = computed(() =>
  candidates.value
    .map((v) => {
      const url = buildUrl(v.width, props.config.aspectRatio, v.dpr)
      return `${url} ${v.descriptor}w`
    })
    .join(', '),
)

if (props.preload && import.meta.server && srcset.value) {
  useHead({
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
