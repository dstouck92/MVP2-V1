#!/usr/bin/env node
/**
 * List all users from Supabase: User ID and Username
 * Run from server dir: node list-users.js
 * (Ensure server/.env has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('users')
  .select('id, username')
  .order('username');

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

console.log('\n--- Herd App Users ---\n');
console.log('User ID\t\t\t\t\tUsername');
console.log('-'.repeat(80));
for (const row of data || []) {
  console.log(`${row.id}\t${row.username}`);
}
console.log(`\nTotal: ${(data || []).length} users\n`);
