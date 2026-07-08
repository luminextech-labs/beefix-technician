'use client'
import { useEffect, useState, useRef } from 'react'
import BackButton from '@/components/BackButton'
import { api } from '@/lib/api'

const REGIONS: Record<string, string[]> = {
  'ภาคเหนือ': ['เชียงใหม่','ลำพูน','เชียงราย','แม่เจ้าอยู่หัว','พะเยา','น่าน','แพร่','อุตรดิตถ์','พิจิตร'],
  'ภาคกลาง': ['กรุงเทพมหานคร','สมุทรปราการ','นนทบุรี','ปทุมธานี','พระนครศรีอยุธยา','อ่างทอง','ลพบุรี','สิงห์บุรี','ชัยนาท','สระบุรี','สมุทรสาคร','นครปฐม','สมุทรสงคราม','กาญจนบุรี','ราชบุรี','เพชรบุรี','ประจวบคีรีขันธ์','ชุมพร','ระนอง','สุราษฎร์ธานี','นครศรีธรรมราช','พัทลุง','สงขลา','สตูล','ตรัง','ปัตตานี'],
  'ภาคตะวันออกเฉียงเหนือ': ['นครราชสีมา','บุรีรัมย์','สุรินทร์','ศรีสะเกษ','อุบลราชธานี','ยโสธร','ชัยภูมิ','อำนาจเจริญ','หนองบัวลำภู','ขอนแก่น','อุดรธานี','เลย','หนองคาย','มหาสารคาม','ร้อยเอ็ด','กาฬสินธุ์','สกลนคร','นครพนม','มุกดาหาร','บึงกาฬ'],
  'ภาคตะวันออก': ['ชลบุรี','ระยอง','จันทบุรี','ตราด','ฉะเชิงเทรา','ปราจีนบุรี','นครนายก','สระแก้ว'],
  'ภาคใต้': ['ภูเก็ต','พังงา','กระบี่','ตรัง','สงขลา','สตูล','ปัตตานี','ยะลา','นราธิวาส','นครศรีธรรมราช','พัทลุง','สุราษฎร์ธานี','ชุมพร','ระนอง'],
}

const REGION_STYLE: Record<string, { gradient: string; dot: string; icon: string }> = {
  'ภาคเหนือ':        { gradient: 'from-blue-500 to-blue-600', dot: 'bg-blue-500', icon: '🏔️' },
  'ภาคกลาง':         { gradient: 'from-emerald-500 to-emerald-600', dot: 'bg-emerald-500', icon: '🌿' },
  'ภาคตะวันออกเฉียงเหนือ': { gradient: 'from-amber-500 to-orange-500', dot: 'bg-amber-500', icon: '🏞️' },
  'ภาคตะวันออก':     { gradient: 'from-yellow-400 to-yellow-500', dot: 'bg-yellow-400', icon: '🌊' },
  'ภาคใต้':          { gradient: 'from-violet-500 to-purple-500', dot: 'bg-violet-500', icon: '🏖️' },
}

const ALL_PROVINCES = Object.values(REGIONS).flat()

