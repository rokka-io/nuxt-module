import type {
  DefineImageStyleConfigPictures,
  DefineImageStyleConfigSingle,
  DefineImageStyleConfigSizes,
} from '#rokka/types'

type ImageStyleByType = {
  single: DefineImageStyleConfigSingle
  sizes: DefineImageStyleConfigSizes
  pictures: DefineImageStyleConfigPictures
}

/**
 * Define an image style for `<RokkaImage>`.
 *
 * Generic over the type only, so that the returned style keeps its type, and
 * unknown properties are still reported.
 */
export function defineImageStyle<T extends keyof ImageStyleByType>(
  config: ImageStyleByType[T] & { type: T },
): ImageStyleByType[T] {
  return config
}
