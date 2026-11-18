import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const title = (url.searchParams.get('title') || 'NewsMap.JS').slice(0, 140)
  const edition = (url.searchParams.get('edition') || 'World news').slice(0, 80)
  const locale = url.searchParams.get('locale') === 'tr' ? 'tr' : 'en'
  let categories: string[] = []

  try {
    const state = JSON.parse(url.searchParams.get('d') || '{}') as { c?: unknown }
    if (Array.isArray(state.c)) {
      categories = state.c.filter((value): value is string => typeof value === 'string').slice(0, 8)
    }
  } catch {
    categories = []
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '54px 64px',
          color: '#fff',
          background: 'radial-gradient(ellipse at top right, #253748, #090b0e 66%)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {['#d9534f', '#d2a930', '#479556', '#19889b', '#426ab2', '#89559d'].map((color, index) => (
              <div key={color} style={{ width: 16, height: 38 + (index % 3) * 9, background: color, borderRadius: 3 }} />
            ))}
          </div>
          <span style={{ fontSize: 25, fontWeight: 700, letterSpacing: 1 }}>NEWSMAP.JS</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 22, color: '#aeb9c7' }}>{locale === 'tr' ? 'PAYLAŞILAN HABER HARİTASI' : 'SHARED NEWS MAP'}</div>
          <div style={{ fontSize: 55, fontWeight: 700, lineHeight: 1.1, maxWidth: 1020 }}>{title}</div>
          <div style={{ fontSize: 24, color: '#aeb9c7' }}>{edition}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(categories.length ? categories : ['world', 'business', 'technology']).map(category => (
            <span key={category} style={{ padding: '8px 14px', border: '1px solid #5c6674', borderRadius: 18, color: '#d7dee7', fontSize: 17 }}>
              {category.replaceAll('_', ' ')}
            </span>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
