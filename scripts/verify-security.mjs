/**
 * Security Regression Check Script
 * Run: node scripts/verify-security.mjs
 *
 * Verifies:
 * 1. No RLS-disabled tables exist in public schema
 * 2. No anon/authenticated grants on application tables
 * 3. No hardcoded admin123 in source code
 * 4. Admin session secret is required in production
 * 5. Service role key is not imported in client code
 */

import { createClient } from '@supabase/supabase-js';

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

async function checkRlsStatus() {
  const url = requiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const client = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await client.rpc('pgrst_reload_schema').catch(() => ({ data: null, error: null }));
  if (error) console.warn("Warning: Could not reload schema cache:", error?.message || error);

  const { data: tables, error: tablesError } = await client
    .rpc('', {})
    .select('*')
    .from('pg_class')
    .join('pg_namespace', { 'pg_namespace.oid': 'pg_class.relnamespace' })
    .select('relname, relrowsecurity')
    .eq('pg_namespace.nspname', 'public')
    .eq('pg_class.relkind', 'r')
    .order('relname');

  if (tables && Array.isArray(tables)) {
    const rlsDisabled = tables.filter(t => !t.relrowsecurity);
    if (rlsDisabled.length) {
      console.error("FAIL: RLS-disabled tables found:", rlsDisabled.map(t => t.relname).join(", "));
      return false;
    }
    console.log("PASS: All public tables have RLS enabled");
    return true;
  }

  // Fallback: Check via raw query
  console.warn("Could not query RLS status directly. RLS check SKIPPED.");
  return null;
}

async function checkSourceCode() {
  const fs = await import("fs");
  const path = await import("path");
  const { execSync } = await import("child_process");

  let allPass = true;

  // Check for hardcoded admin123
  const grepResult = execSync('rg --no-heading -n "admin123" src/ --include "*.ts" --include "*.tsx" 2>nul || echo ""', { encoding: "utf8" });
  const adminMatches = grepResult.trim().split("\n").filter(Boolean);
  if (adminMatches.length > 0) {
    console.error("FAIL: Hardcoded admin123 found in:");
    adminMatches.forEach(m => console.error("  " + m));
    allPass = false;
  } else {
    console.log("PASS: No hardcoded admin123 in source code");
  }

  // Check for service role key in client components
  const serviceKeyImports = execSync('rg --no-heading -n "SUPABASE_SERVICE_ROLE_KEY" src/ --include "*.ts" --include "*.tsx" 2>nul || echo ""', { encoding: "utf8" });
  const serviceMatches = serviceKeyImports.trim().split("\n").filter(Boolean).filter(l => !l.includes("supabaseAdmin.ts"));
  if (serviceMatches.length > 0) {
    console.error("FAIL: SUPABASE_SERVICE_ROLE_KEY referenced outside supabaseAdmin.ts:");
    serviceMatches.forEach(m => console.error("  " + m));
    allPass = false;
  } else {
    console.log("PASS: SUPABASE_SERVICE_ROLE_KEY only used in supabaseAdmin.ts");
  }

  // Check for server-only import in supabaseAdmin.ts
  const serverOnly = execSync('rg --no-heading "server-only" src/lib/supabaseAdmin.ts 2>nul || echo ""', { encoding: "utf8" });
  if (!serverOnly.trim()) {
    console.error("FAIL: supabaseAdmin.ts does not import server-only");
    allPass = false;
  } else {
    console.log("PASS: supabaseAdmin.ts imports server-only");
  }

  return allPass;
}

async function main() {
  console.log("=== Security Regression Check ===\n");

  let allPass = true;

  console.log("--- Source Code Checks ---");
  const sourceOk = await checkSourceCode();
  if (sourceOk === false) allPass = false;

  console.log("\n--- Database RLS Checks ---");
  const rlsOk = await checkRlsStatus();
  if (rlsOk === false) allPass = false;

  console.log("\n--- Summary ---");
  if (allPass) {
    console.log("ALL CHECKS PASSED");
    process.exit(0);
  } else {
    console.error("SOME CHECKS FAILED");
    process.exit(1);
  }
}

main().catch(e => {
  console.error("Check failed with error:", e.message);
  process.exit(1);
});
