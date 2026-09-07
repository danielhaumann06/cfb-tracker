import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Saturday Slate',
    short_name: 'Saturday Slate',
    description:
      'Records, schedules, spreads, FPI, and playoff odds for your tracked college football teams.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fcfcfb',
    theme_color: '#2a78d6',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
