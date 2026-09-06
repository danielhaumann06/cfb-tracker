import { buildAppIcon } from '@/lib/iconImage'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default async function AppleIcon() {
  return buildAppIcon(180)
}
