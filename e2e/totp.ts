import { createHmac } from 'node:crypto'

// RFC 6238 TOTP (SHA-1, 30 s, 6 digits) for e2e: lets a test "be" the authenticator app.
function base32(s: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const c of s.replace(/=+$/, '').toUpperCase())
    bits += alphabet.indexOf(c).toString(2).padStart(5, '0')
  return Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)))
}

export function totp(secret: string | Buffer, time = Date.now(), digits = 6): string {
  const key = typeof secret === 'string' ? base32(secret) : secret
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(time / 1000 / 30)))
  const h = createHmac('sha1', key).update(counter).digest()
  const o = h[h.length - 1]! & 0xf
  const n = ((h[o]! & 0x7f) << 24) | (h[o + 1]! << 16) | (h[o + 2]! << 8) | h[o + 3]!
  return String(n % 10 ** digits).padStart(digits, '0')
}
