import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-[#0b141a] font-sans text-[#e9edef]">
      <p className="text-lg">APP OTP</p>
      <Link
        href="/webhook-logs"
        className="rounded-lg bg-[#00a884] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#06cf9c]"
      >
        View webhook logs
      </Link>
    </main>
  )
}