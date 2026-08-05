// Makes the docs site buildable from a checkout where only `site/` is installed.
//
// Vite's oxc transform resolves a tsconfig for every .vue/.ts file. It walks up
// past `site/tsconfig.json` (solution-style: `files: []` and references, so no
// file "belongs" to it) and reaches the STARTER's root `tsconfig.json`, whose
// project references point at a root `.nuxt/` — a directory that only exists
// once the root project has been installed and prepared.
//
// The docs site is deliberately standalone, and Cloudflare Pages installs
// `site/` alone, so those references dangle and every page fails to transform:
//
//   [TSCONFIG_ERROR] Failed to load tsconfig '../.nuxt/tsconfig.app.json'
//
// (`../.nuxt` is the ROOT .nuxt seen from `site/`.) This passed locally for a
// long time purely because a stale root `.nuxt/` was lying around from working
// on the app — the first clean clone exposed it.
//
// Empty stubs satisfy the reference and nothing else: no compilerOptions means
// no influence on the build. If the root project IS prepared, the real files
// are already there and we leave them alone.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootNuxt = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.nuxt')

mkdirSync(rootNuxt, { recursive: true })

for (const name of ['app', 'server', 'shared', 'node']) {
  const file = join(rootNuxt, `tsconfig.${name}.json`)
  if (!existsSync(file)) writeFileSync(file, '{}\n')
}
