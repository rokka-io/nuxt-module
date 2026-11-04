import hashes from '../rokka/hashes.json'
import { IMAGES } from '../rokka/images'

/**
 * The test images in the playground's rokka organization, with the hashes
 * that `npm run rokka:setup` wrote.
 */
export const TEST_IMAGES = IMAGES.map((image) => {
  const hash = (hashes as Record<string, string>)[image.name]
  if (!hash) {
    throw new Error(
      `No hash for ${image.name}. Run npm run rokka:setup to upload it.`,
    )
  }
  return { name: image.name, hash, width: image.width, height: image.height }
})
