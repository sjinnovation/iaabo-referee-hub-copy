#!/usr/bin/env node

/**
 * Migration Repair Script
 * Helps fix common migration history mismatches
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = './supabase/migrations';

console.log('🔧 Migration Repair Tool\n');

// Get all local migration files
const getMigrationFiles = () => {
  try {
    const output = execSync(`ls -1 ${MIGRATIONS_DIR}`, { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f.endsWith('.sql'));
  } catch (error) {
    console.error('❌ Error reading migrations directory:', error.message);
    process.exit(1);
  }
};

// Get migration status
const getMigrationStatus = () => {
  try {
    console.log('📊 Checking migration status...\n');
    const output = execSync('supabase migration list', { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error('❌ Error getting migration status:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Supabase CLI is installed');
    console.error('  2. You are linked to a project (supabase link)');
    console.error('  3. You have network connectivity');
    process.exit(1);
  }
};

// Parse migration list output
const parseMigrationList = (output) => {
  const lines = output.split('\n');
  const migrations = [];
  
  for (const line of lines) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 3 && parts[0] && parts[0] !== 'Local') {
      migrations.push({
        local: parts[0],
        remote: parts[1],
        time: parts[2]
      });
    }
  }
  
  return migrations;
};

// Main repair function
const repairMigrations = () => {
  const status = getMigrationStatus();
  const migrations = parseMigrationList(status);
  
  const needsRepair = migrations.filter(m => !m.remote && m.local);
  const remoteOnly = migrations.filter(m => m.remote && !m.local);
  
  if (needsRepair.length === 0 && remoteOnly.length === 0) {
    console.log('✅ All migrations are in sync! No repair needed.\n');
    return;
  }
  
  console.log('\n📋 Migration Analysis:\n');
  
  if (remoteOnly.length > 0) {
    console.log('⚠️  Migrations on remote but not local:');
    remoteOnly.forEach(m => console.log(`   - ${m.remote}`));
    console.log('\n💡 To fix: Run npm run db:pull to sync local files\n');
  }
  
  if (needsRepair.length > 0) {
    console.log('⚠️  Migrations local but not on remote:');
    needsRepair.forEach(m => console.log(`   - ${m.local}`));
    console.log('\n💡 To fix: Run npm run db:push:all to push all migrations\n');
  }
  
  console.log('🔧 Suggested repair commands:\n');
  
  if (remoteOnly.length > 0) {
    remoteOnly.forEach(m => {
      console.log(`   supabase migration repair --status reverted ${m.remote}`);
    });
  }
  
  if (needsRepair.length > 0) {
    console.log(`   npm run db:push:all`);
  }
  
  console.log('\n');
};

// Run the repair check
repairMigrations();
