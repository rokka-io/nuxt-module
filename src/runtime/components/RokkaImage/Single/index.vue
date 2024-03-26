<template>
  <img v-if="src" :src="src" v-bind="imageAttributes" />
</template>

<script lang="ts" setup>
import { getImageAttributes } from './../../../helpers'
import {
  type BuildRokkaUrlVariables,
  type DefineImageStyleConfigSingle,
} from '#rokka/types'
import { useRuntimeConfig, buildRokkaUrl, computed } from '#imports'

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
  config: DefineImageStyleConfigSingle | string

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

const src = computed(() => {
  if (typeof props.config === 'string') {
    return buildRokkaUrl(
      props.config,
      '',
      props.hash,
      props.fileName,
      props.host,
    )
  }
  const variables: BuildRokkaUrlVariables = {
    w: props.config.width,
  }
  let height = props.config.height || 0
  let stack =
    props.config.stacks?.noCrop || runtimeConfig.public.rokkaStackNoCrop

  if (props.config.aspectRatio) {
    height = Math.round(props.config.width / props.config.aspectRatio)
  }

  if (height) {
    stack = props.config.stacks?.crop || runtimeConfig.public.rokkaStackCrop
    variables.h = height
  }

  return buildRokkaUrl(
    stack,
    '',
    props.hash,
    props.fileName,
    props.host,
    variables,
  )
})

const imageAttributes = computed(() =>
  typeof props.config === 'object'
    ? getImageAttributes(props.config, props.sourceWidth, props.sourceHeight)
    : {},
)
</script>
