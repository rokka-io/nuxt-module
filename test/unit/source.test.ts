import { describe, it, expect } from 'vitest'
import { getSourcePath } from '../../src/runtime/helpers'

describe('getSourcePath', () => {
  it('uses a hash as is', () => {
    expect(getSourcePath('abc123')).toBe('abc123')
    expect(getSourcePath({ hash: 'abc123' })).toBe('abc123')
  })

  it('wraps a remote URL in dashes and encodes it', () => {
    expect(
      getSourcePath({ remote: 'https://example.com/images/event.jpg' }),
    ).toBe('-https%3A%2F%2Fexample.com%2Fimages%2Fevent.jpg-')
  })

  it('keeps the query string of a remote URL inside the segment', () => {
    expect(
      getSourcePath({ remote: 'https://example.com/image.php?id=12&w=a-b' }),
    ).toBe('-https%3A%2F%2Fexample.com%2Fimage.php%3Fid%3D12%26w%3Da-b-')
  })

  it('encodes a path below the remote base path', () => {
    expect(getSourcePath({ remote: '2017/06/Relax sabbatical.jpg' })).toBe(
      '-2017%2F06%2FRelax%20sabbatical.jpg-',
    )
  })
})
