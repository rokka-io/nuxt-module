<template>
  <img
    v-if="src"
    :src="src"
    v-bind="imageAttributes"
    @error="emit('error', $event)"
  />
</template>

<script lang="ts" setup>
import { getImageAttributes, getSingleHeight } from './../../../helpers'
import type {
  BuildRokkaUrlVariables,
  DefineImageStyleConfigSingle,
  RokkaImageSource,
} from '#rokka/types'
import { useRuntimeConfig, buildRokkaUrl, computed, useHead } from '#imports'

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

const emit = defineEmits<{
  error: [event: Event]
}>()

const src = computed(() => {
  if (typeof props.config === 'string') {
    return buildRokkaUrl(
      props.config,
      '',
      props.source,
      props.fileName,
      props.host,
    )
  }
  const variables: BuildRokkaUrlVariables = {
    w: props.config.width,
  }
  const height = getSingleHeight(props.config)
  let stack =
    props.config.stacks?.noCrop || runtimeConfig.public.rokkaStackNoCrop

  if (height) {
    stack = props.config.stacks?.crop || runtimeConfig.public.rokkaStackCrop
    variables.h = height
  }

  return buildRokkaUrl(
    stack,
    '',
    props.source,
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

if (props.preload && import.meta.server) {
  useHead({
    link: [{ rel: 'preload', as: 'image', href: src.value }],
  })
}
</script>
