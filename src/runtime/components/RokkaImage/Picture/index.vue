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
import { VIEWPORTS, DPR, type Viewport } from '#rokka/generated-types'
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

type PictureConfig = {
  viewport?: Viewport
  media?: string
  width?: number
  height?: number
  aspectRatio?: number
  minWidth?: number
}

function getMediaQueryFromViewport(viewport?: Viewport): string | undefined {
  if (!viewport) {
    return
  }
  const minWidth: number | undefined = VIEWPORTS[viewport]

  if (minWidth) {
    return `(min-width: ${minWidth}px)`
  }
}

function getPictureConfigs(): PictureConfig[] {
  // User provided an array.
  if (Array.isArray(props.config.pictures)) {
    return props.config.pictures.map((v) => {
      const media = v.media || getMediaQueryFromViewport(v.viewport)
      return {
        viewport: v.viewport,
        media,
        width: 'width' in v ? v.width : undefined,
        height: v.height,
        aspectRatio: v.aspectRatio || props.config.aspectRatio,
        minWidth: v.viewport ? VIEWPORTS[v.viewport] : undefined,
      }
    })
  }

  // User provided an object. Convert it to an array.
  return Object.entries(props.config.pictures)
    .map(([key, config]) => {
      const viewport = key as Viewport
      return {
        viewport,
        ...config,
        aspectRatio: config.aspectRatio || props.config.aspectRatio,
        minWidth: VIEWPORTS[viewport],
        media: getMediaQueryFromViewport(viewport),
      }
    })
    .sort((a, b) => {
      return b.minWidth - a.minWidth
    })
    .map((item, index, arr) => {
      // The last one should not have a media query.
      if (index === arr.length - 1) {
        return {
          ...item,
          media: undefined,
        }
      }
      return item
    })
}

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

function getWidth(spec: PictureConfig): number | undefined {
  if (spec.width) {
    // Width is provided explicitly.
    return spec.width
  } else if (spec.height && spec.aspectRatio) {
    // Height and aspect ratio is provided.
    return Math.round(spec.height * spec.aspectRatio)
  } else if (spec.viewport) {
    // Viewport available.
    return VIEWPORTS[spec.viewport]
  } else if (props.sourceWidth) {
    return props.sourceWidth
  }
}

function getHeight(spec: PictureConfig): number | undefined {
  if (spec.height) {
    // Height has been provided explicitly.
    return spec.height
  } else if (spec.width && spec.aspectRatio) {
    // Width and aspect ratio provided. We can calculate the height.
    return Math.round(spec.width / spec.aspectRatio)
  } else if (spec.viewport && spec.aspectRatio) {
    // Neither width nor height provided. Use the min-width of the breakpoint to calculate the height.
    // Use the breakpoint of the viewport as the width.
    const minWidth = VIEWPORTS[spec.viewport]
    return Math.round(minWidth * spec.aspectRatio)
  }
}

function notNullish<T = any>(val?: T | null | undefined): val is T {
  return val != null
}

type Source = {
  srcset: string
  srcsetItems: [string, string][]
  width: number
  height?: number
  media?: string
  viewport?: Viewport
  minWidth?: number
}

const sources = computed<Source[]>(() => {
  return getPictureConfigs()
    .map((spec) => {
      const width = getWidth(spec)
      const height = getHeight(spec)
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

const sourcesWithMinWidthSorted = computed(() => {
  return sources.value
    .map((v) => {
      if (!v.minWidth) {
        return null
      }

      return {
        ...v,
        minWidth: v.minWidth,
      }
    })
    .filter(notNullish)
    .sort((a, b) => a.minWidth - b.minWidth)
})

const fallback = computed(() => {
  // use explicitly defined fallback image
  // OR if we have minWidths the one with the lowest minWidth (usually the case if we use viewports)
  // OR the last one (for media queries this is generlly the fallthrough / fallback one)
  const source =
    sources.value.find((v) => v.viewport === 'fallback') ||
    sourcesWithMinWidthSorted.value[0] ||
    sources.value[sources.value.length - 1]

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
    link: [...sourcesWithMinWidthSorted.value].map((source, index, self) => {
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
