import { neon } from '@neondatabase/serverless'
import { database_person, test_adapter } from '@persontric/adapter-test'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { NeonHTTPAdapter } from '../driver/neon-http.js'
dotenv.config({
	path: resolve('.env')
})
const sql = neon(process.env.NEON_CONNECTION_URL!)
await sql('DROP TABLE IF EXISTS public.session')
await sql('DROP TABLE IF EXISTS public.person')
await sql(`
	CREATE TABLE public.person (
		id       TEXT PRIMARY KEY,
		login TEXT NOT NULL UNIQUE)`)
await sql(`
	CREATE TABLE public.session (
		id         TEXT PRIMARY KEY,
		person_id    TEXT        NOT NULL REFERENCES public.person (id),
		expire_dts TIMESTAMPTZ NOT NULL,
		country    TEXT        NOT NULL)`)
await sql(`INSERT INTO public.person (id, login)
					 VALUES ($1, $2)`, [
	database_person.id,
	database_person.attributes.login
])
const adapter = new NeonHTTPAdapter(sql, {
	person: 'public.person',
	session: 'public.session'
})
await test_adapter(adapter)
await sql('DROP TABLE public.session')
await sql('DROP TABLE public.person')
process.exit()
declare module 'persontric' {
	interface Register {
		DatabasePersonAttributes:{
			login:string
		}
	}
}
