import { ImageResponse } from 'next/og'
import { cookies } from 'next/headers'
import { PNG } from 'pngjs'
import { THEME_TEAM_COOKIE, parseThemeTeamCookie } from '@/lib/teams'
import { getTeamSummary } from '@/lib/espn'

// next/og's ImageResponse (Satori) fails to decode some team logos' alpha
// channels, silently rendering nothing. Flattening onto an opaque white
// background ourselves first sidesteps that decoder bug entirely and also
// avoids logos with transparent (rather than opaque white) negative space
// disappearing against a same-colored background.
function flattenOnWhite(buffer: ArrayBuffer): Buffer {
  const png = PNG.sync.read(Buffer.from(buffer))
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

async function logoDataUri(logoUrl: string): Promise<string> {
  const res = await fetch(logoUrl, { next: { revalidate: 3600 } })
  const flattened = flattenOnWhite(await res.arrayBuffer())
  return `data:image/png;base64,${flattened.toString('base64')}`
}

export async function buildTeamIcon(size: number) {
  const cookieStore = await cookies()
  const teamId = parseThemeTeamCookie(cookieStore.get(THEME_TEAM_COOKIE)?.value)
  const team = await getTeamSummary(teamId)
  const logo = team.logo ? await logoDataUri(team.logo) : null
  const inner = Math.round(size * 0.72)

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
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires a plain <img>
          <img src={logo} width={inner} height={inner} alt="" />
        )}
      </div>
    ),
    { width: size, height: size }
  )
}
