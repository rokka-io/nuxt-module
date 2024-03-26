import type { BuildRokkaUrlVariables } from './../../types'
import { useRuntimeConfig } from '#imports'

export function buildRokkaUrl(
  stack: string,
  dpr = '',
  hash = '',
  name?: string,
  overrideHost?: string,
  variables?: BuildRokkaUrlVariables,
): string {
  const host = overrideHost || useRuntimeConfig().public.rokkaHost
  const parts = [host, stack]
  const modifierParts: string[] = []
  if (variables) {
    let variablesString = 'w-' + variables.w
    if (variables.h) {
      variablesString += '-h-' + variables.h
    }
    modifierParts.push('variables-' + variablesString)
  }
  if (dpr) {
    modifierParts.push('options-dpr-' + dpr)
  }
  parts.push(modifierParts.join('--'))
  parts.push(hash)
  parts.push(encodeURIComponent((name || 'image.jpg').replace('.pdf', '.jpg')))
  return 'https://' + parts.join('/')
}
