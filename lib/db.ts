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

export async function insertWebhookPayload(payload: object): Promise<number> {
  const pool = getPool()
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    'INSERT INTO webhook_logs (payload) VALUES (?)',
    [JSON.stringify(payload)]
  )

  return result.insertId
}
