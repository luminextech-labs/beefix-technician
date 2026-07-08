'use client'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import BackButton from '@/components/BackButton'
import { techniciansApi } from '@/lib/api'

const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false })

const PROVINCES = [
  'กรุงเทพมหานคร','สมุทรปราการ','นนทบุรี','ปทุมธานี','พระนครศรีอยุธยา',
  'อ่างทอง','ลพบุรี','สิงห์บุรี','ชัยนาท','สระบุรี',
  'ชลบุรี','ระยอง','จันทบุรี','ตราด','ฉะเชิงเทรา','ปราจีนบุรี',
  'นครนายก','สระแก้ว','นครราชสีมา','บุรีรัมย์','สุรินทร์','ศรีสะเกษ',
  'อุบลราชธานี','ยโสธร','ชัยภูมิ','อำนาจเจริญ','หนองบัวลำภู',
  'ขอนแก่น','อุดรธานี','เลย','หนองคาย','มหาสารคาม','ร้อยเอ็ด',
  'กาฬสินธุ์','สกลนคร','นครพนม','มุกดาหาร','บึงกาฬ',
  'นครสวรรค์','อุทัยธานี','กำแพงเพชร','ตาก','สุโขทัย','พิษณุโลก',
  'เพชรบูรณ์','ลำปาง','แม่ฮ่องสอน','เชียงใหม่','ลำพูน','เชียงราย',
  'แม่เจ้าอยู่หัว','พะเยา','น่าน','แพร่','อุตรดิตถ์','พิจิตร',
  'สมุทรสาคร','นครปฐม','กาญจนบุรี','ราชบุรี','เพชรบุรี',
  'ประจวบคีรีขันธ์','ชุมพร','ระนอง','สุราษฎร์ธานี',
  'นครศรีธรรมราช','พัทลุง','สงขลา','สตูล','ตรัง','ปัตตานี',
  'ยะลา','นราธิวาส','ภูเก็ต','พังงา','กระบี่',
].sort((a, b) => a.localeCompare(b, 'th'))

