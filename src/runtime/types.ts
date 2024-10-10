import { type Viewport } from '#rokka/generated-types'

export type DefineImageStyleConfigPicturesViewport = {
  width: number
  height?: number
  aspectRatio?: number
}

export type DefineImageStyleStacks = {
  /**
   * Define the stack to use when the image should be cropped.
   *
   * The stack must define a variable "w" and "h" for width and height.
   */
  crop?: string

  /**
   * Define the stack to use when the image should not be cropped.
   *
   * The stack must define a variable "w" for the width.
   */
  noCrop?: string
}

export type DefineImageStyleConfigSingleViewportSize = {
  /**
   * The width of the image at the given viewport.
   */
  width: number
}

export type DefineImageStyleConfigSizes = {
  /**
   * Type signature to render a <img> image with different sizes per viewport as srcset attribute.
   */
  type: 'sizes'

  /**
   * Override the default stacks to use.
   */
  stacks?: DefineImageStyleStacks

  /**
   * Define the exact width in pixels the image occupies for the given viewports.
   *
   * This will render a <img> tag with a srcset attribute.
   */
  sizes: Partial<Record<Viewport, number>>

  /**
   * The aspect ratio of the image across all viewports. If left empty, the
   * aspect ratio of the source image is kept.
   */
  aspectRatio?: number
}

export type DefineImageStyleConfigPictures = {
  /**
   * Type signature to render a <picture> image.
   */
  type: 'pictures'

  /**
   * Override the default stacks to use.
   */
  stacks?: DefineImageStyleStacks

  /**
   * The default aspect ratio of the image for all viewports.
   *
   * It's possible to override the aspect ratio for every viewport
   * individually.
   */
  aspectRatio?: number

  /**
   * Define the exact size of the rendered image for every viewport.
   *
   * This will render a <picture> tag with <source> tags for every viewport.
   * Use this if the aspect ratio changes for every viewport.
   */
  pictures:
    | Partial<Record<Viewport, DefineImageStyleConfigPicturesViewport>>
    | (({ viewport: Viewport } | { media: string }) &
        DefineImageStyleConfigPicturesViewport)[]
}

export type DefineImageStyleConfigSingle = {
  /**
   * Type signature for a single image.
   *
   * This will render a single <img> tag with a single src attribute that renders an image for the exact given size.
   */
  type: 'single'

  /**
   * Override the default stacks to use.
   */
  stacks?: DefineImageStyleStacks

  /**
   * The width of the image.
   */
  width: number

  /**
   * The aspect ratio of the image.
   */
  aspectRatio?: number

  /**
   * The height of the image. If empty and no aspectRatio is defined, the image will keep its original aspect ratio.
   */
  height?: number
}

export type DefineImageStyleConfig =
  | DefineImageStyleConfigSingle
  | DefineImageStyleConfigSizes
  | DefineImageStyleConfigPictures

export type BuildRokkaUrlVariables = {
  w: string | number
  h?: string | number
}

export type RequiredRokkaMetadata = {
  hash: string
  sourceWidth?: number
  sourceHeight?: number
}
