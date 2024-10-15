import { fileURLToPath } from 'url'
import {
  createResolver,
  defineNuxtModule,
  addComponent,
  addImports,
  addTemplate,
} from '@nuxt/kit'

export type ModuleOptions = {
  /**
   * The rokka host name.
   */
  host: string

  /**
   * Object of viewport name and min-width.
   */
  viewports: Record<string, number>

  /**
   * The device pixel ratios (DPR) to support for srcset and picture images.
   * The default value of ['', '2'] generates variations for normal and
   * double density. Fractional values are also supported, e.g. '1.5'.
   */
  dpr?: string[]

  /**
   * Define the default stacks to use.
   */
  stacks?: {
    /**
     * The stack to use when the image should be cropped.
     *
     * The stack must define a variable "w" and "h" for width and height.
     */
    crop: string

    /**
     * The stack to use when the image should not be cropped.
     * Its operations should resize the image to a fixed width.
     *
     * The stack must define a variable "w" for the width.
     */
    noCrop: string
  }
}

export type ModuleHooks = {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@rokka-io/nuxt',
    configKey: 'rokka',
    version: '1.0.0',
    compatibility: {
      nuxt: '^3.8.0',
    },
  },
  defaults: {
    host: '',
    viewports: {
      sm: 0,
      md: 768,
      lg: 1024,
    },
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    // Transpile all runtime code.
    nuxt.options.build.transpile.push(runtimeDir)

    // Add alias for the runtime types.
    nuxt.options.alias['#rokka/types'] = resolve('runtime/types')

    addImports({
      from: resolve('./runtime/composables/rokka/defineImageStyle'),
      name: 'defineImageStyle',
    })

    const dpr = options.dpr || ['', '2']

    nuxt.options.runtimeConfig.public.rokkaHost = options.host
    nuxt.options.runtimeConfig.public.rokkaStackCrop =
      options.stacks?.crop || 'fe_nuxt_crop'
    nuxt.options.runtimeConfig.public.rokkaStackNoCrop =
      options.stacks?.noCrop || 'fe_nuxt_no_crop'

    // Create the rokka helper file.
    const rokkaTypes = addTemplate({
      write: true,
      filename: 'rokka/generated-types.ts',
      getContents: () => {
        if (!options.viewports) {
          throw new Error('Missing viewports in rokka options.')
        }
        const viewports = Object.entries({ fallback: 0, ...options.viewports })
          .map(([key, value]) => {
            return `'${key}': ${value}`
          })
          .join(',\n  ')
        return `
export const DPR = ${JSON.stringify(dpr)}

export const VIEWPORTS = {
  ${viewports}
} as const

export type Viewport = keyof typeof VIEWPORTS`
      },
    }).dst
    nuxt.options.alias['#rokka/generated-types'] = rokkaTypes

    nuxt.options.alias['#rokka/types'] = resolve('runtime/types')

    addComponent({
      filePath: resolve('./runtime/components/RokkaImage/index.vue'),
      name: 'RokkaImage',
      global: true,
    })
    addImports({
      from: resolve('./runtime/composables/buildRokkaUrl'),
      name: 'buildRokkaUrl',
    })
  },
})

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    rokkaHost: string
    rokkaStackCrop: string
    rokkaStackNoCrop: string
  }
}