export default function ServiceAreasPage() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [msg, setMsg] = useState('')
  const msgTimer = useRef<ReturnType<typeof setTimeout>>()

  const [address, setAddress] = useState('')
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [subdistrict, setSubdistrict] = useState('')

  const [baseLocation, setBaseLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')
  const [serviceRadius, setServiceRadius] = useState(20)

  useEffect(() => {
    techniciansApi.me().then(res => {
      if (res.success && res.technician) {
        const t = res.technician
        if (t.latitude && t.longitude) setBaseLocation({ lat: t.latitude, lng: t.longitude })
        if (t.serviceRadius) setServiceRadius(t.serviceRadius)
      }
      setLoading(false)
    })
  }, [])

  const flash = (text: string) => {
    setMsg(text)
    clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => setMsg(''), 2500)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) { setLocError('เบราว์เซอร์ไม่รองรับ GPS'); return }
    setLocating(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude
        setBaseLocation({ lat, lng })
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=th`
          )
          const data = await res.json()
          const addr = data.address || {}
          if (addr.state) setProvince(addr.state)
          if (addr.county || addr.district) setDistrict(addr.county || addr.district)
          if (addr.suburb || addr.neighbourhood || addr.village) setSubdistrict(addr.suburb || addr.neighbourhood || addr.village)
          const road = [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(' ')
          if (road) setAddress(road)
        } catch {}
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        if (err.code === 1) setLocError('กรุณาอนุญาตเข้าถึงตำแหน่ง')
        else if (err.code === 2) setLocError('ไม่สามารถหาตำแหน่งได้')
        else setLocError('หาตำแหน่ง Timeout')
      },
      { timeout: 15000, enableHighAccuracy: true }
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await techniciansApi.updateProfile({
        latitude: baseLocation?.lat,
        longitude: baseLocation?.lng,
        serviceRadius,
      })
      if (res.success) {
        setSaved(true)
        flash('บันทึกสำเร็จ')
        setTimeout(() => setSaved(false), 3000)
      } else {
        flash('บันทึกไม่สำเร็จ')
      }
    } catch (e: any) {
      flash(e?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80, fontFamily: 'Prompt, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'var(--primary)', padding: '14px 20px 24px',
        borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BackButton light />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#3D2C00' }}>พื้นที่ให้บริการ</div>
            <div style={{ fontSize: 12, color: 'rgba(61,44,0,0.6)' }}>ตั้งตำแหน่งฐานงานและรัศมี</div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
          zIndex: 999, background: '#3D2C00', color: 'white',
          fontSize: 13, padding: '8px 16px', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          fontFamily: 'Prompt, sans-serif',
        }}>
          {msg}
        </div>
      )}

      <div style={{ padding: '16px 16px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{
              width: 32, height: 32, border: '3px solid var(--border)',
              borderTop: '3px solid var(--primary)', borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          </div>
        ) : (
          <>
            {/* ── MAP CARD ── */}
            {baseLocation ? (
              <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 12 }}>
                <LocationMap lat={baseLocation.lat} lng={baseLocation.lng} radiusKm={serviceRadius} height={180} />
              </div>
            ) : (
              <div style={{
                background: 'white', borderRadius: 16, padding: '32px 16px', textAlign: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12, border: '1.5px solid var(--border)',
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📍</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>ยังไม่ได้ปักหมุดที่อยู่</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>กดปุ่ม GPS ด้านล่างเพื่อปักหมุด</div>
              </div>
            )}

            {/* ── GPS BUTTON ── */}
            <button
              onClick={handleGetLocation}
              disabled={locating}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 30,
                border: 'none',
                background: locating ? '#F3F4F6' : baseLocation ? '#F3F4F6' : 'var(--primary)',
                color: locating ? '#9CA3AF' : baseLocation ? 'var(--text)' : '#3D2C00',
                fontSize: 14, fontWeight: 700, cursor: locating ? 'not-allowed' : 'pointer',
                fontFamily: 'Prompt, sans-serif',
                boxShadow: baseLocation ? 'none' : '0 4px 16px rgba(255,184,0,0.3)',
                marginBottom: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {locating ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid #9CA3AF', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  กำลังหาตำแหน่ง...
                </>
              ) : (
                <>📍 {baseLocation ? 'อัปเดตตำแหน่งปัจจุบัน' : 'ปักหมุดที่อยู่ปัจจุบัน (GPS)'}</>
              )}
            </button>
            {locError && (
              <div style={{ padding: '8px 12px', background: '#FEE2E2', borderRadius: 10, color: '#DC2626', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
                {locError}
              </div>
            )}

            {/* ── ADDRESS FORM ── */}
            <div style={{
              background: 'white', borderRadius: 16, padding: 16,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12, border: '1.5px solid var(--border)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>🏠 ที่อยู่ฐานงาน</div>

              {/* ที่อยู่ */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>ที่อยู่</div>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={2}
                  placeholder="บ้านเลขที่, ซอย, ถนน..."
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid var(--border)', fontSize: 13,
                    color: 'var(--text)', outline: 'none', resize: 'none',
                    fontFamily: 'Prompt, sans-serif', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* ตำบล + อำเภอ */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>ตำบล</div>
                  <input
                    value={subdistrict}
                    onChange={e => setSubdistrict(e.target.value)}
                    placeholder="ตำบล"
                    style={{
                      width: '100%', padding: '9px 10px', borderRadius: 10,
                      border: '1.5px solid var(--border)', fontSize: 13,
                      color: 'var(--text)', outline: 'none',
                      fontFamily: 'Prompt, sans-serif', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>อำเภอ</div>
                  <input
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="อำเภอ"
                    style={{
                      width: '100%', padding: '9px 10px', borderRadius: 10,
                      border: '1.5px solid var(--border)', fontSize: 13,
                      color: 'var(--text)', outline: 'none',
                      fontFamily: 'Prompt, sans-serif', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* จังหวัด */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>จังหวัด</div>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 10px', borderRadius: 10,
                    border: '1.5px solid var(--border)', fontSize: 13,
                    color: 'var(--text)', outline: 'none',
                    fontFamily: 'Prompt, sans-serif', boxSizing: 'border-box',
                    background: 'white',
                  }}
                >
                  <option value="">เลือกจังหวัด</option>
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── RADIUS ── */}
            <div style={{
              background: 'white', borderRadius: 16, padding: 14,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12, border: '1.5px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>📍 รัศมีให้บริการ</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{serviceRadius} กม.</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[5, 10, 20, 30, 50].map(r => (
                  <button
                    key={r}
                    onClick={() => setServiceRadius(r)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 10,
                      border: serviceRadius === r ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      background: serviceRadius === r ? 'var(--primary-light)' : 'white',
                      color: serviceRadius === r ? '#92400E' : 'var(--text-light)',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'Prompt, sans-serif',
                      transition: 'all 0.15s',
                    }}
                  >
                    {r} กม.
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky save */}
      {!loading && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'white', padding: '12px 16px',
          borderTop: '1.5px solid var(--border)',
          zIndex: 20,
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 30,
              border: 'none',
              background: saving ? '#E5E7EB' : saved ? '#059669' : 'var(--primary)',
              color: saving ? '#9CA3AF' : saved ? 'white' : '#3D2C00',
              fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Prompt, sans-serif',
              boxShadow: saving || saved ? 'none' : '0 4px 16px rgba(255,184,0,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกสำเร็จ' : 'บันทึก'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
