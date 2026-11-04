import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'
import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import AuthSync from '@/components/common/AuthSync'
import { Toaster } from 'sonner'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'EngY - Học Tiếng Anh Thông Minh Cho TOEIC & Sinh Viên Y',
  description: 'Nền tảng học tiếng Anh chuyên biệt dành cho luyện thi TOEIC và sinh viên ngành Y khoa. Minigames tương tác, Spaced Repetition, ghi chú tiện lợi.',
  keywords: ['học tiếng anh', 'TOEIC', 'tiếng anh y khoa', 'medical english', 'minigames', 'spaced repetition'],
  icons: {
    icon: [
      { url: '/EngYfavicon.png', type: 'image/png' },
    ],
    shortcut: '/EngYfavicon.png',
    apple: '/EngYfavicon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/EngYfavicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/EngYfavicon.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#fafdf9] text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
        <AuthSync />
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
