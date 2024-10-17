import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

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
