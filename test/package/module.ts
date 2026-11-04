/**
 * Type tests for the built module, checked by `npm run typecheck:dist` after
 * `npm run prepack`. Nothing here runs.
 */
import type { NuxtModule } from '@nuxt/schema'
import { expectTypeOf } from 'vitest'
import rokka from '../../dist/module.mjs'

// The declarations type the module as `any` when the build can not resolve
// its imports. Nuxt then accepts any `rokka` options in nuxt.config.
expectTypeOf(rokka).not.toBeAny()

// The type of the `rokka` key in nuxt.config, as Nuxt infers it in
// .nuxt/types/modules.d.ts.
type RokkaConfig =
  typeof rokka extends NuxtModule<infer O, any, boolean> ? Partial<O> : never

// Each stack falls back to its default on its own.
export const oneStack: RokkaConfig = { stacks: { crop: 'my_crop' } }

// @ts-expect-error Unknown options are rejected.
export const typo: RokkaConfig = { hots: 'myorg.rokka.io' }
