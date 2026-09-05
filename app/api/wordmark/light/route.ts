import { buildWordmark } from '@/lib/wordmarkImage'

export const dynamic = 'force-static'

export async function GET() {
  return buildWordmark('#171717')
}
