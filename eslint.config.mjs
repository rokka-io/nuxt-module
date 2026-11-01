import { fileURLToPath } from 'node:url'
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import oxlint from 'eslint-plugin-oxlint'

// Oxlint runs first and covers every rule it supports (see .oxlintrc.json).
// ESLint only runs the rest, mostly the Vue template rules: the oxlint config
// appended at the end turns off the rules that oxlint already covers.
//
// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
  },
  dirs: {
    src: ['./playground'],
  },
})
  .override('nuxt/vue/rules', {
    rules: {
      'vue/no-v-html': 0,
      'vue/multi-word-component-names': 'off',
      'vue/no-empty-component-block': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/no-v-for-template-key': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/component-api-style': 'error',
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts',
          },
        },
      ],
      'vue/block-order': [
        'error',
        {
          order: [['script', 'template'], 'style'],
        },
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
          },
        },
      ],
    },
  })
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  })
  // Must come last, so that it turns off the rules oxlint covers.
  .append(
    oxlint.buildFromConfigFile(
      fileURLToPath(new URL('./.oxlintrc.json', import.meta.url)),
    ),
  )
