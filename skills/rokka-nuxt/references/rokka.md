# How rokka works

rokka.io stores original images and renders resized, cropped and converted
versions of them on request, served through a CDN. Full documentation:
https://rokka.io/documentation/

## Organizations

An organization is a rokka account. Its images render at
`https://{organization}.rokka.io`, which is the module's `host`. The management
API is `https://api.rokka.io`, authenticated with an `Api-Key` header. Render
URLs need no key: keep it in scripts and the CMS backend, out of the Nuxt app.

A stage organization can render the images of another organization, typically
production, with the organization option `render_org_fallback`. Stacks are not
part of the fallback.

## Source images

A source image is an uploaded original.

- **`hash`**: 40 characters, identifies the image in render URLs. The
  `short_hash` (6 to 40 characters) works in its place.
- **Metadata**: `name`, `width`, `height`, `format`, `size`. Read it with
  `GET https://api.rokka.io/sourceimages/{organization}/{hash}`.
- **Upload**: `POST https://api.rokka.io/sourceimages/{organization}` with the
  file in the form field `filedata`.
- **Dynamic metadata** changes the hash; user metadata does not. A project that
  stores hashes has to store the new one after setting dynamic metadata.

### Subject area

The subject area is dynamic metadata that marks the important part of an image.
A crop with the anchor `auto`, which the module's crop stack uses, centers on
it; without one it centers on a detected face if face detection ran, else on the
middle.

```sh
curl -X PUT 'https://api.rokka.io/sourceimages/{organization}/{hash}/meta/dynamic/subject_area' \
  -H "Api-Key: $ROKKA_API_KEY" -H 'Content-Type: application/json' \
  -d '{"x": 120, "y": 80, "width": 400, "height": 300}'
```

The response is `201 Created`, with the image's new hash in the `Location`
header. The old hash keeps rendering the old crop; `?deletePrevious=true`
deletes it. `?keepHash=true` updates the image in place instead, but renders
already cached keep the old crop until they expire.

## Stacks

A stack is a named list of operations (`resize`, `crop`, `rotate` and more) plus
options, stored in the organization. Stack variables such as `$w` and `$h` let
one stack render many sizes; the render URL sets them. The module needs two
stacks, see [stacks.md](stacks.md).

Stack options that matter for websites:

- **`autoformat`**: serves WebP to browsers that accept it, for URLs ending in
  `.jpg`, `.png`, `.gif` or `.webp`; organizations created recently also get
  AVIF and JPEG XL. Other extensions, such as `.tif` or `.heic`, are delivered
  in that format. The module's stacks turn it on.
- **`dpr`**: renders the image that many times larger, from 1.0 to 10.0. A stack
  needs a `resize` operation to accept it.

## Render URLs

```
https://{organization}.rokka.io/{stack}/{variables-w-400-h-300--options-dpr-2}/{hash}/{name}.{extension}
```

- **Stack**: a stack name, or `dynamic/{operations}` to render without a stored
  stack, for example `dynamic/resize-width-200--crop-width-200-height-200`.
- **Variables and options**: `variables-…` (short `v-`) sets stack variables,
  `options-…` (short `o-`) overrides stack options; `--` separates them. The
  segment is optional.
- **Source**: the hash, or `-{url}-` for a remote image.
- **Name**: free text for search engines, any character except `/`. Its
  extension sets the output format, unless `autoformat` picks a better one. A
  name without an extension returns 404 `No route found.`

## Caching

rokka treats a render URL as immutable: it sends one-year expiry headers, and
the CDN and browsers keep the image.

- **Overwriting a stack** (`PUT …/stacks/{organization}/{stack}?overwrite=true`)
  changes only images not rendered yet. Cached renders stay as they were.
- **Deleting a source image** leaves its renders in CDN caches until they
  expire.
- **A new URL** is the way to show a changed image: a new stack name for changed
  rules, or a version suffix at the end of the file name, such as
  `photo-v2.jpg`. Any number after the `v` gets a fresh render.
- **Invalidation endpoints** exist, but they are rate limited to 5 calls per
  hour and work asynchronously.

## Remote images

rokka can render an image from another server instead of an uploaded one. The
organization or the stack has to allow it with one of two options:

- **`remote_fullurl_allow: true`** with **`remote_fullurl_whitelist`**: any URL
  on the listed hosts. The whitelist entry `example.com` allows the host and its
  subdomains, `.example.com` only its subdomains; any other entry is a regular
  expression that must match up to the end of the host name. The URL goes in the
  source segment: `-https://example.com/photo.jpg-`.
- **`remote_basepath`**: a URL prefix; the source segment holds only the rest of
  the path: `-2024/06/photo.jpg-`.

For the whole organization:

```sh
curl -X PUT 'https://api.rokka.io/organizations/{organization}/options' \
  -H "Api-Key: $ROKKA_API_KEY" -H 'Content-Type: application/json' \
  -d '{"remote_fullurl_allow": true, "remote_fullurl_whitelist": ["example.com"]}'
```

For one stack, the same keys go into the stack's `options`.
