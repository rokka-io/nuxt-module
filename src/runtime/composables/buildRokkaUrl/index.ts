import type { BuildRokkaUrlVariables, RokkaImageSource } from './../../types'
import { getSourcePath } from './../../helpers'
import { useRuntimeConfig } from '#imports'

/**
 * Build the URL of a rendered rokka image.
 *
 * The source is either the hash of an image stored in rokka, or an object
 * with the hash or the URL of a remote image: `{ remote: 'https://…' }`.
 */
export function buildRokkaUrl(
  stack: string,
  dpr = '',
  source: string | RokkaImageSource = '',
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
  parts.push(getSourcePath(source))
  parts.push(encodeURIComponent((name || 'image.jpg').replace('.pdf', '.jpg')))
  return 'https://' + parts.join('/')
}
