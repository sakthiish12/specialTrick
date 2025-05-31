import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const POSTS_DIR = path.join(process.cwd(), 'posts')

interface ValidationError {
  file: string
  message: string
}

function validatePostMetadata(file: string, frontMatter: any): ValidationError[] {
  const errors: ValidationError[] = []
  const requiredFields = ['title', 'date', 'description', 'tags']

  for (const field of requiredFields) {
    if (!frontMatter[field]) {
      errors.push({
        file,
        message: `Missing required field: ${field}`,
      })
    }
  }

  if (frontMatter.date && !isValidDate(frontMatter.date)) {
    errors.push({
      file,
      message: 'Invalid date format. Use YYYY-MM-DD',
    })
  }

  if (frontMatter.tags && !Array.isArray(frontMatter.tags)) {
    errors.push({
      file,
      message: 'Tags must be an array',
    })
  }

  return errors
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

function validatePostFilename(filename: string): ValidationError[] {
  const errors: ValidationError[] = []
  const regex = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.mdx?$/

  if (!regex.test(filename)) {
    errors.push({
      file: filename,
      message: 'Invalid filename format. Use YYYY-MM-DD-title.mdx',
    })
  }

  return errors
}

async function validatePosts(): Promise<ValidationError[]> {
  const errors: ValidationError[] = []
  const files = fs.readdirSync(POSTS_DIR)

  for (const file of files) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue

    const filePath = path.join(POSTS_DIR, file)
    const content = fs.readFileSync(filePath, 'utf8')

    try {
      const { data: frontMatter } = matter(content)
      errors.push(...validatePostFilename(file))
      errors.push(...validatePostMetadata(file, frontMatter))
    } catch (error) {
      errors.push({
        file,
        message: `Failed to parse front matter: ${error}`,
      })
    }
  }

  return errors
}

async function main() {
  const errors = await validatePosts()

  if (errors.length > 0) {
    console.error('Blog post validation failed:')
    errors.forEach((error) => {
      console.error(`\n${error.file}:`)
      console.error(`  ${error.message}`)
    })
    process.exit(1)
  }

  console.log('All blog posts are valid!')
}

main().catch((error) => {
  console.error('Validation failed:', error)
  process.exit(1)
}) 