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
          padding: '0 60px',
          fontFamily: 'Bebas Neue',
          fontSize: 140,
          letterSpacing: 6,
          color,
        }}
      >
        SATURDAY SLATE
      </div>
    ),
    {
      width: 1560,
      height: 220,
      fonts: [
        { name: 'Bebas Neue', data: bebasNeue, style: 'normal', weight: 400 },
      ],
    }
  )
}
