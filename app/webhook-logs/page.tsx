'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

type WebhookLog = {
  id: number
  payload: unknown
  createdAt: string
}

function formatPayload(payload: unknown): string {
  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return String(payload)
  }
}

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/webhook-logs?limit=50')
      const data = (await res.json()) as {
        success: boolean
        logs?: WebhookLog[]
        message?: string
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? 'Failed to load webhook logs')
      }

      setLogs(data.logs ?? [])
      if (data.logs?.length) {
        setExpandedId(data.logs[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLogs()
  }, [loadLogs])

  return (
    <main className="min-h-screen bg-[#0b141a] text-[#e9edef]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Webhook logs</h1>
            <p className="mt-1 text-sm text-[#8696a0]">
              Saved payloads from{' '}
              <code className="rounded bg-[#202c33] px-1.5 py-0.5 text-xs">
                /api/whatsapp/webhook
              </code>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadLogs()}
              disabled={loading}
              className="rounded-lg bg-[#00a884] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#06cf9c] disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <Link
              href="/"
              className="rounded-lg border border-[#2a3942] px-4 py-2 text-sm text-[#e9edef] transition hover:bg-[#202c33]"
            >
              Home
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <p className="rounded-lg border border-[#2a3942] bg-[#111b21] px-4 py-8 text-center text-[#8696a0]">
            No webhook payloads yet. POST to the webhook endpoint to create
            entries.
          </p>
        )}

        <ul className="space-y-3">
          {logs.map((log) => {
            const open = expandedId === log.id
            const preview =
              typeof log.payload === 'object' && log.payload !== null
                ? Object.keys(log.payload as object).slice(0, 4).join(', ') ||
                  'object'
                : String(log.payload).slice(0, 80)

            return (
              <li
                key={log.id}
                className="overflow-hidden rounded-lg border border-[#2a3942] bg-[#111b21]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(open ? null : log.id)
                  }
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-[#202c33]"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-sm text-[#00a884]">
                      #{log.id}
                    </span>
                    <span className="ml-3 text-xs text-[#8696a0]">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    {!open && (
                      <p className="mt-1 truncate text-xs text-[#8696a0]">
                        {preview}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[#8696a0]">
                    {open ? '▼' : '▶'}
                  </span>
                </button>

                {open && (
                  <pre className="max-h-[28rem] overflow-auto border-t border-[#2a3942] bg-[#0b141a] p-4 font-mono text-xs leading-relaxed text-[#d1d7db]">
                    {formatPayload(log.payload)}
                  </pre>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
