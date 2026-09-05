import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'College Football Tracker',
    short_name: 'CFB Tracker',
    description:
      'Records, schedules, spreads, FPI, and playoff odds for Nebraska, Oregon, Alabama, and Georgia Tech.',
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
