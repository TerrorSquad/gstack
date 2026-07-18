#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

interface NestedObject {
  [key: string]: any
}

interface FlatObject {
  [key: string]: string | number | boolean | null | undefined
}

function flattenObject(obj: NestedObject, parentKey = '', result: FlatObject = {}): FlatObject {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key
      const value = obj[key]

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flattenObject(value, newKey, result)
      } else {
        result[newKey] = value
      }
    }
  }
  return result
}

async function processFile(inputPath: string): Promise<void> {
  try {
    console.log(`Processing: ${inputPath}`)

    // Validate file exists and is a JSON file
    if (!inputPath.endsWith('.json')) {
      console.log(`⚠️  Skipping non-JSON file: ${inputPath}`)
      return
    }

    const fileContent = await readFile(inputPath, 'utf-8')
    const data: NestedObject = JSON.parse(fileContent)

    // Handle empty objects
    if (Object.keys(data).length === 0) {
      console.log(`⏭️  Empty JSON object, skipping: ${inputPath}`)
      return
    }

    // Always flatten to ensure proper structure
    const flatObject = flattenObject(data)

    // Always sort keys for consistent output (fixes unsorted/malformed files)
    const sortedKeys = Object.keys(flatObject).toSorted()
    const sortedFlatObject: FlatObject = {}
    for (const key of sortedKeys) {
      sortedFlatObject[key] = flatObject[key]
    }

    // Write with consistent formatting (removes blank lines)
    const outputContent = JSON.stringify(sortedFlatObject, null, 2) + '\n'

    // Atomic write - directly overwrite the original file
    await writeFile(inputPath, outputContent, 'utf-8')

    console.log(`✅ Flattened and updated: ${inputPath}`)
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`❌ Invalid JSON in ${inputPath}: ${error.message}`)
    } else {
      console.error(
        `❌ Error processing ${inputPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
    throw error
  }
}

async function run(): Promise<void> {
  const args = process.argv.slice(2)

  // Handle help and version flags
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('JSON Locale Flattening Tool')
    console.log('')
    console.log('Usage: npm run flatten-json <input-file.json> [<input-file2.json> ...]')
    console.log('       node --experimental-strip-types scripts/flatten-json.ts <input-file.json>')
    console.log('')
    console.log('Options:')
    console.log('  --help, -h     Show this help message')
    console.log('  --version, -v  Show version information')
    console.log('')
    console.log('Examples:')
    console.log('  npm run flatten-json i18n/locales/*.json')
    console.log('')
    console.log('This script automatically runs via lint-staged when committing locale files.')
    console.log('It flattens nested JSON objects to use dot-notation keys for better performance.')
    process.exit(args.length === 0 ? 1 : 0)
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('JSON Locale Flattening Tool v1.0.0')
    console.log('Node.js TypeScript native execution with --experimental-strip-types')
    process.exit(0)
  }

  // Filter out flags and keep only file arguments
  const fileArgs = args.filter((arg) => !arg.startsWith('--') && !arg.startsWith('-'))

  if (fileArgs.length === 0) {
    console.error('❌ No input files specified')
    console.error('Use --help for usage information')
    process.exit(1)
  }

  try {
    let processedCount = 0
    let skippedCount = 0

    // Process all input files
    for (const inputFile of fileArgs) {
      const inputPath = path.resolve(inputFile)

      try {
        // oxlint-disable-next-line no-await-in-loop -- sequential: per-file error handling requires it
        await processFile(inputPath)
        processedCount++
      } catch (error) {
        if (inputFile.includes('*') || !inputFile.endsWith('.json')) {
          skippedCount++
          continue
        }
        throw error
      }
    }

    console.log(
      `✅ Successfully processed ${processedCount} file(s)${skippedCount > 0 ? `, skipped ${skippedCount}` : ''}`,
    )
  } catch (error) {
    console.error(`❌ Fatal error: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run()
}
