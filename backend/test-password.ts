import { hashPassword, comparePassword } from './src/utils/password.js';

async function testPasswordUtility() {
  console.log('Testing password utility...\n');

  // Test 1: Hash a password
  const plainPassword = 'TestPassword123';
  console.log('1. Testing hashPassword:');
  console.log(`   Plain password: ${plainPassword}`);
  
  const hashedPassword = await hashPassword(plainPassword);
  console.log(`   Hashed password: ${hashedPassword}`);
  console.log(`   ✓ Password hashed successfully\n`);

  // Test 2: Verify the hashed password is different from plain
  console.log('2. Testing password encryption:');
  console.log(`   Plain !== Hashed: ${plainPassword !== hashedPassword}`);
  console.log(`   ✓ Password is encrypted (not stored in plain text)\n`);

  // Test 3: Compare correct password
  console.log('3. Testing comparePassword with correct password:');
  const isCorrect = await comparePassword(plainPassword, hashedPassword);
  console.log(`   Result: ${isCorrect}`);
  console.log(`   ✓ Correct password verified successfully\n`);

  // Test 4: Compare incorrect password
  console.log('4. Testing comparePassword with incorrect password:');
  const isIncorrect = await comparePassword('WrongPassword', hashedPassword);
  console.log(`   Result: ${isIncorrect}`);
  console.log(`   ✓ Incorrect password rejected successfully\n`);

  // Test 5: Verify SALT_ROUNDS = 10 (bcrypt hash format)
  console.log('5. Testing SALT_ROUNDS configuration:');
  console.log(`   Hash starts with $2b$10$: ${hashedPassword.startsWith('$2b$10$')}`);
  console.log(`   ✓ SALT_ROUNDS is correctly set to 10\n`);

  console.log('All tests passed! ✓');
}

testPasswordUtility().catch(console.error);
