import mysql from 'mysql2/promise'

declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: mysql.Pool | undefined
}

function createPool() {
  const host = process.env.DB_HOST
  const user = process.env.DB_USER
  const password = process.env.DB_PASS
  const database = process.env.DB_NAME
  const port = Number(process.env.DB_PORT ?? 3306)

  if (!host || !user || !password || !database) {
    throw new Error(
      'Database credentials missing. Set DB_HOST, DB_USER, DB_PASS, and DB_NAME in .env.local'
    )
  }

  return mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
  })
}

export function getPool(): mysql.Pool {
  if (!global.mysqlPool) {
    global.mysqlPool = createPool()
  }
  return global.mysqlPool
}

export type WebhookLog = {
  id: number
  payload: unknown
  createdAt: string
}

function parseStoredPayload(value: unknown): unknown {
  if (value == null) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as unknown
    } catch {
      return value
    }
  }
  if (Buffer.isBuffer(value)) {
    return JSON.parse(value.toString('utf8')) as unknown
  }
  return value
}

export async function listWebhookLogs(limit = 50): Promise<WebhookLog[]> {
  const pool = getPool()
  const safeLimit = Math.min(Math.max(limit, 1), 100)

  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT id, payload, created_at FROM webhook_logs ORDER BY id DESC LIMIT ?',
    [safeLimit]
  )

  return rows.map((row) => ({
    id: Number(row.id),
    payload: parseStoredPayload(row.payload),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }))
}

export async function insertWebhookPayload(payload: object): Promise<number> {
  const pool = getPool()
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    'INSERT INTO webhook_logs (payload) VALUES (?)',
    [JSON.stringify(payload)]
  )

  return result.insertId
}
