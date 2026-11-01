# The module's stacks

The crop stack (`fe_nuxt_crop` by default) fills the box `$w` × `$h` and crops
the rest. The no-crop stack (`fe_nuxt_no_crop` by default) resizes to the width
`$w`. Both turn on `autoformat` and never upscale beyond the source image, not
even for high densities.

## Create them

Save each definition to a file and send it to the rokka API with an API key of
the organization. The stack name is the last segment of the URL.

```sh
curl -X PUT 'https://api.rokka.io/stacks/{organization}/fe_nuxt_crop' \
  -H "Api-Key: $ROKKA_API_KEY" -H 'Content-Type: application/json' \
  --data @fe_nuxt_crop.json
```

A stack that already exists answers with an error; add `?overwrite=true` to
replace it. Overwriting does not change images that are already rendered and
cached.

`fe_nuxt_crop.json`:

```json
{
  "operations": [
    {
      "name": "resize",
      "options": {
        "mode": "fill",
        "upscale": false,
        "upscale_dpr": false
      },
      "expressions": { "width": "$w", "height": "$h" }
    },
    {
      "name": "crop",
      "options": {
        "mode": "absolute",
        "anchor": "auto",
        "fallback": "center_center"
      },
      "expressions": { "width": "$w", "height": "$h" }
    }
  ],
  "options": { "autoformat": true },
  "variables": { "w": 500, "h": 500 }
}
```

`fe_nuxt_no_crop.json`:

```json
{
  "operations": [
    {
      "name": "resize",
      "options": {
        "mode": "fill",
        "upscale": false,
        "upscale_dpr": false
      },
      "expressions": { "width": "$w" }
    }
  ],
  "options": { "autoformat": true },
  "variables": { "w": 100 }
}
```

## Other stacks

A project can use its own stacks, for all images with `rokka.stacks` in
`nuxt.config.ts`, or for one image style with `stacks` in `defineImageStyle()`.
The module sets the variables in the URL and adds the `dpr` option, so:

- The crop stack uses the variables `w` and `h` for its width and height.
- The no-crop stack uses the variable `w` for its width.
- Both contain a `resize` operation. Without one, rokka answers every URL with
  the `dpr` option with 400
  `The DPR stack option can only be used with a dpr capable operation …`.

rokka ignores variables that a stack does not read, without an error: the image
then renders at the stack's own size.