export default function ServiceAreasPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [openRegions, setOpenRegions] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    api.get<any>('/api/technicians/me/service-areas').then(r => {
      if (r.success) {
        setSelected(r.areas?.map((a: any) => a.province) || [])
        // Auto-open regions that have selections
        const open: Record<string, boolean> = {}
        Object.entries(REGIONS).forEach(([region, provinces]) => {
          open[region] = provinces.some(p => r.areas?.some((a: any) => a.province === p))
        })
        setOpenRegions(open)
      }
      setLoading(false)
    })
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
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
    setSelected(prev => {
      const merged = select ? [...new Set([...prev, ...provinces])] : prev.filter(p => !provinces.includes(p))
      return merged
    })
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const areas = selected.map(province => ({ province }))
      const res = await api.put<any>('/api/technicians/me/service-areas', { areas })
      if (res.success) {
        setSaved(true)
        showToast('✓ บันทึกสำเร็จแล้ว')
        setTimeout(() => setSaved(false), 3000)
      } else {
        showToast('บันทึกไม่สำเร็จ')
      }
    } catch {
      showToast('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const totalSelected = selected.length
  const progressPct = Math.round((totalSelected / 77) * 100)
  const allSelected = ALL_PROVINCES.every(p => selected.includes(p))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-toast">
          <div className="bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl flex items-center gap-2">
            <span>{toast}</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold text-gray-900">พื้นที่ให้บริการ</h1>
            <p className="text-xs text-gray-400 mt-0.5">เลือกจังหวัดที่รับงานได้</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">กำลังโหลด...</p>
          </div>
        ) : (
          <>
            {/* Progress Hero Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-5 relative overflow-hidden">
              {/* Decorative circle */}
              <div className="absolute -right-8 -top-8 w-36 h-36 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-60" />
              <div className="absolute -right-4 top-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-full opacity-80" />

              <div className="relative flex items-center gap-5">
                {/* Thailand mini map SVG */}
                <div className="flex-shrink-0">
                  <svg width="56" height="70" viewBox="0 0 56 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                    {/* Simplified Thailand shape */}
                    <path d="M28 4L30 8L34 7L36 10L38 9L40 12L38 16L40 20L38 24L40 28L38 30L40 33L38 36L35 38L32 40L30 44L27 42L25 44L23 42L21 44L19 42L17 44L15 42L13 44L11 46L13 48L15 50L13 52L15 54L18 56L21 54L23 56L26 58L28 62L30 58L32 60L34 58L32 54L34 52L32 50L34 48L32 46L34 44L32 42L34 40L32 38L30 36L32 34L30 32L32 30L30 28L28 26L30 24L28 22L30 20L28 18L26 16L24 18L22 16L24 14L26 12L28 10L26 8L28 6L28 4Z" fill="url(#thGrad)" stroke="#93c5fd" strokeWidth="1"/>
                    <defs>
                      <linearGradient id="thGrad" x1="28" y1="4" x2="28" y2="62" gradientUnits="userSpaceOnUse">
                        <stop stopColor={totalSelected > 0 ? '#3b82f6' : '#bfdbfe'}/>
                        <stop offset="1" stopColor={totalSelected > 0 ? '#6366f1' : '#c7d2fe'}/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-4xl font-black text-gray-900 leading-none">{totalSelected}</span>
                    <span className="text-base font-medium text-gray-400">/ 77</span>
                    <span className="text-sm text-gray-400 ml-1">จังหวัด</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {progressPct === 0 ? 'ยังไม่ได้เลือกพื้นที่' :
                     progressPct === 100 ? 'ครบทุกจังหวัดแล้ว 🎉' :
                     `${progressPct}% ของประเทศ`}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex-shrink-0 flex flex-col gap-1.5">
                  <button
                    onClick={() => selectAllInRegion(ALL_PROVINCES, !allSelected)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap
                      ${allSelected
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}
                  >
                    {allSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                  </button>
                </div>
              </div>
            </div>

            {/* Selected province pills */}
            {totalSelected > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1.5">
                  {selected.slice(0, 20).map(p => (
                    <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                      {p}
                      <button onClick={() => toggle(p)} className="hover:opacity-70 ml-0.5">×</button>
                    </span>
                  ))}
                  {totalSelected > 20 && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                      +{totalSelected - 20} อีก...
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Region Cards */}
            <div className="space-y-3">
              {Object.entries(REGIONS).map(([region, provinces]) => {
                const selectedInRegion = provinces.filter(p => selected.includes(p)).length
                const allInRegion = provinces.every(p => selected.includes(p))
                const isOpen = !!openRegions[region]
                const style = REGION_STYLE[region]

                return (
                  <div key={region} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200">
                    {/* Region header */}
                    <button
                      onClick={() => toggleRegion(region)}
                      className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Region icon circle */}
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-lg shadow-sm`}>
                          {style.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900 text-sm">{region}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {selectedInRegion === 0 ? `${provinces.length} จังหวัด` :
                             selectedInRegion === provinces.length ? `✓ ทั้งหมด ${provinces.length} จังหวัด` :
                             `เลือกแล้ว ${selectedInRegion}/${provinces.length} จังหวัด`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Mini progress dots */}
                        <div className="hidden sm:flex items-center gap-1 mr-1">
                          {provinces.slice(0, 6).map(p => (
                            <div key={p} className={`w-1.5 h-1.5 rounded-full transition-colors ${selected.includes(p) ? style.dot : 'bg-gray-200'}`} />
                          ))}
                          {provinces.length > 6 && <div className="text-xs text-gray-300">+{provinces.length - 6}</div>}
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); selectAllInRegion(provinces, !allInRegion) }}
                          className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all
                            ${allInRegion
                              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}
                        >
                          {allInRegion ? 'ยกเลิก' : 'เลือก'}
                        </button>

                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180 bg-gray-100' : 'bg-gray-50'}`}>
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Province grid */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="px-4 pb-4 border-t border-gray-50">
                        <div className="pt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {provinces.map(province => {
                            const isChecked = selected.includes(province)
                            return (
                              <button
                                key={province}
                                onClick={() => toggle(province)}
                                className={`relative text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150
                                  ${isChecked
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-200 -translate-y-0.5'
                                    : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100'}`}
                              >
                                <span className="flex items-center justify-between gap-1.5">
                                  <span className="truncate">{province}</span>
                                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all
                                    ${isChecked ? 'bg-white/30' : 'bg-gray-200/50'}`}>
                                    {isChecked ? (
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    )}
                                  </span>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Save Button */}
            <div className="mt-6 pb-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full py-4 rounded-2xl text-base font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2
                  ${saving
                    ? 'bg-gray-300 text-white cursor-not-allowed'
                    : totalSelected === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : saved
                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'}`}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : saved ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    บันทึกสำเร็จ!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    บันทึกพื้นที่บริการ
                  </>
                )}
              </button>
              {totalSelected === 0 && (
                <p className="text-center text-xs text-gray-400 mt-2">เลือกอย่างน้อย 1 จังหวัด</p>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes toast {
          0% { opacity: 0; transform: translate(-50%, -12px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          80% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -8px); }
        }
        .animate-toast { animation: toast 2.5s ease-in-out forwards; }
      `}</style>
    </div>
  )
}
