#!/usr/bin/env node

/**
 * Database Verification Script
 * Checks if the member progression system is properly installed
 */

import { execSync } from 'child_process';

console.log('🔍 Verifying Database Setup\n');
console.log('Checking member progression system...\n');

const queries = [
  {
    name: 'Member Progression Table',
    query: "SELECT COUNT(*) as count FROM member_progression;",
    description: 'Checking if member_progression table exists and has data'
  },
  {
    name: 'Progression Functions',
    query: "SELECT proname FROM pg_proc WHERE proname IN ('initialize_member_progression', 'update_progression_step', 'get_member_progression_summary');",
    description: 'Checking if progression functions exist'
  },
  {
    name: 'Progression Enums',
    query: "SELECT typname FROM pg_type WHERE typname IN ('progression_status', 'progression_step_type');",
    description: 'Checking if progression enum types exist'
  },
  {
    name: 'Progression Triggers',
    query: "SELECT tgname FROM pg_trigger WHERE tgname LIKE '%progression%';",
    description: 'Checking if automatic triggers are set up'
  },
  {
    name: 'Members with Progression',
    query: "SELECT COUNT(DISTINCT user_id) as members_with_progression FROM member_progression;",
    description: 'Counting members with progression records'
  },
  {
    name: 'Progression Summary',
    query: "SELECT step_type, status, COUNT(*) as count FROM member_progression GROUP BY step_type, status ORDER BY step_type, status;",
    description: 'Summary of progression statuses'
  }
];

const runQuery = (query) => {
  try {
    const escapedQuery = query.replace(/"/g, '\\"');
    const result = execSync(
      `supabase db execute --query "${escapedQuery}"`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

let allPassed = true;

queries.forEach((item, index) => {
  console.log(`\n${index + 1}. ${item.name}`);
  console.log(`   ${item.description}`);
  
  const result = runQuery(item.query);
  
  if (result.success) {
    console.log('   ✅ Success');
    if (result.output && result.output.trim()) {
      console.log(`   Result: ${result.output.trim().substring(0, 200)}`);
    }
  } else {
    console.log('   ❌ Failed');
    console.log(`   Error: ${result.error}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('\n✅ All checks passed! Member progression system is properly installed.\n');
  console.log('Next steps:');
  console.log('  1. Test the member dashboard: Login and check "Your Progression"');
  console.log('  2. Test with new registration: Create a test account');
  console.log('  3. Test admin component: Integrate MemberProgressionManager\n');
} else {
  console.log('\n⚠️  Some checks failed. The member progression system may not be fully installed.\n');
  console.log('To fix:');
  console.log('  1. Run: npm run db:migration:repair');
  console.log('  2. Run: npm run db:push:all');
  console.log('  3. Run: npm run db:verify (this script) again\n');
}

console.log('For detailed documentation, see:');
console.log('  - docs/member-progression.md');
console.log('  - docs/TESTING_GUIDE.md');
console.log('  - docs/ADMIN_QUICK_REFERENCE.md\n');
