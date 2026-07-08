'use client'
import { useEffect, useState } from 'react'
import BackButton from '@/components/BackButton'
import { api } from '@/lib/api'

const REGIONS = {
  'ภาคเหนือ': ['เชียงใหม่','ลำพูน','เชียงราย','แม่เจ้าอยู่หัว','พะเยา','น่าน','แพร่','อุตรดิตถ์','พิจิตร'],
  'ภาคกลาง': ['กรุงเทพมหานคร','สมุทรปราการ','นนทบุรี','ปทุมธานี','พระนครศรีอยุธยา','อ่างทอง','ลพบุรี','สิงห์บุรี','ชัยนาท','สระบุรี','สมุทรสาคร','นครปฐม','สมุทรสงคราม','กาญจนบุรี','ราชบุรี','เพชรบุรี','ประจวบคีรีขันธ์','ชุมพร','ระนอง','สุราษฎร์ธานี','นครศรีธรรมราช','พัทลุง','สงขลา','สตูล','ตรัง','ปัตตานี'],
  'ภาคตะวันออกเฉียงเหนือ': ['นครราชสีมา','บุรีรัมย์','สุรินทร์','ศรีสะเกษ','อุบลราชธานี','ยโสธร','ชัยภูมิ','อำนาจเจริญ','หนองบัวลำภู','ขอนแก่น','อุดรธานี','เลย','หนองคาย','มหาสารคาม','ร้อยเอ็ด','กาฬสินธุ์','สกลนคร','นครพนม','มุกดาหาร','บึงกาฬ'],
  'ภาคตะวันออก': ['ชลบุรี','ระยอง','จันทบุรี','ตราด','ฉะเชิงเทรา','ปราจีนบุรี','นครนายก','สระแก้ว'],
  'ภาคใต้': ['ภูเก็ต','พังงา','กระบี่','ตรัง','สงขลา','สตูล','ปัตตานี','ยะลา','นราธิวาส','นครศรีธรรมราช','พัทลุง','สุราษฎร์ธานี','ชุมพร','ระนอง'],
}

const REGION_COLORS: Record<string, string> = {
  'ภาคเหนือ': 'bg-blue-50 border-blue-200',
  'ภาคกลาง': 'bg-green-50 border-green-200',
  'ภาคตะวันออกเฉียงเหนือ': 'bg-orange-50 border-orange-200',
  'ภาคตะวันออก': 'bg-yellow-50 border-yellow-200',
  'ภาคใต้': 'bg-purple-50 border-purple-200',
}

export default function ServiceAreasPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [openRegions, setOpenRegions] = useState<Record<string, boolean>>({
    'ภาคเหนือ': false,
    'ภาคกลาง': false,
    'ภาคตะวันออกเฉียงเหนือ': false,
    'ภาคตะวันออก': false,
    'ภาคใต้': false,
  })

  useEffect(() => {
    api.get<any>('/api/technicians/me/service-areas').then(r => {
      if (r.success) setSelected(r.areas?.map((a: any) => a.province) || [])
      setLoading(false)
    })
  }, [])

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
      if (select) {
        const merged = [...new Set([...prev, ...provinces])]
        return merged
      } else {
        return prev.filter(p => !provinces.includes(p))
      }
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
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert('บันทึกไม่สำเร็จ: ' + (res.error || '未知错误'))
      }
    } catch {
      alert('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const totalSelected = selected.length
  const allProvinces = Object.values(REGIONS).flat()
  const allSelected = allProvinces.every(p => selected.includes(p))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h1 className="text-xl font-bold text-gray-900">พื้นที่ให้บริการ</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12 text-gray-400">กำลังโหลด...</div>
        ) : (
          <>
            {/* Header bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">เลือกแล้ว</div>
                <div className="text-2xl font-bold text-blue-600">{totalSelected} <span className="text-base font-normal text-gray-400">/ 77 จังหวัด</span></div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => selectAllInRegion(allProvinces, !allSelected)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  {allSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้ง 77 จังหวัด'}
                </button>
              </div>
            </div>

            {/* Region accordions */}
            <div className="space-y-3">
              {Object.entries(REGIONS).map(([region, provinces]) => {
                const selectedInRegion = provinces.filter(p => selected.includes(p)).length
                const allInRegion = provinces.every(p => selected.includes(p))
                const isOpen = openRegions[region]
                const colorClass = REGION_COLORS[region] || 'bg-gray-50 border-gray-200'

                return (
                  <div key={region} className={`rounded-2xl border ${colorClass} overflow-hidden`}>
                    {/* Region header */}
                    <button
                      onClick={() => toggleRegion(region)}
                      className="w-full px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                          ${region === 'ภาคเหนือ' ? 'bg-blue-100 text-blue-700' :
                            region === 'ภาคกลาง' ? 'bg-green-100 text-green-700' :
                            region === 'ภาคตะวันออกเฉียงเหนือ' ? 'bg-orange-100 text-orange-700' :
                            region === 'ภาคตะวันออก' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-purple-100 text-purple-700'}`}>
                          {selectedInRegion}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{region}</div>
                          <div className="text-xs text-gray-500">{provinces.length} จังหวัด</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); selectAllInRegion(provinces, !allInRegion) }}
                          className={`text-xs px-2.5 py-1 rounded-lg border-2 transition-colors
                            ${allInRegion
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500'}`}
                        >
                          {allInRegion ? 'ยกเลิก' : 'เลือกทั้งหมด'}
                        </button>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Province grid */}
                    {isOpen && (
                      <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {provinces.map(province => {
                          const isChecked = selected.includes(province)
                          return (
                            <button
                              key={province}
                              onClick={() => toggle(province)}
                              className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all border-2
                                ${isChecked
                                  ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                            >
                              <span className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                                  ${isChecked ? 'border-white' : 'border-gray-300'}`}>
                                  {isChecked && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </span>
                                {province}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Save button */}
            <div className="mt-6 sticky bottom-4">
              <button
                onClick={handleSave}
                disabled={saving || totalSelected === 0}
                className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg transition-all
                  ${saving
                    ? 'bg-gray-400 text-white'
                    : totalSelected === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : saved
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
              >
                {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกสำเร็จ!' : `บันทึก (${totalSelected} จังหวัด)`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
