'use client'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import BackButton from '@/components/BackButton'
import { api, techniciansApi } from '@/lib/api'

const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false })

const REGIONS: Record<string, string[]> = {
  'ภาคเหนือ': ['เชียงใหม่','ลำพูน','เชียงราย','แม่เจ้าอยู่หัว','พะเยา','น่าน','แพร่','อุตรดิตถ์','พิจิตร'],
  'ภาคกลาง': ['กรุงเทพมหานคร','สมุทรปราการ','นนทบุรี','ปทุมธานี','พระนครศรีอยุธยา','อ่างทอง','ลพบุรี','สิงห์บุรี','ชัยนาท','สระบุรี','สมุทรสาคร','นครปฐม','สมุทรสงคราม','กาญจนบุรี','ราชบุรี','เพชรบุรี','ประจวบคีรีขันธ์','ชุมพร','ระนอง','สุราษฎร์ธานี','นครศรีธรรมราช','พัทลุง','สงขลา','สตูล','ตรัง','ปัตตานี'],
  'ภาคตะวันออกเฉียงเหนือ': ['นครราชสีมา','บุรีรัมย์','สุรินทร์','ศรีสะเกษ','อุบลราชธานี','ยโสธร','ชัยภูมิ','อำนาจเจริญ','หนองบัวลำภู','ขอนแก่น','อุดรธานี','เลย','หนองคาย','มหาสารคาม','ร้อยเอ็ด','กาฬสินธุ์','สกลนคร','นครพนม','มุกดาหาร','บึงกาฬ'],
  'ภาคตะวันออก': ['ชลบุรี','ระยอง','จันทบุรี','ตราด','ฉะเชิงเทรา','ปราจีนบุรี','นครนายก','สระแก้ว'],
  'ภาคใต้': ['ภูเก็ต','พังงา','กระบี่','ตรัง','สงขลา','สตูล','ปัตตานี','ยะลา','นราธิวาส','นครศรีธรรมราช','พัทลุง','สุราษฎร์ธานี','ชุมพร','ระนอง'],
}

const REGION_DOT_COLORS: Record<string, string> = {
  'ภาคเหนือ': 'bg-blue-500',
  'ภาคกลาง': 'bg-emerald-500',
  'ภาคตะวันออกเฉียงเหนือ': 'bg-amber-500',
  'ภาคตะวันออก': 'bg-yellow-400',
  'ภาคใต้': 'bg-violet-500',
}

const ALL_PROVINCES = Object.values(REGIONS).flat()

