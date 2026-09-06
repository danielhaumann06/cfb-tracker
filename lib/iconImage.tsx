import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PNG } from 'pngjs'

// next/og's ImageResponse (Satori) fails to decode some PNGs' alpha channels,
// silently rendering nothing. Flattening onto an opaque white background
// ourselves first sidesteps that decoder bug entirely and also avoids logos
// whose negative space is transparent (rather than opaque white) disappearing
// against a same-colored background.
function flattenOnWhite(buffer: Buffer): Buffer {
  const png = PNG.sync.read(buffer)
  const { width, height, data } = png
  const out = new PNG({ width, height })

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4
    const alpha = data[idx + 3] / 255
    out.data[idx] = Math.round(data[idx] * alpha + 255 * (1 - alpha))
    out.data[idx + 1] = Math.round(data[idx + 1] * alpha + 255 * (1 - alpha))
    out.data[idx + 2] = Math.round(data[idx + 2] * alpha + 255 * (1 - alpha))
    out.data[idx + 3] = 255
  }

  return PNG.sync.write(out)
}

const CFP_LOGO_WIDTH = 500
const CFP_LOGO_HEIGHT = 561
const CFP_LOGO_ASPECT = CFP_LOGO_WIDTH / CFP_LOGO_HEIGHT

const cfpLogoBuffer = await readFile(join(process.cwd(), 'assets/cfp-logo.png'))
const cfpLogoDataUri = `data:image/png;base64,${flattenOnWhite(cfpLogoBuffer).toString('base64')}`

export async function buildAppIcon(size: number) {
  const innerHeight = Math.round(size * 0.72)
  const innerWidth = Math.round(innerHeight * CFP_LOGO_ASPECT)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        {
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires a plain <img>
          <img src={cfpLogoDataUri} width={innerWidth} height={innerHeight} alt="" />
        }
      </div>
    ),
    { width: size, height: size }
  )
}
