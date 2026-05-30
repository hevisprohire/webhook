'use client'

import { useState } from 'react'

export default function HomePage() {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState('')

  function showMessage(text: string, type: 'success' | 'error' | 'info') {
    setMessage(text)
    setMessageType(type)
  }

  function formatMobile(value: string) {
    const digits = value.replace(/\D/g, '')
    if (value.startsWith('+')) return value
    if (digits.startsWith('91') && digits.length > 10) return `+${digits}`
    return `+91${digits}`
  }

  async function sendOtp() {
    if (!mobile.trim()) {
      showMessage('Please enter your mobile number', 'error')
      return
    }

    setLoading(true)
    showMessage('', 'info')

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: formatMobile(mobile) }),
      })

      const data = await response.json()
      showMessage(data.message, data.success ? 'success' : 'error')

      if (data.success) {
        setStep(2)
        setOtp('')
        setDevOtp(data.devOtp ?? '')
        if (data.devOtp) setOtp(data.devOtp)
      }
    } catch {
      showMessage('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    if (!otp.trim()) {
      showMessage('Please enter the OTP', 'error')
      return
    }

    setLoading(true)
    showMessage('', 'info')

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: formatMobile(mobile), otp }),
      })

      const data = await response.json()
      showMessage(data.message, data.success ? 'success' : 'error')

      if (data.success) {
        setStep(1)
        setOtp('')
        setDevOtp('')
      }
    } catch {
      showMessage('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function goBack() {
    setStep(1)
    setOtp('')
    setDevOtp('')
    showMessage('', 'info')
  }

  const maskedMobile =
    mobile.length > 4
      ? `${mobile.slice(0, -4).replace(/\d/g, '•')}${mobile.slice(-4)}`
      : mobile

  return (
    <main className='relative min-h-screen overflow-hidden bg-[#0b141a] font-sans'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#25D366]/20 blur-3xl' />
        <div className='absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#128C7E]/25 blur-3xl' />
        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]' />
      </div>

      <div className='relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6'>
        <div className='w-full max-w-md'>
          <div className='mb-6 flex items-center justify-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366] shadow-lg shadow-[#25D366]/30'>
              <WhatsAppIcon />
            </div>
            <div>
              <p className='text-xs font-medium uppercase tracking-widest text-[#25D366]'>
                Secure login
              </p>
              <h1 className='text-xl font-semibold text-white sm:text-2xl'>
                WhatsApp OTP
              </h1>
            </div>
          </div>

          <div className='overflow-hidden rounded-3xl border border-white/10 bg-[#111b21]/90 shadow-2xl shadow-black/40 backdrop-blur-xl'>
            <div className='border-b border-white/10 px-6 py-4'>
              <div className='flex items-center justify-between gap-4'>
                <StepBadge number={1} label='Phone' active={step === 1} done={step > 1} />
                <div className='h-px flex-1 bg-white/10'>
                  <div
                    className={`h-full bg-[#25D366] transition-all duration-500 ${
                      step === 2 ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
                <StepBadge number={2} label='Verify' active={step === 2} done={false} />
              </div>
            </div>

            <div className='flex flex-col gap-5 p-6 sm:p-8'>
              {step === 1 ? (
                <>
                  <div>
                    <h2 className='text-lg font-semibold text-white'>
                      Enter your number
                    </h2>
                    <p className='mt-1 text-sm text-[#8696a0]'>
                      We&apos;ll send a one-time code on WhatsApp
                    </p>
                  </div>

                  <label className='flex flex-col gap-2'>
                    <span className='text-xs font-medium uppercase tracking-wide text-[#8696a0]'>
                      Mobile number
                    </span>
                    <div className='flex overflow-hidden rounded-xl border border-white/10 bg-[#0b141a] focus-within:border-[#25D366]/60 focus-within:ring-2 focus-within:ring-[#25D366]/20'>
                      <span className='flex items-center border-r border-white/10 bg-white/5 px-3 text-sm text-[#8696a0]'>
                        +91
                      </span>
                      <input
                        type='tel'
                        inputMode='numeric'
                        placeholder='98765 43210'
                        value={mobile}
                        onChange={(e) =>
                          setMobile(e.target.value.replace(/[^\d+\s-]/g, ''))
                        }
                        className='w-full bg-transparent px-4 py-3.5 text-white outline-none placeholder:text-[#54656f]'
                      />
                    </div>
                  </label>

                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-semibold text-[#0b141a] transition hover:bg-[#20bd5a] disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {loading ? <Spinner /> : null}
                    {loading ? 'Sending…' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <h2 className='text-lg font-semibold text-white'>
                      Enter verification code
                    </h2>
                    <p className='mt-1 text-sm text-[#8696a0]'>
                      Code sent to{' '}
                      <span className='font-medium text-[#e9edef]'>
                        {maskedMobile || mobile}
                      </span>
                    </p>
                  </div>

                  {devOtp ? (
                    <div className='rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200'>
                      <p className='font-medium'>Dev mode (template not approved)</p>
                      <p className='mt-1 font-mono text-lg tracking-widest text-amber-100'>
                        {devOtp}
                      </p>
                      <p className='mt-1 text-xs text-amber-200/80'>
                        WhatsApp message skipped. Use this OTP to test verify.
                      </p>
                    </div>
                  ) : null}

                  <label className='flex flex-col gap-2'>
                    <span className='text-xs font-medium uppercase tracking-wide text-[#8696a0]'>
                      6-digit OTP
                    </span>
                    <input
                      type='text'
                      inputMode='numeric'
                      maxLength={6}
                      placeholder='• • • • • •'
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      className='w-full rounded-xl border border-white/10 bg-[#0b141a] px-4 py-3.5 text-center text-2xl font-semibold tracking-[0.5em] text-white outline-none placeholder:tracking-normal placeholder:text-[#54656f] focus:border-[#25D366]/60 focus:ring-2 focus:ring-[#25D366]/20'
                    />
                  </label>

                  <button
                    onClick={verifyOtp}
                    disabled={loading || otp.length < 6}
                    className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-semibold text-[#0b141a] transition hover:bg-[#20bd5a] disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {loading ? <Spinner /> : null}
                    {loading ? 'Verifying…' : 'Verify OTP'}
                  </button>

                  <button
                    type='button'
                    onClick={goBack}
                    disabled={loading}
                    className='text-sm text-[#8696a0] transition hover:text-[#25D366] disabled:opacity-50'
                  >
                    ← Change number
                  </button>
                </>
              )}

              {message ? (
                <div
                  role='alert'
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    messageType === 'success'
                      ? 'border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366]'
                      : messageType === 'error'
                        ? 'border-red-500/30 bg-red-500/10 text-red-400'
                        : 'border-white/10 bg-white/5 text-[#8696a0]'
                  }`}
                >
                  {message}
                </div>
              ) : null}
            </div>
          </div>

          <p className='mt-6 text-center text-xs text-[#54656f]'>
            OTP expires in 5 minutes · For demo purposes only
          </p>
        </div>
      </div>
    </main>
  )
}

function StepBadge({
  number,
  label,
  active,
  done,
}: {
  number: number
  label: string
  active: boolean
  done: boolean
}) {
  const highlighted = active || done

  return (
    <div className='flex flex-col items-center gap-1.5'>
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
          highlighted
            ? 'bg-[#25D366] text-[#0b141a]'
            : 'bg-white/10 text-[#8696a0]'
        }`}
      >
        {done ? '✓' : number}
      </div>
      <span
        className={`text-[10px] font-medium uppercase tracking-wide ${
          highlighted ? 'text-[#e9edef]' : 'text-[#54656f]'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className='h-4 w-4 animate-spin'
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      />
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
      />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      className='h-6 w-6 text-[#0b141a]'
      fill='currentColor'
      aria-hidden
    >
      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
    </svg>
  )
}