export default function ServiceAreasPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [openRegions, setOpenRegions] = useState<Record<string, boolean>>({})
  const [msg, setMsg] = useState('')
  const msgTimer = useRef<ReturnType<typeof setTimeout>>()

  // Location
  const [baseLocation, setBaseLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLabel, setLocationLabel] = useState('')
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')
  const [serviceRadius, setServiceRadius] = useState(20)

  useEffect(() => {
    Promise.all([
      api.get<any>('/api/technicians/me/service-areas'),
      techniciansApi.me(),
    ]).then(([areaRes, techRes]) => {
      if (areaRes.success) {
        setSelected(areaRes.areas?.map((a: any) => a.province) || [])
        const open: Record<string, boolean> = {}
        Object.entries(REGIONS).forEach(([region, provinces]) => {
          open[region] = provinces.some(p => areaRes.areas?.some((a: any) => a.province === p))
        })
        setOpenRegions(open)
      }
      if (techRes.success && techRes.technician) {
        const t = techRes.technician
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

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=th`
      )
      const data = await res.json()
      const addr = data.address || {}
      const parts = [
        addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || '',
        addr.county || addr.district || '',
        addr.state || '',
      ].filter(Boolean)
      return parts.length > 0 ? parts.join(' › ') : `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) { setLocError('เบราว์เซอร์ไม่รองรับ GPS'); return }
    setLocating(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude
        setBaseLocation({ lat, lng })
        setLocationLabel(await reverseGeocode(lat, lng))
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

  const toggle = (province: string) => {
    setSelected(prev =>
      prev.includes(province) ? prev.filter(p => p !== province) : [...prev, province]
    )
    setSaved(false)
  }

  const toggleRegion = (region: string) => {
    setOpenRegions(prev => ({ ...prev, [region]: !prev[region] }))
  }

  const selectAllInRegion = (provinces: string[], select: boolean) => {
    setSelected(prev =>
      select ? [...new Set([...prev, ...provinces])] : prev.filter(p => !provinces.includes(p))
    )
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const areas = selected.map(province => ({ province }))
      const areaRes = await api.put<any>('/api/technicians/me/service-areas', { areas })
      if (baseLocation) {
        await techniciansApi.updateProfile({ latitude: baseLocation.lat, longitude: baseLocation.lng, serviceRadius })
      }
      if (areaRes.success) {
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

  const totalSelected = selected.length
  const allSelected = ALL_PROVINCES.every(p => selected.includes(p))

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="font-semibold text-gray-900 text-base">พื้นที่ให้บริการ</h1>
            <p className="text-xs text-gray-400">{totalSelected}/77 จังหวัด</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-6 w-px bg-gray-200" />
            <button
              onClick={() => selectAllInRegion(ALL_PROVINCES, !allSelected)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {allSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((totalSelected / 77) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-8 text-right">{totalSelected}</span>
          </div>
        </div>
      </div>

      {/* Message toast */}
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
            {/* ── LOCATION CARD ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
              {/* Map area */}
              {baseLocation ? (
                <div className="map-section">
                  <LocationMap lat={baseLocation.lat} lng={baseLocation.lng} radiusKm={serviceRadius} height={160} />
                  <div className="px-4 py-3">
                    {locationLabel && (
                      <p className="text-xs text-gray-500 mb-1">{locationLabel}</p>
                    )}
                    <p className="text-xs text-gray-400">{baseLocation.lat.toFixed(6)}, {baseLocation.lng.toFixed(6)}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">ยังไม่ได้ตั้งตำแหน่งฐานงาน</p>
                  <p className="text-xs text-gray-400">ลูกค้าจะได้เห็นระยะจากช่างที่ใกล้ที่สุด</p>
                </div>
              )}

              <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                {/* Radius */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 w-20">รัศมี</span>
                  <div className="flex gap-1.5 flex-1">
                    {[5, 10, 20, 30, 50].map(r => (
                      <button
                        key={r}
                        onClick={() => setServiceRadius(r)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors
                          ${serviceRadius === r
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        {r} กม.
                      </button>
                    ))}
                  </div>
                </div>

                {/* GPS button */}
                <button
                  onClick={handleGetLocation}
                  disabled={locating}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors
                    ${locating ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                      baseLocation ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
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
                      อัปเดตตำแหน่ง
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      ใช้ตำแหน่งปัจจุบัน
                    </>
                  )}
                </button>
                {locError && <p className="text-xs text-red-500 mt-2">{locError}</p>}
              </div>
            </div>

            {/* Selected chips */}
            {totalSelected > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1.5">
                  {selected.map(p => (
                    <button
                      key={p}
                      onClick={() => toggle(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-full hover:bg-gray-700 transition-colors"
                    >
                      {p}
                      <span className="opacity-60 text-xs">×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Region accordions */}
            <div className="space-y-2">
              {Object.entries(REGIONS).map(([region, provinces]) => {
                const selCount = provinces.filter(p => selected.includes(p)).length
                const allDone = provinces.every(p => selected.includes(p))
                const isOpen = !!openRegions[region]

                return (
                  <div key={region} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleRegion(region)}
                      className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      {/* Color dot */}
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${REGION_DOT_COLORS[region]}`} />

                      <span className="flex-1 text-left text-sm font-medium text-gray-800">{region}</span>

                      <span className="text-xs text-gray-400 mr-2">
                        {selCount > 0 ? `${selCount}/${provinces.length}` : provinces.length}
                      </span>

                      {/* Select all mini btn */}
                      <button
                        onClick={(e) => { e.stopPropagation(); selectAllInRegion(provinces, !allDone) }}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors mr-1
                          ${allDone ? 'border-gray-200 bg-gray-100 text-gray-500' : 'border-blue-200 bg-blue-50 text-blue-600'}`}
                      >
                        {allDone ? 'ยกเลิก' : 'เลือก'}
                      </button>

                      <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Province grid */}
                    <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 border-t border-gray-100' : 'max-h-0'}`}>
                      <div className="px-4 pb-4 pt-3 grid grid-cols-3 gap-1.5">
                        {provinces.map(province => {
                          const checked = selected.includes(province)
                          return (
                            <button
                              key={province}
                              onClick={() => toggle(province)}
                              className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors border
                                ${checked
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}
                            >
                              {province}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Sticky save button */}
      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-10">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-colors
                ${saving ? 'bg-gray-300 text-white cursor-not-allowed' :
                  saved ? 'bg-emerald-500 text-white' :
                  totalSelected === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700']}`}
            >
              {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกสำเร็จ' : 'บันทึกพื้นที่บริการ'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
