/**
 * Downloads a Blob (or a blob: URL) as a file. Browser-only.
 *
 * @example
 * downloadBlob(new Blob(['hi'], { type: 'text/plain' }), 'hello.txt')
 * downloadBlob('blob:https://example.com/abc123', 'hello.txt')
 */
export function downloadBlob(blob: Blob | string, fileName: string) {
  let blobUrl: string
  let createdUrl = false
  if (typeof blob === 'string') {
    if (!blob.startsWith('blob:')) throw createError('Invalid Blob URL')
    blobUrl = blob
  } else {
    blobUrl = window.URL.createObjectURL(blob)
    createdUrl = true
  }

  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = blobUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Only revoke URLs we created; a caller-supplied blob: URL is theirs to manage.
  if (createdUrl) window.URL.revokeObjectURL(blobUrl)
}
