import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '~~/server/database/schema'

const sqlite = new Database('sqlite.db')

export const useDrizzle = () => drizzle(sqlite, { schema })

export type Db = ReturnType<typeof useDrizzle>

export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]