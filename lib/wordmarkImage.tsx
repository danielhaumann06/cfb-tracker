import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const bebasNeue = await readFile(
  join(process.cwd(), 'assets/BebasNeue-Regular.ttf')
)

export function buildWordmark(color: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 40px',
          fontFamily: 'Bebas Neue',
          fontSize: 160,
          letterSpacing: 6,
          whiteSpace: 'nowrap',
          color,
        }}
      >
        SATURDAY SLATE
      </div>
    ),
    {
      width: 1200,
      height: 220,
      fonts: [
        { name: 'Bebas Neue', data: bebasNeue, style: 'normal', weight: 400 },
      ],
    }
  )
}
