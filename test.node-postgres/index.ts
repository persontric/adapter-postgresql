import { database_person, test_adapter } from '@persontric/adapter-test'
import dotenv from 'dotenv'
import { resolve } from 'path'
import pg from 'pg'
import { NodePostgresAdapter } from '../driver/node-postgres.js'
dotenv.config({
	path: resolve('.env')
})
const pool = new pg.Pool({
	connectionString: process.env.POSTGRES_DATABASE_URL
})
await pool.query('DROP TABLE IF EXISTS public.session')
await pool.query('DROP TABLE IF EXISTS public.person')
await pool.query(`
	CREATE TABLE public.person (
		id       TEXT PRIMARY KEY,
		login TEXT NOT NULL UNIQUE)`)
await pool.query(`
	CREATE TABLE public.session (
		id         TEXT PRIMARY KEY,
		user_id    TEXT        NOT NULL REFERENCES public.person (id),
		expires_at TIMESTAMPTZ NOT NULL,
		country    TEXT        NOT NULL)`)
await pool.query(`INSERT INTO public.person (id, login)
									VALUES ($1, $2)`, [
	database_person.id,
	database_person.attributes.login
])
const adapter = new NodePostgresAdapter(pool, {
	person: 'public.person',
	session: 'public.session'
})
await test_adapter(adapter)
await pool.query('DROP TABLE public.session')
await pool.query('DROP TABLE public.person')
process.exit()
declare module 'persontric' {
	interface Register {
		DatabasePersonAttributes:{
			login:string
		}
	}
}
