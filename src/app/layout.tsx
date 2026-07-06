import type { Metadata } from 'next'
import './globals.css'
import { Suspense } from 'react'
import TokenHandler from '@/components/TokenHandler'

export const metadata: Metadata = {
  title: 'Beefix Technician',
  description: 'แอปสำหรับช่าง Beefix',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <Suspense>{children}</Suspense>
        <TokenHandler />
      </body>
    </html>
  )
}
