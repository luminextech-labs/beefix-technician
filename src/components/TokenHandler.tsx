'use client'
import { useEffect, Suspense } from 'react'
import { authApi } from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'

function TokenHandlerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      authApi.setToken(token)
      const cleanUrl = window.location.pathname
      router.replace(cleanUrl)
    }
  }, [])

  return null
}

export default function TokenHandler() {
  return (
    <Suspense fallback={null}>
      <TokenHandlerInner />
    </Suspense>
  )
}
