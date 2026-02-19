/**
 * ExpressScheme — Supabase Schema Setup Script
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> node setup-db.mjs
 *
 * Get your service role key from:
 *   https://supabase.com/dashboard/project/rjusxfiprkfnaitdgkmv/settings/api
 *   → "service_role (secret)" key
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL      = 'https://rjusxfiprkfnaitdgkmv.supabase.co'
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
  console.error('    Run: SUPABASE_SERVICE_ROLE_KEY=<your-key> node setup-db.mjs\n')
  process.exit(1)
}

// Read the SQL schema file
const sqlPath = join(__dirname, 'supabase', 'schema.sql')
const sql     = readFileSync(sqlPath, 'utf8')

async function runSQL(statement) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey':         SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ query: statement }),
  })
  return res
}

async function main() {
  console.log('\n🔧  ExpressScheme — Database Setup')
  console.log('━'.repeat(50))
  console.log(`📡  Project : ${SUPABASE_URL}`)
  console.log(`📄  Schema  : ${sqlPath}\n`)

  // Split SQL into individual statements and run each
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let passed = 0
  let failed = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';'
    const preview = stmt.split('\n')[0].substring(0, 60)
    process.stdout.write(`  [${String(i+1).padStart(3,'0')}] ${preview}… `)

    try {
      // Use the Postgres endpoint directly
      const r = await fetch(`${SUPABASE_URL}/pg/query`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey':         SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ query: stmt }),
      })

      if (r.ok) {
        console.log('✅')
        passed++
      } else {
        const err = await r.json()
        const msg = err?.message || err?.error || JSON.stringify(err)
        // Ignore "already exists" errors (idempotent)
        if (msg.includes('already exists') || msg.includes('duplicate')) {
          console.log('⚠️  (already exists)')
          passed++
        } else {
          console.log(`❌  ${msg}`)
          failed++
        }
      }
    } catch (e) {
      console.log(`❌  ${e.message}`)
      failed++
    }
  }

  console.log('\n' + '━'.repeat(50))
  console.log(`✅  Passed : ${passed}`)
  console.log(`❌  Failed : ${failed}`)

  if (failed === 0) {
    console.log('\n🎉  Database schema created successfully!')
    console.log('    Tables: users, schemes, applications, documents,')
    console.log('            ai_verifications, tokens, transactions,')
    console.log('            bridge_batches, fraud_flags, audit_logs,')
    console.log('            scheme_stats, notifications\n')
  } else {
    console.log('\n⚠️   Some statements failed. Check errors above.')
    console.log('    You can also paste supabase/schema.sql into the')
    console.log('    Supabase SQL Editor: https://supabase.com/dashboard/project/rjusxfiprkfnaitdgkmv/sql\n')
  }
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
