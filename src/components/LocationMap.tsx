'use client'
interface LocationMapProps {
  lat: number
  lng: number
  radiusKm: number
  height?: number
}

export default function LocationMap({ lat, lng, radiusKm, height = 200 }: LocationMapProps) {
  const zoom = radiusKm > 30 ? 9 : radiusKm > 10 ? 11 : 13
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <div style={{ position: 'relative', height, borderRadius: 16, overflow: 'hidden', background: '#E8E0D5' }}>
      <iframe
        src={osmUrl}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        title="แผนที่ตำแหน่ง"
      />
      {radiusKm > 0 && (
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          background: 'rgba(255,152,0,0.9)', color: 'white',
          padding: '4px 10px', borderRadius: 20,
          fontSize: 11, fontWeight: 700, zIndex: 10,
          fontFamily: 'Prompt, sans-serif',
        }}>
          📍 รัศมี {radiusKm} กม.
        </div>
      )}
    </div>
  )
}
