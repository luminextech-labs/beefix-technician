'use client'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import BackButton from '@/components/BackButton'
import { api, techniciansApi } from '@/lib/api'

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

  // Form fields
  const [address, setAddress] = useState('')
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [subdistrict, setSubdistrict] = useState('')

  // Location
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
        // reverse geocode to fill form
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="font-semibold text-gray-900 text-base">พื้นที่ให้บริการ</h1>
            <p className="text-xs text-gray-400">ตั้งตำแหน่งฐานงาน</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── MAP CARD ── */}
            {baseLocation ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                <LocationMap lat={baseLocation.lat} lng={baseLocation.lng} radiusKm={serviceRadius} height={200} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">ยังไม่ได้ปักหมุดที่อยู่</p>
                  <p className="text-xs text-gray-400">กดปุ่ม GPS ด้านล่างเพื่อปักหมุด</p>
                </div>
              </div>
            )}

            {/* ── GPS BUTTON ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 mb-4">
              <button
                onClick={handleGetLocation}
                disabled={locating}
                className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors
                  ${locating ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                    baseLocation ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700']}`}
              >
                {locating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    กำลังหาตำแหน่ง...
                  </>
                ) : baseLocation ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    อัปเดตตำแหน่งปัจจุบัน
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    ปักหมุดที่อยู่ปัจจุบัน (GPS)
                  </>
                )}
              </button>
              {locError && <p className="text-xs text-red-500 mt-2">{locError}</p>}
            </div>

            {/* ── ADDRESS FORM ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">ที่อยู่ฐานงาน</h3>

              <div className="space-y-3">
                {/* ที่อยู่ */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">ที่อยู่</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={2}
                    placeholder="บ้านเลขที่, ซอย, ถนน, หมู่บ้าน..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                {/* ตำบล + อำเภอ */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">ตำบล</label>
                    <input
                      value={subdistrict}
                      onChange={e => setSubdistrict(e.target.value)}
                      placeholder="ตำบล"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">อำเภอ</label>
                    <input
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="อำเภอ"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* จังหวัด */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">จังหวัด</label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">เลือกจังหวัด</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── RADIUS ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">รัศมีให้บริการ</span>
                <span className="text-sm font-bold text-blue-600">{serviceRadius} กม.</span>
              </div>
              <div className="flex gap-2">
                {[5, 10, 20, 30, 50].map(r => (
                  <button
                    key={r}
                    onClick={() => setServiceRadius(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors
                      ${serviceRadius === r
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky save */}
      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-10">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-colors
                ${saving ? 'bg-gray-300 text-white cursor-not-allowed' :
                  saved ? 'bg-emerald-500 text-white' :
                  'bg-blue-600 text-white hover:bg-blue-700']}`}
            >
              {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกสำเร็จ' : 'บันทึก'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
