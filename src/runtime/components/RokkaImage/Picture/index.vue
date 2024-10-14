<template>
  <picture v-if="fallback">
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
      :src="fallback.src"
      :loading="loading"
      :class="imgClass"
    />
  </picture>
</template>

<script lang="ts" setup>
import { VIEWPORTS, DPR, type Viewport } from '#rokka/generated-types'
import {
  type DefineImageStyleConfigPictures,
  type DefineImageStyleConfigPicturesViewport,
  type BuildRokkaUrlVariables,
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

const smallestViewport = computed(
  () => Object.keys(props.config.pictures)[0] as Viewport,
)

const buildUrl = (
  spec: DefineImageStyleConfigPicturesViewport,
  dpr?: string,
) => {
  const width = 'width' in spec ? spec.width : Math.round(spec.height * spec.aspectRatio)
  const variables: BuildRokkaUrlVariables = {
    w: width,
    h: spec.height,
  }

  let stack =
    props.config.stacks?.noCrop || runtimeConfig.public.rokkaStackNoCrop

  if (!variables.h && spec.aspectRatio) {
    variables.h = Math.round(width / spec.aspectRatio)
  }

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

// check if we are using the viewports or the media approach
const picturesMedia = computed(() => {
  const firstEntry = Object.entries(props.config.pictures).at(0)?.at(1)
  return typeof firstEntry === 'object' && ('media' in firstEntry || 'viewport' in firstEntry)
})

const sources = computed(() => {
  let sources = Object.entries(props.config.pictures).map(
    ([viewportOrIndex, spec]) => {
      let media: string
      let minWidth = 0
      if ('media' in spec && typeof spec.media === 'string') {
        media = spec.media
      } else {
        let viewport = viewportOrIndex
        if ('viewport' in spec && typeof spec.viewport === 'string') {
          viewport = spec.viewport
        }

        minWidth = VIEWPORTS[viewport as Viewport]
        media =
          viewport !== smallestViewport.value
            ? `(min-width: ${minWidth}px)`
            : ''
      }

      const srcsetItems = DPR.map((v) => {
        const url = buildUrl(spec, v)
        const pixelRatio = v || '1'

        return [url, pixelRatio + 'x']
      })

      const srcset = srcsetItems.map((v) => v.join(' ')).join(', ')

      // Calculate the width and height for each source.
      // That way we can prevent layout shift because the browser can already
      // reserve space needed for each image source.
      const aspectRatio = spec.aspectRatio || props.config.aspectRatio
      let height = spec.height
      if (!height && aspectRatio && 'width' in spec) {
        height = Math.round(spec.width / aspectRatio)
      }

      let width = 'width' in spec ? spec.width : undefined
      if (!width && height && aspectRatio) {
        width = Math.round(height * aspectRatio)
      }

      return { srcset, media, minWidth, width, height, srcsetItems }
    },
  )

  if (!picturesMedia.value) {
    // sort by viewpwort minWidth if we have no media queries. Otherwiese the provided order is used.
    sources = sources.sort((a, b) => {
      return b.minWidth - a.minWidth
    })
  }

  return sources
})

const fallback = computed(() => {
  const smallest = sources.value[sources.value.length - 1]
  if (!smallest) {
    return
  }
  const fallbackUrl = smallest.srcsetItems[0]?.[0]
  if (!fallbackUrl) {
    return
  }

  return {
    src: fallbackUrl,
    width: smallest.width,
    height: smallest.height,
  }
})

if (props.preload && process.server) {
  useServerHead({
    link: [...sources.value]
      .sort((a, b) => a.minWidth - b.minWidth)
      .map((source, index, self) => {
        const next = self[index + 1]
        return {
          rel: 'preload',
          as: 'image',
          imagesrcset: source.srcset,
          media:
            index === 0 && next
              ? `(max-width: ${next.minWidth - 1}px)`
              : source.media,
        }
      }),
  })
}
</script>
