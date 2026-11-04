/**
 * Creates what the playground needs in its rokka organization: the stacks in
 * `stacks/` of the repository, and the test images in `images/`. The hashes of
 * the images go to `hashes.json`, for the playground's pages.
 *
 *   npm run rokka:setup                  # creates what is missing
 *   npm run rokka:setup -- --overwrite   # also replaces existing stacks
 *
 * It reads ROKKA_API_KEY from `playground/.env`. Running it again is safe:
 * for a file it already has, with the same subject area, rokka returns the
 * existing image and its hash.
 */
import { openAsBlob } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { IMAGES, getSubjectArea } from './images.ts'

const ORGANIZATION = 'rokka-nuxt-module'

const { ROKKA_API_KEY } = process.env
if (!ROKKA_API_KEY) {
  console.error('ROKKA_API_KEY is not set. Add it to playground/.env.')
  process.exit(1)
}
const headers = { 'Api-Key': ROKKA_API_KEY }
const overwrite = process.argv.includes('--overwrite')

/** Calls the rokka API. Throws for an error status other than `allowed`. */
async function rokka(
  method: string,
  path: string,
  body?: string | FormData,
  allowed: number[] = [],
): Promise<Response> {
  const response = await fetch(`https://api.rokka.io/${path}`, {
    method,
    headers:
      typeof body === 'string'
        ? { ...headers, 'Content-Type': 'application/json' }
        : headers,
    body,
  })
  if (!response.ok && !allowed.includes(response.status)) {
    throw new Error(
      `${method} ${path}: ${response.status} ${await response.text()}`,
    )
  }
  return response
}

// The stacks. An existing one is left alone, unless --overwrite is set.
const stacksDir = new URL('../../stacks/', import.meta.url)
for (const file of await readdir(stacksDir)) {
  const { name, ...definition } = JSON.parse(
    await readFile(new URL(file, stacksDir), 'utf8'),
  )
  const path = `stacks/${ORGANIZATION}/${name}`
  const exists = (await rokka('GET', path, undefined, [404])).ok
  if (exists && !overwrite) {
    console.log(`Stack ${name} exists, skipped. --overwrite replaces it.`)
    continue
  }
  await rokka(
    'PUT',
    exists ? `${path}?overwrite=true` : path,
    JSON.stringify(definition),
  )
  console.log(
    exists
      ? `Stack ${name} replaced. Images rendered before keep the old version in the CDN.`
      : `Stack ${name} created.`,
  )
}

// The images, with the focal point as subject area.
const hashes: Record<string, string> = {}
for (const image of IMAGES) {
  const form = new FormData()
  form.append(
    'filedata',
    await openAsBlob(new URL(`./images/${image.name}`, import.meta.url), {
      type: 'image/png',
    }),
    image.name,
  )
  if (image.focalPoint) {
    form.append(
      'meta_dynamic[0][subject_area]',
      JSON.stringify(getSubjectArea(image.focalPoint)),
    )
  }
  const response = await rokka('POST', `sourceimages/${ORGANIZATION}`, form)
  const { items } = (await response.json()) as { items: { hash: string }[] }
  const hash = items[0]?.hash
  if (!hash) {
    throw new Error(`Uploading ${image.name} returned no image.`)
  }
  hashes[image.name] = hash
  console.log(`Image ${image.name}: ${hash}`)
}

await writeFile(
  new URL('./hashes.json', import.meta.url),
  `${JSON.stringify(hashes, null, 2)}\n`,
)
console.log('Hashes written to playground/rokka/hashes.json.')
