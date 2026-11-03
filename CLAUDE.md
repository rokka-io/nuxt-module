# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

`@rokka-io/nuxt` is a Nuxt module that renders responsive images from rokka.io
with the `<RokkaImage>` component. The README is the user documentation. The git
remote is named `Github`, not `origin`.

## Commands

Node 24 (`.nvmrc`). After `npm install`, and whenever `src/module.ts` changes,
run `npm run dev:prepare`: it stubs the module and generates `.nuxt/`, which
every tsconfig extends.

- `npm run typecheck`: vue-tsc over the module build, the runtime, the
  playground and the type tests
- `npm run lint`: oxlint first, then ESLint for the rules oxlint lacks, mostly
  Vue template rules (`eslint-plugin-oxlint` turns off the overlap).
  `npm run lint:fix` fixes what it can.
- `npm run format` / `npm run format:check`: oxfmt, which also wraps Markdown
  prose at 80 columns (`proseWrap: always`), so README edits must be formatted
  too
- `npm test`: all Vitest projects. The e2e tests need Chromium:
  `npx playwright-core install chromium`.
- `npm run dev`: the playground in `playground/`
- `npm run prepack`: builds `dist/`
- `npm run typecheck:dist`: after `prepack`, checks that `dist/module.d.mts`
  does not type the module as `any`. The build reads its compiler options from
  the root `tsconfig.json`, which is why that file extends
  `.nuxt/tsconfig.node.json`.

CI (`.github/workflows/ci.yml`) runs `dev:prepare`, `typecheck`, `lint`,
`format:check`, `test`, `prepack`, `typecheck:dist` and `dev:build`, in that
order.

Single tests:

```sh
npx vitest run --project unit                       # unit tests only
npx vitest run test/e2e/remote.test.ts              # one file
npx vitest run test/e2e/pictures.test.ts -t "media" # by test name
```

## Architecture

`src/module.ts` sets everything up at build time:

- `#rokka/generated-types` is a generated template that exports `VIEWPORTS` (the
  configured viewports with `fallback: 0` prepended) and `DPR`. The `Viewport`
  type comes from it, so image style configs are typed against the app's own
  viewports.
- `#rokka/types` is an alias for `src/runtime/types.ts`.
- `host` and the two stack names go into `runtimeConfig.public` as `rokkaHost`,
  `rokkaStackCrop` and `rokkaStackNoCrop`.
- It registers `<RokkaImage>` globally and auto-imports `defineImageStyle()` and
  `buildRokkaUrl()`.

`src/runtime/components/RokkaImage/index.vue` dispatches on `config.type` to
`Single`, `Sizes` or `Picture`; a string `config` is a custom stack and renders
`Single`. All three build their URLs with `buildRokkaUrl()`, which produces
`https://{host}/{stack}/variables-w-X-h-Y--options-dpr-Z/{source}/{fileName}`.
An image with a height uses the crop stack (`w` and `h` variables); width only
uses the no-crop stack.

The source is a rokka `hash` or a `remote` image URL. `getSourcePath()` turns a
remote URL into the `-{encoded url}-` segment rokka expects.

Conventions that span several files:

- **Explicit imports.** `.nuxtrc` sets `imports.autoImport=false`. Runtime code,
  fixture pages and the playground import from `#imports`.
- **Pure helpers.** The files in `src/runtime/helpers/` import nothing from Nuxt
  or Vue and take the viewports and densities as arguments, so the unit tests
  run in plain Node. Put new logic there and test it in `test/unit/`.
- **The `hash` or `remote` union.** `<RokkaImage>` declares it locally rather
  than importing it, because Vue's compiler has to resolve it to generate
  runtime props. At runtime both props are optional; only vue-tsc enforces the
  union.
- **The `error` event.** `<RokkaImage>` re-emits the `error` event of each child
  component. It also checks in `onMounted` for an image that failed before
  hydration (`complete && naturalWidth === 0`), since that event fires before
  Vue attaches listeners.
- **Preload.** Preload links are added with `useHead` on the server only. For
  `pictures`, `getPreloadLinks()` makes the media queries non-overlapping, so
  only the image the `<picture>` renders is preloaded. A query it can not
  exclude, one with a media type, ends the links: a width without a preload is
  better than two downloads.
- **Attributes.** `<RokkaImage>` passes attributes and listeners through to the
  `<img>`. `Picture` sets `inheritAttrs: false` and keeps only `class` and
  `style` on the `<picture>`.

## Tests

- **`test/unit/`:** the pure helpers, in Node.
- **`test/e2e/`:** `@nuxt/test-utils` with Playwright against the fixture app
  `test/e2e/fixtures/basic`. Each test renders a page from
  `fixtures/basic/pages/` and reads the DOM through `test/e2e/helpers`. The
  fixture uses the stack names `STACK_CROP` and `STACK_NO_CROP` and fake hashes,
  so URLs in snapshots are stable. A new scenario gets a new fixture page.
- **`test/types/*.vue`:** type tests, checked by `npm run typecheck:test` and
  not by Vitest. A line that must not compile gets a `@vue-expect-error` comment
  in templates or `@ts-expect-error` in scripts.
- **`test/package/`:** type tests for the built module, checked by
  `npm run typecheck:dist` after `prepack`.

## User documentation

- **README:** a breaking change for users gets an entry in the "Upgrading from
  1.x" section.
- **Agent skill:** `skills/rokka-nuxt/` is an Agent Skill for the coding agents
  of the module's users, published in the npm package. A change to behaviour
  users see (props, options, image styles, generated URLs or HTML) updates it in
  the same commit.
